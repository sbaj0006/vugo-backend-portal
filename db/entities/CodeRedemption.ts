import { Column, CreateDateColumn, Entity, Generated, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PromotionCode } from './PromotionCode';

@Entity()
export class CodeRedemption {
  @PrimaryGeneratedColumn()
  public id: number;

  @CreateDateColumn()
  public redeemDateTime: Date;

  @ManyToOne((type) => PromotionCode, (promotionCode) => promotionCode.redeemCode, {
    onDelete: 'CASCADE',
  })
  public promotionCode: PromotionCode;
}
