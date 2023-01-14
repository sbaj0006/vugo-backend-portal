import { db } from '@/db/db';
import { Connection, In, InsertResult, Like, Not, Repository, DeleteResult } from 'typeorm';
import { SocialAccount } from "@/db/entities/SocialAccount";

class SocialAccountServiceClass {
    public socialAccountRepo: Repository<SocialAccount>;
    private conn: Connection;


    public insert = async (insertData: Partial<SocialAccount>): Promise<SocialAccount> => {
        await this.connect();
        const insertResult = await this.socialAccountRepo.insert(insertData);
        
        return this.socialAccountRepo.findOne(insertResult.identifiers[0].id);
      }
    


    private connect = async (): Promise<void> => {
        this.conn = await db.connect();
        if (!this.socialAccountRepo) {
          this.socialAccountRepo = this.conn.getRepository(SocialAccount);
        }
      };


}

export const SocialAccountService = new SocialAccountServiceClass();