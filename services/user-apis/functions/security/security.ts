import { APIGatewayEvent, Handler } from 'aws-lambda';

//helpers
import { badRequest, failure, success } from '@lib/response-lib';
import { authWrapper } from '@lib/authWrapper';
import {
  getUpfrontAuthToken,
  processConsumerCallback,
  processPromotionCallback,
} from '@lib/security-lib';

//entities and types
import { User } from '@/db/entities/User';
import { Promotion } from '@/db/entities/Promotion';
import { TitleMetadata } from '@/db/entities/TitleMetadata';
import { IAuthTokenRequestBody, ITokenParams } from '@interfaces/security';

//services
import { PromotionService } from '@dbTransactions/promotion-service';
import { TitleMetadataService } from '@dbTransactions/title-meta-data-service';
import { PromotionCode } from '@/db/entities/PromotionCode';

//constants
import CONFIG from '../../../../config';
import { isUUID } from 'class-validator';
import { UserProduct } from '@/db/entities/UserProduct';
import { UserProductService } from '@dbTransactions/user-product-service';
import { generateDrmToken } from '@lib/user-lib';

export const getPromotionTokenHandler: Handler = async (event: APIGatewayEvent) => { //every one should be able to call this
  var request: IAuthTokenRequestBody;
  //validate body
  try {
    request = JSON.parse(event.body);
  } catch (error) {
    return await badRequest({ message: error.message || error });
  }

  if (!isUUID(request.titleId)) {
    return await badRequest({ message: 'Invalid title id' });
  }

  const titleId: string = request.titleId;
  const promotionId: number = request.promotionId;
  const token: string = request.token;

  const promotion: Promotion = await PromotionService.get(promotionId);
  if (!promotion) {
    return await badRequest({ message: 'Promotion not found' });
  }

  const movie: TitleMetadata = await TitleMetadataService.getTitleByUuId(titleId);

  const code: PromotionCode = promotion.promotionCodes.find((c) => c.token === token);

  if (!code) {
    return await badRequest({ message: 'Invalid token' });
  }

  const tokenParam: ITokenParams = {
    assetId: movie.assetId,
    accessToken: token,
    absoluteExpiration: promotion.endDateTime,
    userId: code.code,
  };

  const upfrontToken = getUpfrontAuthToken(tokenParam);

  return await success(upfrontToken);
};

export const getOnboardTokenHandler: Handler = authWrapper(null, async (event: APIGatewayEvent) => {
  var request: IAuthTokenRequestBody;
  //validate body
  try {
    request = JSON.parse(event.body);
  } catch (error) {
    return await badRequest({ message: error.message || error });
  }
  const user: User = event.requestContext.authorizer.dbUser;

  if (!isUUID(request.titleId)) {
    return await badRequest({ message: 'Invalid title id' });
  }

  const titleId: string = request.titleId;
  // const promotionId: number = request.promotionId;
  const accessToken: string = event.headers.Authorization;

  const movie: TitleMetadata = await TitleMetadataService.getTitleByUuId(titleId);

  var expirationTime;

  try {
    expirationTime = new Date(Date.parse(CONFIG.castlabs.tripEndTime));
  } catch (error) {
    return await failure({ message: error.message || error });
  }

  const tokenParam: ITokenParams = {
    assetId: movie.assetId,
    accessToken: accessToken,
    absoluteExpiration: expirationTime,
    userId: user.id,
  };

  const upfrontToken = getUpfrontAuthToken(tokenParam);

  return await success(upfrontToken);
});

export const getConsumerTokenHandler: Handler = authWrapper('User', async (event) => {
  var request: IAuthTokenRequestBody;
  //validate body
  try {
    request = JSON.parse(event.body);
  } catch (error) {
    return await badRequest({ message: error.message || error });
  }

  if (!isUUID(request.titleId)) {
    return await badRequest({ message: 'Invalid title id' });
  }

  const titleId: string = request.titleId;
  const movie: TitleMetadata = await TitleMetadataService.getTitleByUuId(titleId);

  const user: User = event.requestContext.authorizer.dbUser;
  const userProduct: UserProduct = await UserProductService.getUserValidProductByUser(user.id);
  if (!userProduct) return badRequest('User does not have valid product');

  const tokenParam: ITokenParams = {
    assetId: movie.assetId,
    accessToken: generateDrmToken(user.id, user.email),
    absoluteExpiration: userProduct.endDateTime,
    userId: user.id,
  };
  const crt = getUpfrontAuthToken(tokenParam);
  return await success(crt);
});

export const promotionAuthCallback: Handler = authWrapper(null, async (event) => {
  var request = JSON.parse(event.body);
  var userId = request.user;
  const codeLength = CONFIG.castlabs.promotionCodeLength;
  if (userId.length !== codeLength && isUUID(userId)) {
    return await processConsumerCallback(request, userId);
  } else {
    return await processPromotionCallback(request);
  }
});
