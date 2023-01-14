import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Promotion } from './Promotion';
import { CodeRedemption } from './CodeRedemption';

@Entity()
export class PromotionCode {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public promotionId: number;

  @Column()
  public active: boolean;

  @Column({ nullable: true })
  public email: string;

  @Column()
  public code: string;

  @Column({ nullable: true })
  public token: string;

  @ManyToOne((type) => Promotion, (promotion) => promotion.promotionCodes, { onDelete: 'CASCADE' })
  public promotion: Promotion;

  @OneToMany((type) => CodeRedemption, (redeemCode) => redeemCode.promotionCode, { eager: true })
  public redeemCode: CodeRedemption[];
}
