import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class WhiteListedIp {
  @PrimaryGeneratedColumn()
  public id: string;

  @Column()
  public name: string;

  @Column()
  public ip: string;

  @Column('boolean', { default: false })
  public active: boolean;
}
