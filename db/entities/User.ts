import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn,
   ManyToOne, ManyToMany } from 'typeorm';
import { IsEmail, IsNotEmpty } from "class-validator";
import { UserProduct } from './UserProduct';
import { UserPurchase } from './UserPurchase';
import { UserSignIn } from './UserSignIn';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ nullable: false, unique:true })
  public username: string;

  
  @Column({ nullable: false, unique:true })
  @IsEmail({}, { message: 'Incorrect email' })
  @IsNotEmpty({ message: 'The email is required' })
  public email: string;

  // @Column({ nullable: true })
  // public email: string;

  //for social user the password can be null
  @Column({ nullable: true })
  public hashedPassword: string;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  // @Column()
  // public password: string
  @OneToMany(() => UserSignIn, userSignIn => userSignIn.user) // note: we will create author property in the Photo class below
  userSignIn: UserSignIn[];

  @OneToMany(() => UserProduct, userProduct => userProduct.user) // note: we will create author property in the Photo class below
  userProduct: UserProduct[];

  @OneToMany(() => UserPurchase, UserPurchase => UserPurchase.user) // note: we will create author property in the Photo class below
  userPurchase: UserPurchase[];
  
  @Column({ nullable: true })
  public firstName: string

  @Column({ nullable: true })
  public lastName: string

  @Column({ default:false})
  public activated: boolean
}
