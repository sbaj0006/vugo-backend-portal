import { db } from '@/db/db';
import { UserProductPaymentIntent } from '@/db/entities/UserProductPaymentIntent';
import { Connection, Repository } from 'typeorm';

class UserProductPaymentServiceClass {
  public userProductPaymentIntentRepo: Repository<UserProductPaymentIntent>;
  private conn: Connection;

  private connect = async (): Promise<void> => {
    this.conn = await db.connect();
    if (!this.userProductPaymentIntentRepo) {
      this.userProductPaymentIntentRepo = this.conn.getRepository(UserProductPaymentIntent);
    }
  };

  public insertUserProductPaymentIntent = async (
    userProductPaymentIntent: UserProductPaymentIntent,
  ): Promise<UserProductPaymentIntent> => {
    await this.connect();
    console.log('inserting', userProductPaymentIntent);
    await this.userProductPaymentIntentRepo.insert(userProductPaymentIntent);
    return this.userProductPaymentIntentRepo.findOne(userProductPaymentIntent.id);
  };
}
export const UserProductPaymentService = new UserProductPaymentServiceClass();
