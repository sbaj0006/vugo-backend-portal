import { APIGatewayEvent, Handler } from 'aws-lambda';
import { badRequest, failure, success } from '@lib/response-lib';
import { authWrapper } from '@lib/authWrapper';
import { AssetsService } from '../../../../dbTransactions/assets-service';
import { S3Asset } from '@/db/entities/S3Asset';
import { S3AssetType } from '@/enums/S3AssetType';
import { getNow } from '@lib/util-lib';
import { Stream } from 'stream';
import {
  createS3File,
  createS3Folder,
  deleteS3Object,
  getS3DirectoryPath,
  getS3FilePath,
  getS3PublicBucketName,
  getUploadURL,
} from '@lib/s3-lib';

export const createAssetsFolder: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      const req = JSON.parse(event.body);
      const folderName = req.folderName;
      const parentFolderIds: string[] = req.parentFolderIds;

      const newFolder = await createAsset(parentFolderIds, folderName, S3AssetType.Folder);
      return await success({ message: 'success', data: newFolder });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const getFolderContent: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      let { folderId } = event.pathParameters;
      const folderContent = await AssetsService.getAssetInDirectory(folderId);
      return await success({ message: 'success', data: folderContent });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

//TODO: ApiGateway is having issues with uploading files, we will treat it as a new feature to build it after the migration
export const uploadImage: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      let { folderId } = event.pathParameters;
      const req = JSON.parse(event.body);
      const headers = event.headers;

      const fileName = req.fileName;
      const contentType = headers['Content-Type'];

      if (contentType !== 'image/png' && contentType !== 'image/jpeg' && contentType !== 'image/webp') {
        return await failure({ message: 'Invalid image format' });
      }

      const allFolders = await AssetsService.getAllParentDirectories(folderId);
      allFolders.push(await AssetsService.getAssetsById(folderId));

      const filePath = getS3FilePath(
        allFolders.map((f) => f.name),
        fileName,
      );
      const result = await getUploadURL(filePath, contentType);
      await createAsset(
        allFolders.map((f) => f.id),
        fileName,
        S3AssetType.File,
        null,
        false,
      );

      return await success({ message: 'success', data: result });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const deleteAsset: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      const deleteFile = async (file: S3Asset) => {
        const parentDirecotries =
          file.parentDirectoryId == null
            ? []
            : (await AssetsService.getAllParentDirectories(file.id)).map((f) => f.name);

        const filePath = getS3FilePath(parentDirecotries, file.name);
        await deleteS3Object(getS3PublicBucketName(), filePath);
        await AssetsService.deleteAsset(file.id);
      };

      const deleteFolder = async (folder: S3Asset) => {
        var allAssetsUnderTheFolder = await AssetsService.getAssetInDirectory(folder.id);

        //delete everything inside the folder
        allAssetsUnderTheFolder.forEach(async (a: S3Asset) => {
          if (a.assetType === S3AssetType.Folder) {
            await deleteFolder(a);
          } else {
            await deleteFile(a);
          }
        });

        //delete the folder itself
        const parentDirectories =
          folder.parentDirectoryId == null
            ? []
            : (await AssetsService.getAllParentDirectories(folder.id)).map((f) => f.name);
        parentDirectories.push(folder.name);
        const folderPath = getS3DirectoryPath(parentDirectories);
        await deleteS3Object(getS3PublicBucketName(), folderPath);
        await AssetsService.deleteAsset(folder.id);
      };

      let { assetId } = event.pathParameters;
      const asset = await AssetsService.getAssetsById(assetId);

      if (asset == null) {
        return await failure({ message: 'Cannot find asset' });
      }

      if (asset.assetType === S3AssetType.Folder) {
        //Delete the folder and the content in it
        deleteFolder(asset);
      } else {
        //Delete the file
        deleteFile(asset);
      }
      return await success({ message: 'success', data: 'Asset removed successfully' });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const createAsset = async (
  parentFolderIds: string[],
  assetName: string,
  assetType: S3AssetType,
  content: any = null,
  shouldUploadToS3: boolean = true,
): Promise<S3Asset> => {
  const folders = await AssetsService.getDirectories(parentFolderIds);

  if (folders.length !== parentFolderIds.length) {
    throw new Error('Invalid parent folder id');
  }

  const now = getNow();
  const s3Asset: any = {
    name: assetName,
    assetType: assetType,
    creationDateTime: now,
    lastModificationDateTime: now,
  };

  if (parentFolderIds.length) {
    s3Asset.parentDirectoryId = parentFolderIds[parentFolderIds.length - 1];
  }

  const newS3Asset = await AssetsService.insert(s3Asset);

  const allFolderNames = folders.map((f) => f.name);
  if (assetType === S3AssetType.Folder) {
    allFolderNames.push(assetName);
    const folderPath = getS3DirectoryPath(allFolderNames);
    await createS3Folder(getS3PublicBucketName(), folderPath);
  } else {
    const filePath = getS3FilePath(allFolderNames, assetName);
    await createS3File(getS3PublicBucketName(), filePath, content);
  }
  return newS3Asset;
};
