import { db } from '@/db/db';
import { Connection, In, InsertResult, Like, Not, Repository, DeleteResult } from 'typeorm';
import { Season } from '../db/entities/Season';
import { Series } from '../db/entities/Series';


class SeasonServiceClass {
  public seasonRepo: Repository<Season>;
  private conn: Connection;


  public listSeasons = async (size = 10, page = 1): Promise<[Season[], number]> => {
    await this.connect();
    let result = await this.seasonRepo.findAndCount({
      take: size,
      skip: size * (page - 1),
      order: {
        id: "DESC"
      }
    })
    result[1] = await this.seasonRepo.count();
    return result;
  }

  public insert = async (series: Series, insertData: Partial<Season>): Promise<Season> => {
    await this.connect();
    const result = {
      series: series,
      ...insertData,
    };
    const insertResult = await this.seasonRepo.insert(result);
    return this.seasonRepo.findOne(insertResult.identifiers[0].id);
  };

  public get = async (SeasonId: number): Promise<Season> => {
    return await this.seasonRepo.findOne(SeasonId);
  }

  public delete = async (SeasonId: number): Promise<DeleteResult> => {
    await this.connect();
    const Season = await this.seasonRepo.findOne(SeasonId);
    let deleteResult = await this.seasonRepo.delete(SeasonId);

    try {

    await this.seasonRepo.update(SeasonId, Season);
    let deleteResult = await this.seasonRepo.delete(SeasonId);
    if (deleteResult.affected == 1) return deleteResult;
  } catch (e) {
    return null;
    };
  }


  public update = async (id: number, updateData: Partial<Season>): Promise<Season> => {
    await this.connect();
    await this.seasonRepo.update(id, updateData);
    return this.seasonRepo.findOne(id)
  }

  public getSeasonById = async (seasonId: number): Promise<Season> => {
    await this.connect();
    const season = await this.seasonRepo.findOne({ where: { id: seasonId } });
    return season;
  };

  public publishSeason = async (seasonId: number): Promise<Season> => {
    await this.connect();
    const season = await this.seasonRepo
      .createQueryBuilder()
      .update(Season)
      .set({ published: true })
      .where('id = :id', { id: seasonId })
      .execute();

    return await this.seasonRepo.findOne(seasonId);
  };

  public unpublishSeason = async (seasonId: number): Promise<Season> => {
    await this.connect();
    const season = await this.seasonRepo
      .createQueryBuilder()
      .update(Season)
      .set({ published: false })
      .where('id = :id', { id: seasonId })
      .execute();

    return await this.seasonRepo.findOne(seasonId);
  };

  public updateSeasonById = async (
    series: Series,
    seasonId: number,
    updateData: Partial<Season>,
  ): Promise<Season> => {
    await this.connect();
    const result = {
      series: series,
      ...updateData,
    };
    const updateResult = await this.seasonRepo.update(seasonId, updateData);
    return this.seasonRepo.findOne(seasonId);
  };

  private connect = async (): Promise<void> => {
    this.conn = await db.connect();
    if (!this.seasonRepo) {
      this.seasonRepo = this.conn.getRepository(Season);
    }
  };


}

export const SeasonService = new SeasonServiceClass();
