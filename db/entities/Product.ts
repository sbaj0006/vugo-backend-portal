import { Column, Entity, PrimaryGeneratedColumn, OneToMany} from 'typeorm';
import { ProductType } from '../../enums/ProductType';
import { ProductStatus } from '../../enums/ProductStatus';
import { UserProduct } from './UserProduct';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public name: string;

  @Column({
    type: 'enum',
    enum: ProductType,
    default: ProductType['Basic'],
  })
  public type: ProductType;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus['Active'],
  })
  public status: ProductStatus;

  @Column('decimal')
  public price: number;

  @Column()
  public duration: number;

  @Column({ nullable: true })
  public imageUrl: string;

  @Column({ nullable: true })
  public description: string;
  
  @OneToMany(() => UserProduct, userProduct => userProduct.product) // note: we will create author property in the Photo class below
  userProduct: UserProduct[];
}
