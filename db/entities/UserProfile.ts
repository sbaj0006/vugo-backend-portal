import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  public userId: string;

  @Column()
  public country: string;

  @Column()
  public state: string;

  @Column()
  public postcode: string;
}
