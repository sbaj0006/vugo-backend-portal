import { db } from '@/db/db';
import { Connection, In, InsertResult, Like, Not, Repository, DeleteResult } from 'typeorm';
import { TitleMetadata } from '../db/entities/TitleMetadata';
import { RailTitles } from '../db/entities/RailTitles';
import { Rail } from '../db/entities/Rail';

class RailTitleServiceClass {
  public railTitleRepo: Repository<RailTitles>;
  private conn: Connection;

  public insert = async (rail: Rail, titleMetaData: TitleMetadata): Promise<RailTitles> => {
    await this.connect();
    const railTitles: Partial<RailTitles> = {
      rail: rail,
      titleMetaData: titleMetaData,
    };
    const insertResult = await this.railTitleRepo.insert(railTitles);

    return this.railTitleRepo.findOne(insertResult.identifiers[0].id);
  };

  public deleteRailTitles = async (railId: string): Promise<void> => {
    await this.connect();
    const removeWhiteListedIp = await this.railTitleRepo
      .createQueryBuilder()
      .delete()
      .from(RailTitles)
      .where('rail = :rail', { rail: railId })
      .execute();
  };

  public getRailById = async (railId: string): Promise<RailTitles[]> => {
    await this.connect();
    let rail = await this.railTitleRepo.find({ where: { rail: railId }, relations: ['titleMetaData'] });
    return rail;
  };

  private connect = async (): Promise<void> => {
    this.conn = await db.connect();
    if (!this.railTitleRepo) {
      this.railTitleRepo = this.conn.getRepository(RailTitles);
    }
  };
}

export const RailTitleService = new RailTitleServiceClass();
