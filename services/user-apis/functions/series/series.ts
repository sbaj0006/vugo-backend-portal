import { APIGatewayEvent, Handler } from 'aws-lambda';
import { failure, success } from '@lib/response-lib';
import { authWrapper } from '@lib/authWrapper';
import { SeriesService } from '../../../../dbTransactions/series-service';

export const getAllPublishedSeries: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      const { size, page } = event.queryStringParameters || { size: 10, page: 1 };
      const publishedSeries = await SeriesService.getAllPublishedSeries(+size, +page);
      return await success({
        message: 'success',
        data: publishedSeries[0],
        totalCount: publishedSeries[1],
        size,
        page,
      });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const getSeriesByUuid: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      let { seriesUuid } = event.pathParameters;
      const series = await SeriesService.getSeriesByUuid(seriesUuid);
      return await success({ message: 'success', data: series });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);
