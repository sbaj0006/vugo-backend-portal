import { db } from '@/db/db';
import { Connection, In, InsertResult, Like, Not, Repository, DeleteResult } from 'typeorm';
import { PageLayout } from '../db/entities/PageLayout';
import { VugoPage } from '../enums/VugoPage';

class LayoutServiceClass {
  public layoutRepo: Repository<PageLayout>;
  private conn: Connection;

  public getPageIdByType = async (key: number): Promise<PageLayout> => {
    await this.connect();

    let result = await this.layoutRepo.findOne({ where: { pageType: key }, select: ['id'] });
    return result;
  };

  public getLayoutByType = async (key: number): Promise<PageLayout> => {
    await this.connect();

    let result = await this.layoutRepo.findOne({ where: { pageType: key } });
    return result;
  };

  public upsertPage = async (data: PageLayout): Promise<PageLayout> => {
    await this.connect();
    let page = await this.layoutRepo.findOne({ where: { pageType: data.pageType } });
    if (page == null) {
      const insertResult = await this.layoutRepo.insert(data);
      page = await this.layoutRepo.findOne(insertResult.identifiers[0].id);
    }
    return page;
  };

  private connect = async (): Promise<void> => {
    this.conn = await db.connect();
    if (!this.layoutRepo) {
      this.layoutRepo = this.conn.getRepository(PageLayout);
    }
  };
}

export const LayoutService = new LayoutServiceClass();
