import { db } from '@/db/db';
import { Connection, In, InsertResult, Like, Not, Repository, DeleteResult } from 'typeorm';
import { Promotion } from '../db/entities/Promotion';
import { TitleMetadata } from '../db/entities/TitleMetadata';

class PromotionServiceClass {
  public promotionRepo: Repository<Promotion>;
  private conn: Connection;

  public insert = async (title: TitleMetadata, insertData: Partial<Promotion>): Promise<Promotion> => {
    await this.connect();
    const result = {
      title: title,
      ...insertData,
    };
    const insertResult = await this.promotionRepo.insert(result);
    return this.promotionRepo.findOne(insertResult.identifiers[0].id);
  };

  public getActivePromotionByToken = async (token: string): Promise<Promotion> => {
    await this.connect();
    const currentDate: Date = new Date();
    const promotion = await this.promotionRepo
      .createQueryBuilder('promo')
      .select([
        'promo.id',
        'promo.name',
        'promo.urlName',
        'promo.startDateTime',
        'promo.endDateTime',
        'promo.logoUrl',
        'promo.splashImageUrl',
        'promo.states',
        'title.titleId',
        'title.titleUuid',
        'title.titleName',
        'promotionCodes',
      ])
      .leftJoin('promo.promotionCodes', 'promotionCode')
      .where('promotionCode.token = :token', { token })
      .andWhere('promo.endDateTime > :currentDate', { currentDate: currentDate })
      .getOne();

    return promotion;
  };

  public getAllPromotions = async (): Promise<Promotion[]> => {
    await this.connect();
    // const promotions = await this.promotionRepo.findAndCount({
    //   skip: size * (page - 1),
    //   take: size,
    //   order: {
    //     id: 'DESC',
    //   },
    // });
    const promotions = await this.promotionRepo
      .createQueryBuilder('promo')
      .select([
        'promo.id',
        'promo.name',
        'promo.urlName',
        'promo.startDateTime',
        'promo.endDateTime',
        'promo.logoUrl',
        'promo.splashImageUrl',
        'promo.states',
        'title.titleId',
        'title.titleUuid',
        'title.titleName',
        'title.mediaFile',
        'promotionCodes',
      ])
      .leftJoin('promo.title', 'title')
      .leftJoin('promo.promotionCodes', 'promotionCodes')
      .getMany();
    return promotions;
  };

  public getPromotionById = async (promotionId: number): Promise<Promotion> => {
    await this.connect();
    const promotion = await this.promotionRepo
      .createQueryBuilder('promo')
      .where({ id: promotionId })
      .select([
        'promo.id',
        'promo.name',
        'promo.urlName',
        'promo.startDateTime',
        'promo.endDateTime',
        'promo.logoUrl',
        'promo.splashImageUrl',
        'promo.states',
        'title.titleId',
        'title.titleUuid',
        'title.titleName',
        'title.mediaFile',
        'promotionCodes',
      ])
      .leftJoin('promo.title', 'title')
      .leftJoin('promo.promotionCodes', 'promotionCodes')
      .getOne();
    return promotion;
  };

  public updatePromotionById = async (
    promotionId: number,
    updateData: Partial<Promotion>,
  ): Promise<Promotion> => {
    await this.connect();
    await this.promotionRepo.update(promotionId, updateData);
    return this.promotionRepo.findOne(promotionId);
  };

  public deletePromotions = async (promotionId: number): Promise<void> => {
    await this.connect();
    const codes = await this.promotionRepo
      .createQueryBuilder()
      .delete()
      .from(Promotion)
      .where('id = :id', { id: promotionId })
      .execute();
  };

  public getAllActivePromotions = async (): Promise<Promotion[]> => {
    await this.connect();
    const currentDate: Date = new Date();
    const promotion = await this.promotionRepo
      .createQueryBuilder('promo')
      .where('promo.startDateTime < :currentDate', { currentDate: currentDate })
      .andWhere('promo.endDateTime > :currentDate', { currentDate: currentDate })
      .select([
        'promo.id',
        'promo.name',
        'promo.urlName',
        'promo.startDateTime',
        'promo.endDateTime',
        'promo.logoUrl',
        'promo.splashImageUrl',
        'promo.states',
        'title.titleId',
        'title.titleUuid',
        'title.titleName',
      ])
      .leftJoin('promo.title', 'title')
      .getMany();
    return promotion;
  };

  public getPromotionByName = async (promotionName: string): Promise<Promotion> => {
    await this.connect();
    const name = promotionName.trim().toLowerCase();
    const promotion = await this.promotionRepo
      .createQueryBuilder('promo')
      .where('promo.name = :name', { name: name })
      .orWhere('promo.urlName = :name', { name: name })
      .select([
        'promo.id',
        'promo.name',
        'promo.urlName',
        'promo.startDateTime',
        'promo.endDateTime',
        'promo.logoUrl',
        'promo.splashImageUrl',
        'promo.states',
        'title.titleId',
        'title.titleUuid',
        'title.titleName',
      ])
      .leftJoin('promo.title', 'title')
      .getOne();
    return promotion;
  };

  public getCodeDetails = async (promotionCode: string, promotionId: number): Promise<Promotion> => {
    await this.connect();
    const result = await this.promotionRepo
      .createQueryBuilder('promo')
      .where('promotionCodes.code = :code', { code: promotionCode })
      .andWhere('promo.id = :id', { id: promotionId })
      .select([
        'promo.id',
        'promotionCodes.id',
        'promotionCodes.code',
        'promotionCodes.active',
        'promotionCodes.email',
        'promotionCodes.token',
      ])
      .leftJoin('promo.promotionCodes', 'promotionCodes')
      .getOne();
    return result;
  };

  public listPromotions = async (size = 10, page = 1): Promise<[Promotion[], number]> => {
    await this.connect();
    let result = await this.promotionRepo.findAndCount({
      take: size,
      skip: size * (page - 1),
      order: {
        id: 'DESC',
      },
    });
    result[1] = await this.promotionRepo.count();
    return result;
  };

  // public insert = async (insertData: Partial<Promotion>): Promise<Promotion> => {
  //   await this.connect();
  //   const insertResult = await this.promotionRepo.insert(insertData);

  //   return this.promotionRepo.findOne(insertResult.identifiers[0].id);
  // }

  public get = async (promotionId: number): Promise<Promotion> => {
    await this.connect();
    return await this.promotionRepo.findOne(promotionId);
  };

  public delete = async (promotionId: number): Promise<DeleteResult> => {
    await this.connect();
    const promotion = await this.promotionRepo.findOne(promotionId);
    let deleteResult = await this.promotionRepo.delete(promotionId);

    try {
      await this.promotionRepo.update(promotionId, promotion);
      let deleteResult = await this.promotionRepo.delete(promotionId);
      if (deleteResult.affected == 1) return deleteResult;
    } catch (e) {
      return null;
    }
  };

  public update = async (id: number, updateData: Partial<Promotion>): Promise<Promotion> => {
    await this.connect();
    await this.promotionRepo.update(id, updateData);
    return this.promotionRepo.findOne(id);
  };

  private connect = async (): Promise<void> => {
    this.conn = await db.connect();
    if (!this.promotionRepo) {
      this.promotionRepo = this.conn.getRepository(Promotion);
    }
  };
}

export const PromotionService = new PromotionServiceClass();
