import { db } from '@/db/db';
import { Connection, In, InsertResult, Like, Not, Repository, DeleteResult } from 'typeorm';
import { TitleMetadata } from '../db/entities/TitleMetadata';
import { CodeRedemption } from '../db/entities/CodeRedemption';
import { PromotionCode } from '../db/entities/PromotionCode';

class CodeRedemptionServiceClass {
  public codeRedemptionRepo: Repository<CodeRedemption>;
  private conn: Connection;

  public insert = async (promotionCode: PromotionCode, date: Date): Promise<CodeRedemption> => {
    await this.connect();
    const result = {
      promotionCode: promotionCode,
      redeemDateTime: date,
    };
    const insertResult = await this.codeRedemptionRepo.insert(result);
    return this.codeRedemptionRepo.findOne(insertResult.identifiers[0].id);
  };

  private connect = async (): Promise<void> => {
    this.conn = await db.connect();
    if (!this.codeRedemptionRepo) {
      this.codeRedemptionRepo = this.conn.getRepository(CodeRedemption);
    }
  };
}

export const CodeRedemptionService = new CodeRedemptionServiceClass();
