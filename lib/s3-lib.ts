import * as AWS from 'aws-sdk';
import CONFIG from '../config';

AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,
});

export const getS3PublicBucketName = (): string => {
  return CONFIG.s3.BUCKET;
};

export const getS3DirectoryPath = (subFolders: string[]): string => {
  if (!subFolders.length) return '';

  let path = subFolders[0];
  for (let i = 1; i < subFolders.length; i++) {
    path = `${path}/${subFolders[i]}`;
  }
  path = `${path}/`;

  return path;
};

export const getS3FilePath = (parentFolders: string[], fileName: string): string => {
  let path = getS3DirectoryPath(parentFolders);
  return `${path}${fileName}`;
};

export const createS3Folder = (bucketName: string, folderPath: string): Promise<any> => {
  const s3 = new AWS.S3();
  return new Promise((resolve, reject) => {
    s3.putObject({
      Bucket: bucketName,
      Key: folderPath,
    })
      .promise()
      .then((result) => {
        resolve('success');
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const createS3File = (bucketName: string, filePath: string, content: string): Promise<any> => {
  const s3 = new AWS.S3();
  return new Promise((resolve, reject) => {
    s3.putObject({
      Bucket: bucketName,
      Key: filePath,
      Body: content,
    })
      .promise()
      .then((result) => {
        resolve('success');
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const deleteS3Object = (bucketName: string, filePath: string): Promise<any> => {
  const s3 = new AWS.S3();
  return new Promise((resolve, reject) => {
    s3.deleteObject({ Bucket: bucketName, Key: filePath })
      .promise()
      .then((result) => {
        resolve('success');
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const getUploadURL = (filePath: string, contentType: string): string => {
  const s3 = new AWS.S3();
  var s3Params = {
    Bucket: getS3PublicBucketName(),
    Key: `${filePath}`,
    ACL: 'public-read',
    ContentType: contentType,
  };

  return s3.getSignedUrl('putObject', s3Params);
};


