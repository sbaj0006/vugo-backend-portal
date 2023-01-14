import { Column, CreateDateColumn, Entity, Generated, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Product } from './Product';
import { User } from './User';

@Entity()
export class UserProduct {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ManyToOne(() => User , user => user.userProduct) // inverse "userPlaces: UserPlace[]" is one-to-many in user
  public user: User ;


  @ManyToOne(() => Product, user => user.userProduct) 
  public product: Product;

  @Column()
  @Generated('uuid')
  public productId: string;

  @CreateDateColumn()
  public startDateTime: Date;

  @CreateDateColumn()
  public endDateTime: Date;
}
