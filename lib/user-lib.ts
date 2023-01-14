import { User } from "@/db/entities/User";
import { UserService } from "@dbTransactions/user-service";
import * as Axios from "axios";
import * as Crypto from "crypto-js";
import { encryptPassword } from "./auth-lib";
import CONFIG from "../config";

export const findFBUser = async (socialSignInData: any): Promise<object> => {
  const providerBaseUrls = {
    facebook:
      "https://graph.facebook.com/me?fields=id,name,email,first_name,last_name,birthday&access_token=",
  };

  var token: string = socialSignInData.token;
  var provider: string = socialSignInData.provider;

  var path: string = providerBaseUrls[provider] + token;

  try {
    const response = await Axios.default.get<object>(path);

    if (response.status === 200) {
      const fbUserData: object = response.data;
      return fbUserData;
    } else throw new Error("Internal error when making request to Facebook");
  } catch (error) {
    throw new Error(error);
  }
};

export const findGoogleUser = async (socialSignInData: any): Promise<any> => {
  const { google } = require("googleapis");

  var OAuth2 = google.auth.OAuth2;

  var oauth2Client = new OAuth2();

  oauth2Client.setCredentials({ access_token: socialSignInData.token });

  var oauth2 = google.oauth2({
    auth: oauth2Client,
    version: "v2",
  });
  //use oauth2 to get google client
  return new Promise((resolve, reject) => {
    oauth2.userinfo.get(function (err, res) {
      if (err) {
        reject(err);
      } else {
        //return google user
        const googleUser = res.data;
        console.log("=========return google user========");
        console.log(googleUser);
        resolve(googleUser);
      }
    });
  });
};

const generateHash= (salt:string, message:string)=>{

  var hashArray: Crypto.lib.WordArray = Crypto.HmacSHA256(
    message,
    salt
  );
  const hashStr: string = hashArray.toString(Crypto.enc.Hex);
  return hashStr;
}



/**
 * generate a random drmtoken with userId and email
 * @param {string} userId - id of the user
 * @param {string} email - email of the user
 * @return {string} a random token without special character
 */
export const generateDrmToken = (userId: string, email: string): string => {
  var salt = CONFIG.drmTokenSalt;
  const message = `${userId}${email}${new Date().getFullYear()}`;
  const hashStr: string = generateHash(salt, message)
  return hashStr;
};


/**
 * generate a random reset token with userId and email
 * @param {string} userId - id of the user
 * @param {string} email - email of the user
 * @return {string} a random token without special character
 */
export const generateResetToken = (userId: string, email: string): string => {
  var salt = CONFIG.resetTokenSalt;
  const message = `${userId}${email}`;
  const hashStr: string = generateHash(salt, message)
  return hashStr;
};


export const generateActivationToken = (userId: string, email:string): string => {
  var salt = CONFIG.activationTokenSalt;
  const message = `${userId}${email}`;
  const hashStr: string = generateHash(salt, message)
  return hashStr;
};

/** 
* Reset user password
* @summary check token validity, then update user password
* @param {string} userId 
* @param {string} newPassword 
* @param {string} token 
* @return {User} Updated user
*/
export const resetPassword = async (
  userId: string,
  newPassword: string,
  token: string
) => {
  const user: User = await UserService.getUserById(userId);

  if (!user) {
    throw { message: "User not found" };
  }

  const newToken: string = generateResetToken(userId, user.email);

  if (newToken !== token) {
    throw { message: "Invalid token" };
  }

  user.hashedPassword = await encryptPassword(newPassword);

  return await UserService.updateUser(userId, user);
};
