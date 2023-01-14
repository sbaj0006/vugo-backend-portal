import { db } from '@/db/db';
import { Connection, In, InsertResult, Like, Not, Repository, DeleteResult } from 'typeorm';
import { User } from '@/db/entities/User';
const bcrypt = require('bcryptjs');

class UserServiceClass {
  public userRepo: Repository<User>;
  private conn: Connection;

  public getUser = async (ids: string[]): Promise<User[]> => {
    await this.connect();
    if (!ids.length) {
      return [];
    }
    return this.userRepo.find({
      where: {
        id: In(ids),
      },
      relations: ['user'],
    });
  };

  public getUserById = async (id: string): Promise<User> => {
    await this.connect();
    return this.userRepo.findOne({
      where: {
        id: id,
      },
    });
  };
  
  public getUserByEmail = async (email: string): Promise<User> => {
    await this.connect();

    const ret = await this.userRepo.findOne({
      where: [
        {email: email},
        {username:email}
      ],
    });
    return ret
  };

  public getAllUser = async (size = 10, page = 1): Promise<[User[], number]> => {
    await this.connect();
    let users = await this.userRepo.findAndCount({
      skip: size * (page - 1),
      take: size,
      order: {
        id: 'DESC',
      },
    });
    users[1] = await this.userRepo.count();
    return users;
  };


  public createUser = async (insertData: Partial<User>): Promise<User> => {
    await this.connect();
    const insertResult = await this.userRepo.insert(insertData);
    let result : User =await this.userRepo.findOne(insertResult.identifiers[0].id);
    return result
  };

  public updateUser = async (id: string, updateData: User): Promise<User> => {
    await this.connect();

    delete updateData['password'];
    delete updateData['updatedAt'];

    await this.userRepo.update(id, updateData);
    return this.userRepo.findOne(id);
  };


  public deleteDBUser = async (id: string): Promise<DeleteResult> => {
    await this.connect();
    try {
      let user = await this.userRepo.findOne({
        where: {
          id: id,
        },
      });
      await this.userRepo.update(id, user);
      let deleteResult = await this.userRepo.delete(id);
      if (deleteResult.affected == 1) return deleteResult;
    } catch (e) {
      return null;
    }
  };



  private connect = async (): Promise<void> => {
    this.conn = await db.connect();
    if (!this.userRepo) {
      this.userRepo = this.conn.getRepository(User);
    }
  };
}

export const UserService = new UserServiceClass();
