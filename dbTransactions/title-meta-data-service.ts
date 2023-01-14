import { db } from '@/db/db';
import { TitlePublication } from '@/db/entities/TitlePublication';
import { Movie } from '@interfaces/movie';
import { ObjMapper } from '@lib/obj-mapper';
import { getMaxDate, getNow } from '@lib/util-lib';
import { Connection, In, InsertResult, Like, Not, Repository, DeleteResult } from 'typeorm';
import { TitleMetadata } from '../db/entities/TitleMetadata';

class TitleMetaDataServiceClass {
  public titleMetaRepo: Repository<TitleMetadata>;
  public titlePublicationRepo: Repository<TitlePublication>;
  private conn: Connection;

  public getTitleByUuId = async (titleUuid: string): Promise<TitleMetadata> => {
    await this.connect();
    const title = await this.titleMetaRepo.findOne({
      where: { titleUuid: titleUuid },
    });
    return title;
  };

  public getTitleById = async (id: number): Promise<TitleMetadata> => {
    await this.connect();
    const title = await this.titleMetaRepo.findOne({ where: { titleId: id } });
    return title;
  };

  public getMovies = async (publishedOnly: boolean = false): Promise<Movie[]> => {
    await this.connect();
    const titlesMetadata = await this.titleMetaRepo.createQueryBuilder().getMany();

    const titlePublications = await this.titlePublicationRepo
      .createQueryBuilder()
      .where('start_date_time < :currentDate AND end_date_time > :currentDate', {
        currentDate: getNow(),
      })
      .getMany();

    let movies = titlesMetadata.map((title, i) => {
      const movie = this.titleToMovie(title);
      movie.published = !!titlePublications.find((tp) => tp.titleId === movie.id);
      return movie;
    });

    if (publishedOnly) {
      movies = movies.filter((m) => m.published);
    }

    return movies;
  };

  public getMovieById = async (videoId: string): Promise<Movie> => {
    await this.connect();
    const title = await this.getTitleByUuId(videoId);
    const movie = this.titleToMovie(title);
    return movie;
  };

  public insert = async (insertData: Partial<TitleMetadata>): Promise<TitleMetadata> => {
    await this.connect();
    const insertResult = await this.titleMetaRepo.insert(insertData);

    return this.titleMetaRepo.findOne(insertResult.identifiers[0].id);
  };

  public updateById = async (
    videoId: string,
    updateData: Partial<TitleMetadata>,
  ): Promise<TitleMetadata> => {
    await this.connect();
    const updateResult = await this.titleMetaRepo
      .createQueryBuilder()
      .update(updateData)
      .where('title_uuid = :videoId', { videoId: videoId })
      .execute();
    return this.titleMetaRepo.findOne({ where: { titleUuid: videoId } });
  };

  public deleteById = async (videoId: string): Promise<DeleteResult> => {
    await this.connect();
    const deleteResult = await this.titleMetaRepo
      .createQueryBuilder()
      .delete()
      .where('title_uuid = :videoId', { videoId: videoId })
      .execute();
    return deleteResult;
  };

  public publishTitle = async (videoId: string): Promise<boolean> => {
    await this.connect();
    const titlePublication = await this.titlePublicationRepo.findOne({
      where: { titleId: videoId },
    });
    if (!!titlePublication) {
      titlePublication.endDateTime = getMaxDate();
      const updateResult = await this.titlePublicationRepo.update(titlePublication.id, titlePublication);
      return updateResult.affected === 1;
    } else {
      const titlePublication = {
        startDateTime: getNow(),
        endDateTime: getMaxDate(),
        titleId: videoId,
      };
      const insertResult = await this.titlePublicationRepo.insert(titlePublication);
      return true;
    }
  };

  public unpublishTitle = async (videoId: string): Promise<boolean> => {
    await this.connect();
    const titlePublication = await this.titlePublicationRepo.findOne({
      where: { titleId: videoId },
    });
    if (!!titlePublication) {
      titlePublication.endDateTime = getNow();
      const updateResult = await this.titlePublicationRepo.update(titlePublication.id, titlePublication);
      return updateResult.affected === 1;
    }
  };

  private titleToMovie = (title: TitleMetadata): Movie => {
    const movie = <Movie>ObjMapper(title, (v) => v);
    movie.index = title.titleId;
    movie.id = title.titleUuid;
    movie.ratingEnum = title.rating;
    movie.rating = title.rating ? title.rating.toString() : '';
    movie.genre = title.genre ? title.genre.toString() : '';
    return movie;
  };

  private connect = async (): Promise<void> => {
    this.conn = await db.connect();
    if (!this.titleMetaRepo) {
      this.titleMetaRepo = this.conn.getRepository(TitleMetadata);
    }
    if (!this.titlePublicationRepo) {
      this.titlePublicationRepo = this.conn.getRepository(TitlePublication);
    }
  };
}

export const TitleMetadataService = new TitleMetaDataServiceClass();
