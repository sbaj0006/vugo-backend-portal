import { db } from '@/db/db';
import { Connection, In, InsertResult, Like, Not, Repository, DeleteResult } from 'typeorm';
import { GeoFence } from '../db/entities/GeoFence';
import { WhiteListedIp } from '../db/entities/WhiteListedIp';

class IpServiceClass {
  public whiteListedIpRepo: Repository<WhiteListedIp>;
  private conn: Connection;

  public insert = async (insertData: Partial<WhiteListedIp>): Promise<WhiteListedIp> => {
    await this.connect();
    const insertResult = await this.whiteListedIpRepo.insert(insertData);

    return this.whiteListedIpRepo.findOne(insertResult.identifiers[0].id);
  };

  public getWhiteListedIp = async (size = 10, page = 1): Promise<[WhiteListedIp[], number]> => {
    await this.connect();
    const ips = await this.whiteListedIpRepo.findAndCount({
      skip: size * (page - 1),
      take: size,
      order: {
        id: 'DESC',
      },
    });
    return ips;
  };

  public getWhiteListedById = async (ipId: string): Promise<WhiteListedIp> => {
    await this.connect();
    const ip = await this.whiteListedIpRepo.findOne({ where: { id: ipId } });
    return ip;
  };

  public checkIp = async (ip: string): Promise<WhiteListedIp> => {
    await this.connect();
    const foundIp = await this.whiteListedIpRepo.findOne({ where: { ip: ip, active: true } });
    return foundIp;
  };

  public toggleStatus = async (
    whiteListedIp: Partial<WhiteListedIp>,
    ipId: number,
  ): Promise<WhiteListedIp> => {
    await this.connect();
    if (whiteListedIp.active === true) {
      const status = await this.whiteListedIpRepo
        .createQueryBuilder()
        .update(WhiteListedIp)
        .set({ active: false })
        .where('id = :id', { id: ipId })
        .execute();
    } else {
      const status = await this.whiteListedIpRepo
        .createQueryBuilder()
        .update(WhiteListedIp)
        .set({ active: true })
        .where('id = :id', { id: ipId })
        .execute();
    }
    return await this.whiteListedIpRepo.findOne(ipId);
  };

  public updateWhiteListedIP = async (
    ip: string,
    updateData: Partial<WhiteListedIp>,
  ): Promise<WhiteListedIp> => {
    await this.connect();
    await this.whiteListedIpRepo.update(ip, updateData);
    return this.whiteListedIpRepo.findOne(ip);
  };

  public deleteWhiteListedIPById = async (ip: string): Promise<void> => {
    await this.connect();
    const deleteIp = await this.whiteListedIpRepo
      .createQueryBuilder()
      .delete()
      .from(WhiteListedIp)
      .where('id = :id', { id: ip })
      .execute();
  };

  private connect = async (): Promise<void> => {
    this.conn = await db.connect();
    if (!this.whiteListedIpRepo) {
      this.whiteListedIpRepo = this.conn.getRepository(WhiteListedIp);
    }
  };
}

export const IpService = new IpServiceClass();
