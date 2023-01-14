import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  PrimaryGeneratedColumn,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { Genre } from '../../enums/Genre';
import { MovieRating } from '../../enums/MovieRating';
import { Season } from './Season';

@Entity()
export class Series {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  @Generated('uuid')
  public uuid: string;

  @Column()
  public name: string;

  @Column({ nullable: true })
  public description: string;

  @Column({ nullable: true })
  public mediaFile: string;

  @Column({ nullable: true })
  public posterUrl: string;

  @Column({ nullable: true })
  public bannerUrl: string;

  @Column('boolean', { default: false })
  public published: boolean;

  @Column({ nullable: true })
  public assetId: string;

  @Column({ nullable: true })
  public dashUrl: string;

  @Column({ nullable: true })
  public hlsUrl: string;

  @Column({ nullable: true })
  public genre: string;

  @Column({
    type: 'enum',
    enum: MovieRating,
    nullable: true,
  })
  public rating: MovieRating;

  @OneToMany((type) => Season, (season) => season.series, { eager: true })
  public seasons: Season[];
}
