import { Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Entity } from 'typeorm/decorator/entity/Entity';
import { TitleGroup } from './TitleGroup';

@Entity()
export class GroupedTitle {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: false })
  public titleGroupId: number;

  @Column({ nullable: false })
  public titleId: number;

  @ManyToOne((type) => TitleGroup, (tg) => tg.groupedTitles)
  public titleGroup: TitleGroup;
}
