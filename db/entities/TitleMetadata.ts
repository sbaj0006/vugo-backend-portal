import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MovieRating } from '../../enums/MovieRating';
import { Genre } from '../../enums/Genre';
import { Rail } from './Rail';
import { RailTitles } from './RailTitles';
import { UserPurchase } from './UserPurchase';
import { Promotion } from './Promotion';
import { Episode } from './Episode';
import { OneToOne } from 'typeorm';

@Entity()
export class TitleMetadata {
  @PrimaryGeneratedColumn()
  public titleId: number;

  @Column({ nullable: true })
  @Generated('uuid')
  public titleUuid: string;

  @Column({ nullable: true })
  public assetId: string;

  @Column({ nullable: true })
  public titleName: string;

  @Column({ nullable: true })
  public subTitle: string;

  @Column({ nullable: true })
  public dashUrl: string;

  @Column({ nullable: true })
  public hlsUrl: string;

  @Column({ nullable: true })
  public mediaFile: string;

  @Column({ nullable: true })
  public longDescription: string;

  @Column({ nullable: true })
  public shortDescription: string;

  @Column({
    type: 'enum',
    enum: MovieRating,
    nullable: true,
  })
  public rating: MovieRating;

  @Column({ nullable: true })
  public year: number;

  @Column({ nullable: true })
  public genre: string;

  @Column({ nullable: true })
  public duration: number;

  @Column({ nullable: true })
  public posterUrl: string;

  @Column({ nullable: true })
  public bannerUrl: string;

  @Column({ nullable: true })
  public artworkUrl: string;

  @Column({ nullable: true })
  public banner16x9_url: string;

  @Column({ nullable: true })
  public banner4x1_url: string;

  @Column({ nullable: true })
  public banner4x3_url: string;

  @Column({ nullable: true })
  public banner3x4_url: string;

  @Column({ nullable: true })
  public trailerMediaFile: string;

  @Column({ nullable: true })
  public trailerDashUrl: string;

  @Column({ nullable: true })
  public trailerHlsUrl: string;

  @Column({ nullable: true })
  public promoMediaFile: string;

  @Column({ nullable: true })
  public promoHlsUrl: string;

  @Column({ nullable: true })
  public promoDashUrl: string;

  @OneToMany((type) => RailTitles, (railTitles) => railTitles.titleMetaData)
  public railTitles: RailTitles[];

  @OneToMany((type) => UserPurchase, (userPurchase) => userPurchase.titleMetaData)
  public userPurchase: UserPurchase[];

  @OneToOne((type) => Episode, (episode) => episode.titleMetaData)
  public episode: Episode;
}
