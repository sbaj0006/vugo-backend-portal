import { db } from '@/db/db';
import { Connection, In, InsertResult, Like, Not, Repository, DeleteResult } from 'typeorm';
import { PromotionCode } from '../db/entities/PromotionCode';
import { Promotion } from '../db/entities/Promotion';

class PromotionCodeServiceClass {
  public promotionCodeRepo: Repository<PromotionCode>;
  private conn: Connection;

  public insert = async (promotion: Promotion, code: string): Promise<PromotionCode> => {
    await this.connect();
    const result = {
      promotion: promotion,
      code: code,
      active: true,
    };
    const insertResult = await this.promotionCodeRepo.insert(result);
    return this.promotionCodeRepo.findOne(insertResult.identifiers[0].id);
  };

  public getCodeDetails = async (promotionCode: string, promotionId: number): Promise<PromotionCode> => {
    await this.connect();
    const result = await this.promotionCodeRepo
      .createQueryBuilder('code')
      .where('code.code = :code', { code: promotionCode })
      .andWhere('promotion.id = :id', { id: promotionId })
      .select([
        'code.id',
        'code.code',
        'code.active',
        'code.email',
        'code.token',
        'promotion.id',
        'promotion.urlName',
        'promotion.startDateTime',
        'promotion.endDateTime',
        'promotion.logoUrl',
        'promotion.splashImageUrl',
        'promotion.states',
        'promotion.name',
        'title.titleId',
        'title.titleUuid',
        'title.titleName',
      ])
      .leftJoin('code.promotion', 'promotion')
      .leftJoin('promotion.title', 'title')
      .getOne();
    return result;
  };

  public redeemCode = async (
    id: number,
    updateResult: Partial<PromotionCode>,
  ): Promise<PromotionCode> => {
    await this.connect();
    await this.promotionCodeRepo.update(id, updateResult);
    return this.promotionCodeRepo.findOne(id);
  };

  public verifyToken = async (token: string): Promise<PromotionCode> => {
    await this.connect();
    const result = await this.promotionCodeRepo.findOne({ where: { token: token } });
    return result;
  };

  public deleteCodes = async (promotionId: number): Promise<void> => {
    await this.connect();
    const codes = await this.promotionCodeRepo
      .createQueryBuilder()
      .delete()
      .from(PromotionCode)
      .where('promotion = :id', { id: promotionId })
      .execute();
  };

  private connect = async (): Promise<void> => {
    this.conn = await db.connect();
    if (!this.promotionCodeRepo) {
      this.promotionCodeRepo = this.conn.getRepository(PromotionCode);
    }
  };
}

export const PromotionCodeService = new PromotionCodeServiceClass();
