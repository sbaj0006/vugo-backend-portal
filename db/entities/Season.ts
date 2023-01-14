import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  BeforeInsert,
} from 'typeorm';
import { Episode } from './Episode';
import { Series } from './Series';

@Entity()
export class Season {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public name: string;

  @Column({ nullable: true })
  public description: string;

  @Column({ nullable: true })
  public posterUrl: string;

  @Column({ nullable: true })
  public bannerUrl: string;

  @Column({ nullable: true })
  public seriesId: number;

  @Column('boolean', { default: false })
  public published: boolean;

  @Column()
  @Generated('uuid')
  public uuid: string;

  @ManyToOne((type) => Series, (series) => series.seasons)
  public series: Series;

  @OneToMany((type) => Episode, (episode) => episode.season, { eager: true })
  public episodes: Episode[];
}
