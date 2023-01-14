import { db } from '@/db/db';
import { Connection, In, InsertResult, Like, Not, Repository, DeleteResult } from 'typeorm';
import { Series } from '../db/entities/Series';
import { failure } from '../lib/response-lib';

class SeriesServiceClass {
  public seriesRepo: Repository<Series>;
  private conn: Connection;

  public insert = async (insertData: Partial<Series>): Promise<Series> => {
    await this.connect();
    const insertResult = await this.seriesRepo.insert(insertData);

    return this.seriesRepo.findOne(insertResult.identifiers[0].id);
  };

  public getAllSeries = async (size = 10, page = 1): Promise<[Series[], number]> => {
    await this.connect();
    let series = await this.seriesRepo.findAndCount({
      skip: size * (page - 1),
      take: size,
      order: {
        id: 'DESC',
      },
    });
    return series;
  };

  public getAllPublishedSeries = async (size = 10, page = 1): Promise<[Series[], number]> => {
    await this.connect();
    let series = await this.seriesRepo.findAndCount({
      where: { published: true },
      skip: size * (page - 1),
      take: size,
      order: {
        id: 'DESC',
      },
    });
    return series;
  };

  public getSeriesById = async (seriesId: number): Promise<Series> => {
    await this.connect();
    const series = await this.seriesRepo.findOne({ where: { id: seriesId } });
    return series;
  };

  public getSeriesByUuid = async (seriesUuid: string): Promise<Series> => {
    await this.connect();
    const series = await this.seriesRepo.findOne({ where: { uuid: seriesUuid } });
    return series;
  };

  public updateSeriesById = async (key: number, updateData: Partial<Series>): Promise<Series> => {
    await this.connect();
    delete updateData.seasons;
    await this.seriesRepo.update(key, updateData);
    return this.seriesRepo.findOne(key);
  };

  public publishSeries = async (seriesId: number): Promise<Series> => {
    await this.connect();
    //const series = await this.seriesRepo.findOne({ where: { id: seriesId } });
    const series = await this.seriesRepo
      .createQueryBuilder()
      .update(Series)
      .set({ published: true })
      .where('id = :id', { id: seriesId })
      .execute();

    return await this.seriesRepo.findOne(seriesId);
  };

  public unpublishSeries = async (seriesId: number): Promise<Series> => {
    await this.connect();
    //const series = await this.seriesRepo.findOne({ where: { id: seriesId } });
    const series = await this.seriesRepo
      .createQueryBuilder()
      .update(Series)
      .set({ published: false })
      .where('id = :id', { id: seriesId })
      .execute();

    return await this.seriesRepo.findOne(seriesId);
  };

  public listSeries = async (size = 10, page = 1): Promise<[Series[], number]> => {
    await this.connect();
    let result = await this.seriesRepo.findAndCount({
      take: size,
      skip: size * (page - 1),
      order: {
        id: 'DESC',
      },
    });
    result[1] = await this.seriesRepo.count();
    return result;
  };

  public getById = async (SeriesId: number): Promise<Series> => {
    return await this.seriesRepo.findOne(SeriesId);
  };
  public getByUuid = async (uuid: string): Promise<Series> => {
    return await this.seriesRepo.findOne({ uuid: uuid });
  };

  public updateById = async (id: number, updateData: Partial<Series>): Promise<Series> => {
    await this.connect();
    await this.seriesRepo.update(id, updateData);
    return this.seriesRepo.findOne(id);
  };

  private connect = async (): Promise<void> => {
    this.conn = await db.connect();
    if (!this.seriesRepo) {
      this.seriesRepo = this.conn.getRepository(Series);
    }
  };
}

export const SeriesService = new SeriesServiceClass();
