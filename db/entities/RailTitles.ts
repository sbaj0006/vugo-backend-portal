import { Rail } from './Rail';
import { TitleMetadata } from './TitleMetadata';
import {
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class RailTitles {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  // @Column()
  // public railId: string;

  // @Column()
  // public titleId: string;

  @ManyToOne((type) => Rail, (rail) => rail.railTitles)
  public rail!: Rail;

  @ManyToOne((type) => TitleMetadata, (titleMetaData) => titleMetaData.railTitles)
  public titleMetaData!: TitleMetadata;
}
