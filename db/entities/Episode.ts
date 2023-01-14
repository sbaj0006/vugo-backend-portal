import {
  Column,
  Entity,
  Generated,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Season } from './Season';
import { TitleMetadata } from './TitleMetadata';

@Entity()
export class Episode {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public number: number;

  @Column()
  public seasonId: string;

  @Column('boolean', { default: false })
  public published: boolean;

  @Column({ nullable: true })
  public posterUrl: string;

  @Column({ nullable: true })
  public bannerUrl: string;

  @Column()
  @Generated('uuid')
  public uuid: string;

  @ManyToOne((type) => Season, (season) => season.episodes)
  public season: Season;

  @OneToOne((type) => TitleMetadata, (titleMetaData) => titleMetaData.episode, { eager: true })
  @JoinColumn()
  public titleMetaData: TitleMetadata;
}
