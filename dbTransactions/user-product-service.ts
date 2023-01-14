import { db } from '@/db/db';
import { UserProduct } from '@/db/entities/UserProduct';
import { BeforeDate } from '@lib/util-lib';
import { Connection, In, InsertResult, Like, Not, Repository, DeleteResult } from 'typeorm';
import { ProductService } from './product-service';
import { UserService } from './user-service';
class UserProductClass {
  public userProductRepo: Repository<UserProduct>;
  private conn: Connection;

  private connect = async (): Promise<void> => {
    this.conn = await db.connect();
    if (!this.userProductRepo) {
      this.userProductRepo = this.conn.getRepository(UserProduct);
    }
  };

  public getUserProductByUser = async (
    userId: string
  ): Promise<Partial<UserProduct[]>> => {
    await this.connect();
    return this.userProductRepo
      .createQueryBuilder("userProduct")
      .leftJoinAndSelect("userProduct.product", "product")
      .leftJoinAndSelect("userProduct.user", "user")
      .where("user.id = :userId", { userId: userId })
      .select([
        "product.name AS productName",
        "product.price AS productPrice",
        "start_date_time AS startDateTime",
        "end_date_time AS endDateTime",
      ])
      .execute();
  };
  public getUserValidProductByUser = async (
    userId: string
  ): Promise<UserProduct> => {
    await this.connect();
    return this.userProductRepo.findOne({
      where: {
        user: { id: userId },
        endDateTime: BeforeDate(new Date()),
      },
    });
  };

  public createUserProduct = async (userId: string, productId: string): Promise<UserProduct> => {
    await this.connect();
    const product = await ProductService.getProductById(productId);
    const user = await UserService.getUserById(userId);

    const insertResult = await this.userProductRepo.insert({
      product: product,
      user: user
    })
    return this.userProductRepo.findOne(insertResult.identifiers[0].id)
  };
}
export const UserProductService = new UserProductClass();
