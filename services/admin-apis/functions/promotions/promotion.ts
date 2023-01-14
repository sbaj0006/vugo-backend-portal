import { APIGatewayEvent, Handler } from 'aws-lambda';
import { badRequest, failure, success } from '@lib/response-lib';
import { authWrapper } from '@lib/authWrapper';
import { PromotionService } from '../../../../dbTransactions/promotion-service';
import { TitleMetadataService } from '../../../../dbTransactions/title-meta-data-service';
import { PromotionCodeService } from '@dbTransactions/promotion-code-service';
import { CodeRedemptionService } from '../../../../dbTransactions/code-redemption-service';
var randomCode = require('randomstring');
const md5 = require('md5');

export const createPromotion: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      const req = JSON.parse(event.body);
      const titleId = req.titleId;
      const title = await TitleMetadataService.getTitleById(titleId);
      if (title) {
        const promotion = await PromotionService.insert(title, req);
        return await success({ message: 'success', data: promotion['id'] });
      }
      return await failure({ message: 'Titles Not Found' });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const getAllPromotions: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      const promotions = await PromotionService.getAllPromotions();
      return await success({
        message: 'success',
        data: promotions,
      });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const getPromotionById: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      let { promotionId } = event.pathParameters;
      const promotion = await PromotionService.getPromotionById(+promotionId);
      return await success({
        message: 'success',
        data: promotion,
      });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const updatePromotionById: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      let { promotionId } = event.pathParameters;
      const req = JSON.parse(event.body);
      const promotion = await PromotionService.updatePromotionById(+promotionId, req);
      return await success({
        message: 'success',
        data: promotion['id'],
      });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const getAllActivePromotions: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      const promotions = await PromotionService.getAllActivePromotions();
      return await success({
        message: 'success',
        data: promotions,
      });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const getPromotionByName: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      let { promotionName } = event.pathParameters;
      const promotion = await PromotionService.getPromotionByName(promotionName);
      if (promotion) {
        return await success({
          message: 'success',
          data: promotion,
        });
      }
      return await failure({ message: 'Not Found' });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const generatePromotionCodes: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      let { promotionId } = event.pathParameters;
      const req = JSON.parse(event.body);
      const numberOfCodes = req.numberOfCodes;
      const promotion = await PromotionService.getPromotionById(+promotionId);
      if (promotion) {
        for (var i = 0; i < numberOfCodes; i++) {
          const code = randomCode.generate({ length: 5, capitalization: 'uppercase' });
          const codes = await PromotionCodeService.insert(promotion, code);
        }
        return await success({
          message: 'success',
          data: 'Codes generated Successfully',
        });
      }
      return await failure({ message: 'Failed to generate new codes' });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const redeemCode: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      const req = JSON.parse(event.body);

      const promotionId = req.promotionId;
      const promotionCode = req.promotionCode;
      const email = req.email;

      const getCode = await PromotionCodeService.getCodeDetails(promotionCode, promotionId);
      let result;
      if (getCode) {
        if (!getCode.active) {
          if (getCode.email.localeCompare(email) === 0) {
            const redemption = await CodeRedemptionService.insert(getCode, new Date());
            result = await PromotionCodeService.getCodeDetails(promotionCode, promotionId);
          } else {
            return await failure({ message: `Code ${promotionCode} is already used.` });
          }
        } else {
          let hashedCode = md5(promotionCode);
          let hashedEmail = md5(email);
          let hashedDate = md5(new Date().toString());

          let hash = hashedCode + '-' + hashedEmail + '-' + hashedDate;

          const insert = {
            email: email,
            token: hash,
            active: false,
          };
          const redeem = await PromotionCodeService.redeemCode(getCode.id, insert);
          const redemption = await CodeRedemptionService.insert(getCode, new Date());
          result = await PromotionCodeService.getCodeDetails(promotionCode, promotionId);
        }
        return await success({
          message: 'success',
          data: result,
        });
      }
      return await failure({ message: 'Failed' });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const verifyToken: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      const req = JSON.parse(event.body);
      const token = req.token;
      const verify = await PromotionCodeService.verifyToken(token);
      if (verify) {
        const result = {
          isValid: true,
        };
        return await success({
          message: 'success',
          data: result,
        });
      }
      const result = {
        isValid: false,
      };
      return await failure({ message: 'failed', data: result });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const deletePromotion: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      let { promotionId } = event.pathParameters;
      const deletePromotions = await PromotionService.deletePromotions(+promotionId);
      return await success({ message: 'success', data: 'Promotion deleted successfully' });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);
