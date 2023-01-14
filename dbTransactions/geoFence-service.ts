import { db } from '@/db/db';
import { Connection, In, InsertResult, Like, Not, Repository, DeleteResult } from 'typeorm';
import { GeoFence } from '../db/entities/GeoFence';

class GeoFenceServiceClass {
  public geoFenceRepo: Repository<GeoFence>;
  private conn: Connection;

  public upsert = async (data: Partial<GeoFence>): Promise<GeoFence> => {
    await this.connect();
    let id = data.id;
    if (id == null) {
      id = (await this.geoFenceRepo.insert(data)).identifiers[0].id;
    } else {
      delete data.points;
      await this.geoFenceRepo.createQueryBuilder().update(data).where('id = :id', { id: id }).execute();
    }

    return this.geoFenceRepo.findOne(id);
  };

  public getGeoFences = async (size = 10, page = 1): Promise<[GeoFence[], number]> => {
    await this.connect();
    const geoFence = await this.geoFenceRepo.findAndCount({
      skip: size * (page - 1),
      take: size,
      order: {
        id: 'DESC',
      },
    });
    geoFence[0].forEach((gf) => {
      gf.points.sort((a, b) => a.order - b.order);
    });
    return geoFence;
  };

  public getGeoFenceById = async (geoFenceId: string): Promise<GeoFence> => {
    await this.connect();
    const geoFence = await this.geoFenceRepo.findOne({ where: { id: geoFenceId } });
    return geoFence;
  };

  public toggleStatus = async (geoFence: Partial<GeoFence>, geoFenceId: string): Promise<GeoFence> => {
    await this.connect();
    if (geoFence.active === true) {
      const status = await this.geoFenceRepo
        .createQueryBuilder()
        .update(GeoFence)
        .set({ active: false })
        .where('id = :id', { id: geoFenceId })
        .execute();
    } else {
      const status = await this.geoFenceRepo
        .createQueryBuilder()
        .update(GeoFence)
        .set({ active: true })
        .where('id = :id', { id: geoFenceId })
        .execute();
    }
    return await this.geoFenceRepo.findOne(geoFenceId);
  };

  public deleteGeoFenceById = async (geoFenceId: string): Promise<void> => {
    await this.connect();
    const deleteGeoFence = await this.geoFenceRepo
      .createQueryBuilder()
      .delete()
      .from(GeoFence)
      .where('id = :id', { id: geoFenceId })
      .execute();
  };

  private connect = async (): Promise<void> => {
    this.conn = await db.connect();
    if (!this.geoFenceRepo) {
      this.geoFenceRepo = this.conn.getRepository(GeoFence);
    }
  };
}

export const GeoFenceService = new GeoFenceServiceClass();
