import { APIGatewayEvent, Handler } from 'aws-lambda';
import { badRequest, failure, success } from '@lib/response-lib';
import { authWrapper } from '@lib/authWrapper';
import { LayoutService } from '@dbTransactions/layout-service';
import { RailService } from '../../../../dbTransactions/rail-service';
import { VugoPage } from '../../../../enums/VugoPage';
import { RailTitleService } from '../../../../dbTransactions/rail-title-service';
import { RailType } from '../../../../enums/RailType';
import { mapRailResponse } from '../../../../lib/response-map-lib/rails';
import { enumToArray } from '@lib/util-lib';

export const getAllRailTypes: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      try {
        const railTypes = enumToArray(RailType);

        return await success({ message: 'success', data: railTypes });
      } catch (e) {
        return await failure({ message: e.message });
      }
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const getLayoutRails: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      const { page } = event.pathParameters;
      let enumKey = VugoPage[page];
      const pageId = await LayoutService.getPageIdByType(enumKey);
      const allRails = await RailService.listRailsByLayoutPage(pageId);
      const data = {
        pageType: page,
        pageRails: allRails.map(mapRailResponse),
      };
      return await success({
        message: 'success',
        data: data,
      });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const getRailTitles: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      let { railId } = event.pathParameters;
      const rail = await RailTitleService.getRailById(railId);
      var titles = [];
      rail.forEach(async (t) => {
        titles.push(t.titleMetaData);
      });

      return await success({ message: 'Success', data: titles });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);
