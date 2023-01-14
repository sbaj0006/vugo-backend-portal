import { db } from '@/db/db';
import { S3Asset } from '@/db/entities/S3Asset';
import { getNow } from '@lib/util-lib';
import { isUUID } from 'class-validator';
import { Connection, In, InsertResult, Like, Not, Repository, DeleteResult } from 'typeorm';
import { S3AssetType } from '../enums/S3AssetType';

class AssetsServiceClass {
  public assetsRepo: Repository<S3Asset>;
  private conn: Connection;

  public insert = async (s3Asset: Partial<S3Asset>): Promise<S3Asset> => {
    await this.connect();

    const insertResult = await this.assetsRepo.insert(s3Asset);

    return this.assetsRepo.findOne(insertResult.identifiers[0].id);
  };

  public getAssetsById = async (id: string): Promise<S3Asset> => {
    await this.connect();
    const asset = await this.assetsRepo.findOne({ where: { id: id } });
    return asset;
  };

  public getAssetInDirectory = async (id: string): Promise<S3Asset[]> => {
    await this.connect();

    const folderContent = !isUUID(id)
      ? await this.assetsRepo.find({ where: { parentDirectoryId: null } })
      : await this.assetsRepo.find({ where: { parentDirectoryId: id } });
    return folderContent;
  };

  public getDirectories = async (folderIds: string[]): Promise<S3Asset[]> => {
    await this.connect();
    if (!folderIds.length) {
      return [];
    }

    const directories = (
      await this.assetsRepo.find({
        where: { id: In(folderIds) },
      })
    ).sort((f1, f2) => folderIds.indexOf(f1.id) - folderIds.indexOf(f2.id));

    return directories;
  };

  public getAllParentDirectories = async (assetId: string): Promise<S3Asset[]> => {
    await this.connect();
    let asset = await this.assetsRepo.findOne(assetId);
    if (asset == null || asset.parentDirectoryId == null) return [];
    assetId = asset.parentDirectoryId;
    let folders = [];
    while (true) {
      let asset = await this.assetsRepo.findOne(assetId);
      if (asset == null) {
        break;
      }

      folders.push(asset);
      if (asset.parentDirectoryId == null) {
        break;
      }
      assetId = asset.parentDirectoryId;
    }
    folders = folders.reverse();
    return folders;
  };

  public deleteAsset = async (assetId: string): Promise<void> => {
    await this.connect();
    await this.assetsRepo.delete(assetId);
  };

  private connect = async (): Promise<void> => {
    this.conn = await db.connect();
    if (!this.assetsRepo) {
      this.assetsRepo = this.conn.getRepository(S3Asset);
    }
  };
}

export const AssetsService = new AssetsServiceClass();
