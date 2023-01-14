import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { StripePaymentIntentStatus } from '../../enums/StripePaymentIntentStatus';

@Entity()
export class UserProductPaymentIntent {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public userProductId: string;

  @Column({
    type: 'enum',
    enum: StripePaymentIntentStatus,
  })
  public paymentIntentStatus: StripePaymentIntentStatus;

  @CreateDateColumn()
  public dateTime: Date;
}
