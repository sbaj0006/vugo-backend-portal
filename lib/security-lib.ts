import * as jwt from "jsonwebtoken";
import { createGuid } from "./util-lib";
import { badRequest, failure, success } from "@lib/response-lib";

import CONFIG from "../config";
import { ITokenParams } from "@interfaces/security";
import { UserService } from "@dbTransactions/user-service";
import { User } from "@/db/entities/User";
import { generateDrmToken } from "./user-lib";
import { UserProduct } from "@/db/entities/UserProduct";
import { UserProductService } from "@dbTransactions/user-product-service";
import { PromotionService } from "@dbTransactions/promotion-service";
import { Promotion } from "@/db/entities/Promotion";
import { PromotionCode } from "@/db/entities/PromotionCode";
import { TitleMetadata } from "@/db/entities/TitleMetadata";
import { TitleMetadataService } from "@dbTransactions/title-meta-data-service";

export const getUpfrontAuthToken = (request: ITokenParams) => {
  var jwtSecret: string = CONFIG.castlabs.sharedSecrets;
  var merchant: string = CONFIG.castlabs.merchantName;
  var tokenClaim = {
    iat: Math.round(new Date().getTime() / 1000),
    Jti: <string>createGuid(),
    optData: {
      userId: request.userId,
      merchant: merchant,
      SessionId: request.accessToken,
    },
    crt: getCustomRightsToken(request.assetId, request.absoluteExpiration),
  };

  const securityTokenParams = {
    subject: tokenClaim,
    expires: request.absoluteExpiration,
  };

  const securityToken = jwt.sign(securityTokenParams, jwtSecret);
  return securityToken;
};

export const getCustomRightsToken = (
  assetId: string,
  absoluteExpiration: Date
): object => {
  let customerRightsToken = {
    assetId: assetId,
    outputProtection: {
      analogue: true,
      enforce: false,
    },
    storeLicense: true,
    enhancedOutputProtection: {
      eopConfig: {
        HD: {
          playReady: {
            minSL: 3000,
            analogVideoOPL: 200,
            compressedDigitalVideoOPL: 500,
            uncompressedDigitalVideoOPL: 300,
            compressedDigitalAudioOPL: 100,
            uncompressedDigitalAudioOPL: 100,
            allowUnknown: false,
            allowDTCP: false,
          },
          WidevineM: {
            minSL: 5,
            requireHDCP: "HDCP_V1",
          },
          OMA: {
            deny: true,
          },
        },
        SD: {
          playReady: {
            minSL: 2000,
            analogVideoOPL: 200,
            compressedDigitalVideoOPL: 400,
            uncompressedDigitalVideoOPL: 300,
            compressedDigitalAudioOPL: 100,
            uncompressedDigitalAudioOPL: 100,
            allowUnknown: true,
            allowDTCP: true,
          },
          WidevineM: {
            minSL: 1,
            requireHDCP: "HDCP_NONE",
          },
          OMA: {
            allowDTCP: true,
            requireHDCP: "HDCP_NONE",
          },
        },
      },
    },
    profile: {
      rental: {
        absoluteExpiration: absoluteExpiration.toISOString() + "Z",
      },
    },
  };
  return customerRightsToken;
};

export const processConsumerCallback = async (request,userId:string) => {
  //check if user exist with the request
  const user: User = await UserService.getUserById(userId);
  if (!user) {
    return await success({
      message: "not granted",
      reason: "Invalid User Id - Could not find user",
    });
  }
  //generate a new drmtoken with the user
  const expectedSession: string = generateDrmToken(user.id, user.username);
  //check if drmtoken is the same with the session id
  if (expectedSession !== request.session) {
    return await success({
      message: "not granted",
      reason: "Invalid Session Id - Expected a valid Callback Token",
    });
  }
  //check if userProduct end datetime is before today
  const userProduct: UserProduct = await UserProductService.getUserValidProductByUser(
    user.id
  );
  if (!userProduct) {
    return await success({
      message: "not granted",
      reason: "No valid user product",
    });
  }

  const crt = getCustomRightsToken(request.assetId, userProduct.endDateTime);
  return success(crt);
};

export const processPromotionCallback = async (request) => {
  //check if there is a promotion code entity with the token
  const promotions: Promotion[] = await PromotionService.getAllActivePromotions();
  const sessionId: string = request.session;

  var code: PromotionCode;
  var promotion: Promotion;

  //regard this https://stackoverflow.com/questions/6260756/how-to-stop-javascript-foreach/6260865
  promotions.every((p) => {
    code = p.promotionCodes.find((c) => c.token === sessionId);
    if (code) {
      promotion = p;
      //return false to break
      return false;
    }
    return true;
  });

  if (!code) {
    return success({
      message: "not granted",
      reason: "Invalid Session Id - Expected a valid redemption token",
    });
  }

  //check if the code === user returned by request
  if (code.code !== request.user) {
    return success({
      message: "not granted",
      reason: "Invalid User. Expected a valid redemption code",
    });
  }
  //check if the titleId of the title in the promotion === Asset from request
  const title: TitleMetadata = await TitleMetadataService.getTitleByUuId(
    promotion.title.titleUuid
  );
  if (title.assetId !== request.asset) {
    return success({
      message: "not granted",
      reason: "Invalid Asset",
    });
  }

  const crt = getCustomRightsToken(request.asset, promotion.endDateTime)

  return success(crt)
};
