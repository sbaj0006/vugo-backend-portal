import { APIGatewayEvent, Handler } from 'aws-lambda';
import { badRequest, failure, success } from '@lib/response-lib';
import { authWrapper } from '@lib/authWrapper';
import { SeriesService } from '../../../../dbTransactions/series-service';
import { SeasonService } from '../../../../dbTransactions/season-service';
import { error } from 'console';
import { EpisodeService } from '@dbTransactions/episode-service';
import { TitleMetadataService } from '../../../../dbTransactions/title-meta-data-service';

export const createSeries: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      const series = await SeriesService.insert(JSON.parse(event.body));
      return await success({ message: 'success', data: series['id'] });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const getAllSeries: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      const { size, page } = event.queryStringParameters || { size: 1000, page: 1 };
      const series = await SeriesService.getAllSeries(+size, +page);
      return await success({ message: 'success', data: series[0], totalCount: series[1], size, page });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const getSeriesById: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      let { seriesId } = event.pathParameters;
      const seriesData = await SeriesService.getSeriesById(+seriesId);
      for (let ss of seriesData.seasons) {
        for (let e of ss.episodes) {
          e['title'] = e.titleMetaData.titleName;
        }
      }

      if (seriesData) {
        return await success({ message: 'success', data: seriesData });
      }
      return await failure({ message: 'Series not found' });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const updateSeriesById: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      let { seriesId } = event.pathParameters;
      const req = JSON.parse(event.body);
      const updatedSeries = await SeriesService.updateSeriesById(+seriesId, req);
      return await success({ message: 'success', data: updatedSeries['id'] });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const createSeason: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      let { seriesId } = event.pathParameters;
      const req = JSON.parse(event.body);
      const series = await SeriesService.getSeriesById(+seriesId);
      if (series) {
        const season = await SeasonService.insert(series, req);
        return await success({ message: 'success', data: season.id });
      }
      return await failure({ message: 'Series not found' });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const updateSeasonById: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      let { seriesId, seasonId } = event.pathParameters;
      const req = JSON.parse(event.body);
      const series = await SeriesService.getSeriesById(+seriesId);
      if (series) {
        const season = await SeasonService.getSeasonById(+seasonId);
        if (season) {
          const update = await SeasonService.updateSeasonById(series, +seasonId, req);
          return await success({ message: 'success', data: update.id });
        }
        return await failure({ message: 'Season not found' });
      }
      return await failure({ message: 'Series not found' });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const createEpisode: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      let { seriesId, seasonId } = event.pathParameters;
      const req = JSON.parse(event.body);
      const series = await SeriesService.getSeriesById(+seriesId);
      if (series) {
        const season = await SeasonService.getSeasonById(+seasonId);
        if (season) {
          const titleId = req.titleId;
          const titles = await TitleMetadataService.getTitleById(titleId);
          if (titles) {
            const episode = await EpisodeService.insert(series, season, titles, req);
            return await success({
              message: 'success',
              data: episode.id,
            });
          }
          return await failure({ message: 'Title not found' });
        }
        return await failure({ message: 'Season not found' });
      }
      return await failure({ message: 'Series not found' });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const updateEpisodeById: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      let { seriesId, seasonId, episodeId } = event.pathParameters;
      const req = JSON.parse(event.body);
      const series = await SeriesService.getSeriesById(+seriesId);
      if (series) {
        const season = await SeasonService.getSeasonById(+seasonId);
        if (season) {
          const episode = await EpisodeService.getEpisodeById(+episodeId);
          if (episode) {
            const update = await EpisodeService.updateEpisodeById(+episodeId, req);
            return await success({ message: 'success', data: update.id });
          }
          return await failure({ message: 'Episode not found' });
        }
        return await failure({ message: 'Season not found' });
      }
      return await failure({ message: 'Series not found' });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const publishSeries: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      let { seriesId } = event.pathParameters;
      const publish = await SeriesService.publishSeries(+seriesId);
      return await success({ message: 'success', data: 'Series published successfully' });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const unpublishSeries: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      let { seriesId } = event.pathParameters;
      const publish = await SeriesService.unpublishSeries(+seriesId);
      return await success({ message: 'success', data: 'Series unpublished successfully' });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const publishSeason: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      let { seasonId } = event.pathParameters;
      const publish = await SeasonService.publishSeason(+seasonId);
      return await success({ message: 'success', data: 'Season published successfully' });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const unpublishSeason: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      let { seasonId } = event.pathParameters;
      const publish = await SeasonService.unpublishSeason(+seasonId);
      return await success({ message: 'success', data: 'Season unpublished successfully' });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const publishEpisode: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      let { episodeId } = event.pathParameters;
      const publish = await EpisodeService.publishEpisode(+episodeId);
      return await success({ message: 'success', data: 'Episode published successfully' });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const unpublishEpisode: Handler = authWrapper(
  null,
  async (event: APIGatewayEvent) => {
    try {
      let { episodeId } = event.pathParameters;
      const publish = await EpisodeService.unpublishEpisode(+episodeId);
      return await success({ message: 'success', data: 'Episode unpublished successfully' });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const getAllPublishedSeries: Handler = authWrapper(null, async (event: APIGatewayEvent) => {
  try {
    const publishedSeries = await SeriesService.getAllPublishedSeries();
    return await success({ message: 'success', data: publishedSeries });
  } catch (e) {
    return await failure({ message: e.message });
  }
});
