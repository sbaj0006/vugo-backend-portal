import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { GroupedTitle } from './GroupedTitle';

@Entity()
export class TitleGroup {
  @PrimaryGeneratedColumn()
  public id: number;
  @Column({ nullable: false })
  public name: string;
  @Column({ nullable: true })
  public description: string;
  @Column({ nullable: true })
  public groupImage: string;

  @OneToMany((type) => GroupedTitle, (gt) => gt.titleGroup, { eager: true })
  public groupedTitles: GroupedTitle[];
}
