import { db } from "@/db/db";
import {
  Connection,
  In,
  InsertResult,
  Like,
  Not,
  Repository,
  DeleteResult,
} from "typeorm";
import { UserSignIn } from "@/db/entities/UserSignIn";

class UserSignInClass {
  public userSignInRepo: Repository<UserSignIn>;
  private conn: Connection;
  private connect = async (): Promise<void> => {
    this.conn = await db.connect();
    if (!this.userSignInRepo) {
      this.userSignInRepo = this.conn.getRepository(UserSignIn);
    }
  };

  public getUserSignIn = async (ids: number[]): Promise<UserSignIn[]> => {
    await this.connect();
    if (!ids.length) {
      return [];
    }
    return this.userSignInRepo.find({
      where: {
        id: In(ids),
      },
    });
  };
  public getUserSignInByUser = async (
    userId: string
  ): Promise<UserSignIn[]> => {
    await this.connect();

    return this.userSignInRepo.find({
      select: ["deviceId", "signInDateTime", "ipAddress"],
      where: {
        user: {
          id: userId,
        },
      },
    });
  };

  public createUserSingIn = async (newSignIn: UserSignIn) => {
    console.log("===========new sign in=========")
    console.log(newSignIn);
    await this.connect();
    return this.userSignInRepo.save(newSignIn);
  };

  public getUserDevice = async (userId: string): Promise<UserSignIn[]> => {
    await this.connect();
    return this.userSignInRepo.find({
      select: ["deviceId"],
      where: {
        user: { id: userId },
      },
    });
  };
}

export const UserSignInService = new UserSignInClass();
