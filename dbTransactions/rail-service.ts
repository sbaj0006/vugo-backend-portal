import { db } from '@/db/db';
import { Connection, Repository } from 'typeorm';
import { Rail } from '../db/entities/Rail';
import { PageLayout } from '../db/entities/PageLayout';

class RailServiceClass {
  public railRepo: Repository<Rail>;
  private conn: Connection;

  public listRailsByLayoutPage = async (pageId: Partial<PageLayout>): Promise<Rail[]> => {
    await this.connect();
    let result = await this.railRepo.find({ where: { pageLayout: pageId } });
    return result;
  };

  public insertRail = async (layout: PageLayout, insertData: Partial<Rail>): Promise<Rail> => {
    await this.connect();
    const rail = {
      pageLayout: layout,
      ...insertData,
    };
    const insertResult = await this.railRepo.insert(rail);
    return this.railRepo.findOne(insertResult.identifiers[0].id);
  };

  public getRailById = async (railId: string): Promise<Rail> => {
    await this.connect();
    let rail = await this.railRepo.findOne({ where: { id: railId } });
    return rail;
  };

  public updatePageRail = async (key: string, updateData: Partial<Rail>): Promise<Rail> => {
    await this.connect();
    const toUpdate = { ...updateData };
    delete toUpdate.railTitles;
    await this.railRepo.update(key, toUpdate);
    return this.railRepo.findOne(key);
  };

  public deleteRail = async (toDelete: Partial<Rail>): Promise<void> => {
    await this.connect();
    await this.railRepo.delete(toDelete.id);
  };

  private connect = async (): Promise<void> => {
    this.conn = await db.connect();
    if (!this.railRepo) {
      this.railRepo = this.conn.getRepository(Rail);
    }
  };
}

export const RailService = new RailServiceClass();
