import * as path from 'path';
import * as mime from 'mime-types';
import * as AWS from 'aws-sdk';
import CONFIG from '@/config';


export const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION,
  signatureVersion: 'v4',
});

export const validateMimeType = (fileName: string): string | false => {
  const ext = path.extname(fileName);
  const mimeType: string | false = mime.lookup(ext);
  if (!mimeType) {
    return false;
  }
  if (mimeType !== 'image/jpeg' &&
    mimeType !== 'image/png') {
    console.error(`Invalid mime type with ${mimeType} for file ${fileName}`);
    return false;
  }
  return mimeType;
};

export const getSignedUrl = async (objectKey: string) : Promise<string> =>{
  const s3Params = {
      Bucket: CONFIG.s3.BUCKET,
      Key: objectKey,
      Expires: 1200
    };
  const signedUrl: string = s3.getSignedUrl('getObject', s3Params);
  return signedUrl;
}

export const getFaceMatchObjectKey = (): any =>{
  let now = Date.now();
  const faceKey = `public/face-match/${now}/face.jpg`;
  const idKey = `public/face-match/${now}/id.jpg`;
  return {faceKey, idKey}
}

export const getSubmissionObjectKey = (id: number): any =>{
  const faceKey = `public/submissions/${id}/face.jpg`;
  const idKey = `public/submissions/${id}/id.jpg`;
  return {faceKey, idKey}
}
