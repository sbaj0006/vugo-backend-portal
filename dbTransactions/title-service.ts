import { db } from '@/db/db';
import { Connection, In, InsertResult, Like, Not, Repository, DeleteResult } from 'typeorm';
import { TitleMetadata } from "@/db/entities/TitleMetadata";


class TitleMetaDataServiceClass {
    public titleRepo: Repository<TitleMetadata>;
    private conn: Connection;
    private connect = async (): Promise<void> => {
      this.conn = await db.connect();
      if (!this.titleRepo) {
        this.titleRepo = this.conn.getRepository(TitleMetadata);
      }
    };
    public getTitleById = async (titleId: string): Promise<TitleMetadata> => {
      await this.connect();
        return await this.titleRepo.findOne(titleId);
      }
}
export const TitleService = new TitleMetaDataServiceClass();
