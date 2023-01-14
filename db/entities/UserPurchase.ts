import { Column, CreateDateColumn, Entity, Generated, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import {TitleMetadata } from './TitleMetadata'
import {User }from './User'

@Entity()
export class UserPurchase {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @CreateDateColumn()
  public purchaseDateTime: Date;

  @CreateDateColumn()
  public expiredDateTime: Date;


  @Column({default:false})
  public downloaded: boolean;

  @ManyToOne(() => TitleMetadata, (titleMetaData) => titleMetaData.userPurchase)
  public titleMetaData!: TitleMetadata;
  
  @ManyToOne(() => User, (user) => user.userPurchase)
  public user!: User;

}
