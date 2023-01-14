import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { PromotionCode } from './PromotionCode';
import { TitleMetadata } from './TitleMetadata';

@Entity()
export class Promotion {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public name: string;

  @Column()
  public urlName: string;

  @ManyToOne(() => TitleMetadata, (title) => title.titleId, { eager: true })
  public title: TitleMetadata;

  @CreateDateColumn()
  public startDateTime: Date;

  @CreateDateColumn()
  public endDateTime: Date;

  @Column({ nullable: true })
  public logoUrl: string;

  @Column({ nullable: true })
  public splashImageUrl: string;

  @Column()
  public states: string;

  //it would fail if use promotionCode.id instead of promotionCode.promotion
  @OneToMany((type) => PromotionCode, (promotionCode) => promotionCode.promotion, { eager: true })
  public promotionCodes: PromotionCode[];

}
