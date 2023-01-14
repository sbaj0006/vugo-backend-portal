import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { VugoPage } from '../../enums/VugoPage';
import { Rail } from './Rail';
@Entity()
export class PageLayout {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column('enum', { enum: VugoPage, unique: true })
  public pageType: VugoPage;

  @OneToMany((type) => Rail, (pageRails) => pageRails.pageLayout, { eager: true })
  public pageRails: Rail[];
}
