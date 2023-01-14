import { Column, CreateDateColumn, Entity, Generated, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TitlePublication {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  @Generated('uuid')
  public titleId: string;

  @CreateDateColumn()
  public startDateTime: Date;

  @CreateDateColumn()
  public endDateTime: Date;
}
