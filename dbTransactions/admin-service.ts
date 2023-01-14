import { db } from '@/db/db';
import { Connection, In, Repository, DeleteResult } from 'typeorm';
import { Admin } from '@/db/entities/Admin';
const bcrypt = require('bcryptjs');

class AdminServiceClass {
  public adminRepo: Repository<Admin>;
  private conn: Connection;

  public getAdmin = async (ids: string[]): Promise<Admin[]> => {
    await this.connect();
    if (!ids.length) {
      return [];
    }
    return this.adminRepo.find({
      where: {
        id: In(ids),
      },
      relations: ['admin'],
    });
  };

  public getAdminById = async (id: string): Promise<Admin> => {
    await this.connect();
    return this.adminRepo.findOne({
      where: {
        id: id,
      },
    });
  };
  
  public getAdminByEmail = async (email: string): Promise<Admin> => {
    await this.connect();

    const ret = await this.adminRepo.findOne({
      where: {
        username: email,
      },
    });
    return ret
  };

  public getAllAdmin = async (size = 10, page = 1): Promise<[Admin[], number]> => {
    await this.connect();
    let admin = await this.adminRepo.findAndCount({
      skip: size * (page - 1),
      take: size,
      order: {
        id: 'DESC',
      },
    });
    admin[1] = await this.adminRepo.count();
    return admin;
  };


  public createAdmin = async (insertData: Partial<Admin>): Promise<Admin> => {
    await this.connect();
    const insertResult = await this.adminRepo.insert(insertData);
    let result : Admin =await this.adminRepo.findOne(insertResult.identifiers[0].id);
    return result
  };

  public updateAdmin = async (id: string, updateData: Admin): Promise<Admin> => {
    await this.connect();

    delete updateData['password'];
    delete updateData['updatedAt'];

    await this.adminRepo.update(id, updateData);
    return this.adminRepo.findOne(id);
  };


  public deleteDBAdmin = async (id: string): Promise<DeleteResult> => {
    await this.connect();
    try {
      let user = await this.adminRepo.findOne({
        where: {
          id: id,
        },
      });
      await this.adminRepo.update(id, user);
      let deleteResult = await this.adminRepo.delete(id);
      if (deleteResult.affected === 1) return deleteResult;
    } catch (e) {
      return null;
    }
  };



  private connect = async (): Promise<void> => {
    this.conn = await db.connect();
    if (!this.adminRepo) {
      this.adminRepo = this.conn.getRepository(Admin);
    }
  };
}

export const AdminService = new AdminServiceClass();