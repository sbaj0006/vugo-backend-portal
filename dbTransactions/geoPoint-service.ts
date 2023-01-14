import { db } from '@/db/db';
import { Connection, In, InsertResult, Like, Not, Repository, DeleteResult } from 'typeorm';
import { GeoPoint } from '../db/entities/GeoPoint';
import { GeoFence } from '../db/entities/GeoFence';

class GeoPointServiceClass {
  public geoPointRepo: Repository<GeoPoint>;
  private conn: Connection;

  public insert = async (i: number, geoFence: GeoFence, point: Partial<GeoPoint>): Promise<GeoPoint> => {
    await this.connect();
    const data = {
      geoFence: geoFence,
      lat: point.lat,
      lng: point.lng,
      order: i,
    };
    const insertResult = await this.geoPointRepo.insert(data);

    return this.geoPointRepo.findOne(insertResult.identifiers[0].id);
  };
  public deleteGeoPoint = async (data: Partial<GeoPoint>): Promise<void> => {
    await this.connect();
    await this.geoPointRepo.createQueryBuilder().delete().where('id = :id', { id: data.id }).execute();
  };

  private connect = async (): Promise<void> => {
    this.conn = await db.connect();
    if (!this.geoPointRepo) {
      this.geoPointRepo = this.conn.getRepository(GeoPoint);
    }
  };
}

export const GeoPointService = new GeoPointServiceClass();
