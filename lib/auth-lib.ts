import * as jwt from 'jsonwebtoken';
import * as Axios from 'axios';

import { User } from '@/db/entities/User';
import { UserService } from '@dbTransactions/user-service';

import * as fs from 'fs';
import CONFIG from '../config';

import { privateKey } from './private.key'
import { publicKey } from './public.pem'



import {IAccessTokenObj } from '@interfaces/auth'
import { Admin } from '@/db/entities/Admin';
import { AdminService } from '@dbTransactions/admin-service';

var jwkToPem = require('jwk-to-pem');

const bcrypt = require('bcryptjs');

var jwtSecret = CONFIG.jwtSecret;


export const encryptPassword = async(plainTextPassword:string):Promise<string> =>{
  let saltRounds:number = 10;
  var salt = bcrypt.genSaltSync(saltRounds);
  let hashedPassword:string = bcrypt.hashSync(plainTextPassword, salt); 
  return hashedPassword
}


export const verifyHashedPassword = async(plainTextPassword:string, hashedPassword:string):Promise<boolean> =>{
  
  let match:boolean = bcrypt.compareSync(plainTextPassword, hashedPassword); 
  return match
}






export const getAdminUser = async (headers: any): Promise<Admin> => {
  if (!headers || !headers.Authorization) {
    throw new Error(`Authorization header does not exist`);
  }

  const token = headers.Authorization.replace('Bearer ', '');

  var decodedToken;
  try {
      //verify returns decoded token with signature validated
    decodedToken = await jwt.verify(token, jwtSecret);

  if (!decodedToken) {
    throw new Error(`Invalid Authorization token`);
  }

  } catch (err) {

    throw err;
  }

  let admin: Admin;
  //decoded token by jwt.verify will not have payload
  const userId: string = decodedToken.userId;


  admin = await AdminService.getAdminById(userId);

  return admin;

}

export const getAuthenticatedUser = async (headers: any): Promise<User> => {
  if (!headers || !headers.Authorization) {
    throw new Error(`Authorization header does not exist`);
  }

  const token = headers.Authorization.replace('Bearer ', '');

  let decodedToken;



  try {

  //verify returns decoded token with signature validated
  decodedToken = await jwt.verify(token, jwtSecret);

  if (!decodedToken) {
    throw new Error(`Invalid Authorization token`);
  }

  let verifiedUser: User;
  
  const userId: string = decodedToken.userId;

  verifiedUser = await UserService.getUserById(userId);

  return verifiedUser;

  } catch (err) {

    throw new Error(`Invalid Authorization token`);;
  }
  
};




export const createTokenObject = (userId:string, expirationTime:number): IAccessTokenObj =>{
  const token = signToken(userId);

  return <IAccessTokenObj>{
    "access_token": token,
    "expires_in": expirationTime,
    "token_type": "Bearer"
  }
}


export const signToken = (userId: string): string => {

  const token = jwt.sign({ userId, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) }, jwtSecret); // token expires in 24 hrs
  return token;
}


