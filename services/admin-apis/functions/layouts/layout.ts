import { APIGatewayEvent, Handler } from 'aws-lambda';
import { badRequest, failure, success } from '@lib/response-lib';
import { authWrapper } from '@lib/authWrapper';
import { LayoutService } from '@dbTransactions/layout-service';
import { RailService } from '../../../../dbTransactions/rail-service';
import { VugoPage } from '../../../../enums/VugoPage';
import { error } from 'console';
import { TitleMetadataService } from '../../../../dbTransactions/title-meta-data-service';
import { RailTitleService } from '../../../../dbTransactions/rail-title-service';
import { RailType } from '../../../../enums/RailType';
import { mapRailResponse } from '../../../../lib/response-map-lib/rails';
import { enumToArray } from '@lib/util-lib';
import { Rail } from '@/db/entities/Rail';

export const upsertPage: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      const layoutToSave = JSON.parse(event.body);
      const pageLayout = await LayoutService.upsertPage(layoutToSave);

      const rails: Rail[] = layoutToSave.pageRails;
      const existingRails = pageLayout.pageRails;
      for (let rail of rails) {
        rail.type = RailType[rail.type + ''];
        if (!!existingRails.find((r) => r.id === rail.id)) {
          //update rail
          await RailService.updatePageRail(rail.id, rail);
        } else {
          //insert rail
          await RailService.insertRail(pageLayout, rail);
        }
      }
      for (let existingRail of existingRails) {
        if (!rails.find((r) => r.id === existingRail.id)) {
          //delete rail
          await RailTitleService.deleteRailTitles(existingRail.id);
          await RailService.deleteRail(existingRail);
        }
      }
      return await success({ message: 'success', result: pageLayout });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const postRailTitles: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      let { railId } = event.pathParameters;
      const titles = JSON.parse(event.body);
      const rail = await RailService.getRailById(railId);
      if (rail) {
        await RailTitleService.deleteRailTitles(rail.id);
        var railTitle;
        titles.forEach(async (t) => {
          const title = await TitleMetadataService.getTitleByUuId(t);
          if (title) {
            railTitle = await RailTitleService.insert(rail, title);
          }
        });
        return await success({ message: 'success', data: 'Rail titles updated successfully' });
      }
      return await failure({ message: 'Rail/Title not found' });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const getAllRailTypes: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      const railTypes = enumToArray(RailType);

      return await success({ message: 'success', data: railTypes });
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

      return await success({ message: 'Success', data: rail });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);
