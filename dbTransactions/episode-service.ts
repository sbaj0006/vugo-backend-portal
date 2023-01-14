import { db } from '@/db/db';
import { Connection, In, InsertResult, Like, Not, Repository, DeleteResult } from 'typeorm';
import { Season } from '../db/entities/Season';
import { Series } from '../db/entities/Series';
import { Episode } from '../db/entities/Episode';
import { TitleMetadata } from '../db/entities/TitleMetadata';

class EpisodeServiceClass {
  public episodeRepo: Repository<Episode>;
  private conn: Connection;

  public insert = async (
    series: Series,
    season: Season,
    titleMetaData: TitleMetadata,
    insertData: Partial<Episode>,
  ): Promise<Episode> => {
    await this.connect();
    const result = {
      series: series,
      season: season,
      titleMetaData: titleMetaData,
      ...insertData,
    };
    const insertResult = await this.episodeRepo.insert(result);
    return this.episodeRepo.findOne(insertResult.identifiers[0].id);
  };

  public getEpisodeById = async (episodeId: number): Promise<Episode> => {
    await this.connect();
    const episode = await this.episodeRepo.findOne({ where: { id: episodeId } });
    return episode;
  };

  public updateEpisodeById = async (
    episodeId: number,
    updateData: Partial<Episode>,
  ): Promise<Episode> => {
    await this.connect();
    // const result = {
    //   series: series,
    //   ...updateData,
    // };
    const updateResult = await this.episodeRepo.update(episodeId, updateData);
    return this.episodeRepo.findOne(episodeId);
  };

  public publishEpisode = async (episodeId: number): Promise<Episode> => {
    await this.connect();
    const epsiode = await this.episodeRepo
      .createQueryBuilder()
      .update(Episode)
      .set({ published: true })
      .where('id = :id', { id: episodeId })
      .execute();

    return await this.episodeRepo.findOne(episodeId);
  };

  public unpublishEpisode = async (episodeId: number): Promise<Episode> => {
    await this.connect();
    const episode = await this.episodeRepo
      .createQueryBuilder()
      .update(Episode)
      .set({ published: false })
      .where('id = :id', { id: episodeId })
      .execute();

    return await this.episodeRepo.findOne(episodeId);
  };

  private connect = async (): Promise<void> => {
    this.conn = await db.connect();
    if (!this.episodeRepo) {
      this.episodeRepo = this.conn.getRepository(Episode);
    }
  };
}

export const EpisodeService = new EpisodeServiceClass();
