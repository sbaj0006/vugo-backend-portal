import { db } from "@/db/db";
import { TitleMetadata } from "@/db/entities/TitleMetadata";
import { UserPurchase } from "@/db/entities/UserPurchase";
import { User } from "@/db/entities/User";
import { BeforeDate } from "@lib/util-lib";
import { Connection, In, InsertResult, Like, Not, Repository } from "typeorm";
class UserPurchaseClass {
  public userPurchaseRepo: Repository<UserPurchase>;
  private conn: Connection;
  private connect = async (): Promise<void> => {
    this.conn = await db.connect();
    if (!this.userPurchaseRepo) {
      this.userPurchaseRepo = this.conn.getRepository(UserPurchase);
    }
  };

  public getUserPurchaseByUser = async (
    userId: string
  ): Promise<Partial<UserPurchase[]>> => {
    await this.connect();
    return this.userPurchaseRepo.find({
      relations: ["titleMetaData"],
      where: {
        user: { id: userId },
      },
    });
  };

  public getUserPurchasedTitles = async (
    userId: string
  ): Promise<Partial<UserPurchase[]>> => {
    await this.connect();

    return this.userPurchaseRepo.find({
      relations: ["titleMetaData"],
      where: {
        user: { id: userId },
        expiredDateTime: BeforeDate(new Date()),
      },
    });
  };

  public createUserPurchase = async (
    user: User,
    title: TitleMetadata,
    duration: number
  ): Promise<UserPurchase> => {
    await this.connect();

    const now: Date = new Date();
    const newExpiration: Date = new Date(now.getTime() + duration * 60000);
    const newUserPurchase = new UserPurchase();
    

    newUserPurchase.purchaseDateTime = now;
    newUserPurchase.expiredDateTime = newExpiration;
    newUserPurchase.titleMetaData = title;
    newUserPurchase.user = user;

    return await this.userPurchaseRepo.save(newUserPurchase);
  };
}
export const UserPurchaseService = new UserPurchaseClass();
