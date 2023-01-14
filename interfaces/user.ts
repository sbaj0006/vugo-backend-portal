export interface IUserProfile{
    id: string,
    cognito_uuid: string,
    username: string,
    email: string
  }

  
export interface userRequest{
  email:string,
  password:string,
  firstName:string,
  lastName:string,
  deviceId:string,
  IpAddress:string
}

export interface userResponse{
  email:string,
  firstName:string,
  lastName:string,
  userDrmToken:string,
  userId:string
  role: 'User' | 'Admin'
}



const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
export interface userData{

  Username:string,
  Pool: typeof AmazonCognitoIdentity
}