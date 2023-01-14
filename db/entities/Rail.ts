import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RailType } from '../../enums/RailType';
import { PageLayout } from './PageLayout';
import { TitleMetadata } from './TitleMetadata';
import { RailTitles } from './RailTitles';

@Entity()
export class Rail {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public name: string;

  @Column('enum', { enum: RailType })
  public type: RailType;

  @Column({ nullable: true })
  public displayOrder: number;

  @Column({ nullable: true })
  public description: string;

  // @Column()
  // @Generated('uuid')
  // public pageLayoutId: string;

  @ManyToOne((type) => PageLayout, (pageLayout) => pageLayout.pageRails)
  public pageLayout: PageLayout;

  @OneToMany((type) => RailTitles, (railTitles) => railTitles.rail)
  public railTitles!: RailTitles[];
}
