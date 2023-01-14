import { TitleGroup } from '@/db/entities/TitleGroup';
import { TitleMetadata } from '@/db/entities/TitleMetadata';
import { User } from '@/db/entities/User';
import { UserPurchase } from '@/db/entities/UserPurchase';
import { Genre } from '@/enums/Genre';
import { MovieRating } from '@/enums/MovieRating';
import { PromotionService } from '@dbTransactions/promotion-service';
import { SeriesService } from '@dbTransactions/series-service';
import { TitleGroupService } from '@dbTransactions/title-group-service';
import { TitleMetadataService } from '@dbTransactions/title-meta-data-service';
import { UserPurchaseService } from '@dbTransactions/user-purchases-service';
import { IUpdateGroupTitlesRequest } from '@interfaces/update-group-titles-request';
import { IUpdateTitleRequest } from '@interfaces/update-title-request';
import { IUpsertTitleGroupRequest } from '@interfaces/upsert-title-group-request';
import { getAuthenticatedUser } from '@lib/auth-lib';
import { authWrapper } from '@lib/authWrapper';
import { getItems } from '@lib/dynamo-lib';
import { ObjMapper } from '@lib/obj-mapper';
import { badRequest, failure, success } from '@lib/response-lib';
import { enumToArray } from '@lib/util-lib';
import { APIGatewayEvent, Handler } from 'aws-lambda';

export const listHandler: Handler = authWrapper(
  'Admin',
  async (event: APIGatewayEvent) => {
    const movies = await TitleMetadataService.getMovies();
    return await success({
      message: 'success',
      data: movies,
    });
  },
  true,
);

export const createHandler: Handler = authWrapper(
  'Admin',
  async (event: APIGatewayEvent) => {
    try {
      const titleRequest = <IUpdateTitleRequest>JSON.parse(event.body);
      const title = ObjMapper(titleRequest, (e) => e);
      title.titleName = titleRequest.title;
      title.dashUrl = titleRequest.url;
      const insertRes = await TitleMetadataService.insert(<TitleMetadata>title);
      return await success({
        message: 'success',
        data: insertRes,
      });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const updateHandler: Handler = authWrapper(
  'Admin',
  async (event: APIGatewayEvent) => {
    try {
      let { videoId } = event.pathParameters;
      const titleRequest = <IUpdateTitleRequest>JSON.parse(event.body);

      const title = ObjMapper(titleRequest, (e) => e);
      title.titleName = titleRequest.title;
      title.dashUrl = titleRequest.url;
      delete title.url;
      delete title.title;

      const updateRes = await TitleMetadataService.updateById(videoId, <TitleMetadata>title);
      return await success({
        message: 'success',
        data: updateRes,
      });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const deleteHandler: Handler = authWrapper(
  'Admin',
  async (event: APIGatewayEvent) => {
    try {
      let { videoId } = event.pathParameters;

      const movie = await TitleMetadataService.getMovieById(videoId);

      const promotions = await PromotionService.getAllActivePromotions();
      const usedByPromotions = promotions.find((p) => p.title.titleUuid === videoId);
      if (!!usedByPromotions) {
        return await failure('Title is used by active promotions');
      }

      const usedByEpisodes = (await SeriesService.getAllSeries(10000))[0]
        .flatMap((s) => s.seasons)
        .flatMap((s) => s.episodes)
        .find((e) => e.titleMetaData.titleId === movie.index);
      if (!!usedByEpisodes) {
        return await failure('Title is used by episodes');
      }

      await TitleMetadataService.deleteById(videoId);
      return await success({
        message: 'success',
        data: null,
      });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const publishHandler: Handler = authWrapper(
  'Admin',
  async (event: APIGatewayEvent) => {
    try {
      let { videoId } = event.pathParameters;
      await TitleMetadataService.publishTitle(videoId);

      return await success({
        message: 'success',
        data: true,
      });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const unpublishHandler: Handler = authWrapper(
  'Admin',
  async (event: APIGatewayEvent) => {
    try {
      let { videoId } = event.pathParameters;
      await TitleMetadataService.unpublishTitle(videoId);

      return await success({
        message: 'success',
        data: true,
      });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const getTitleGroupsHandler: Handler = authWrapper(
  '',
  async (event: APIGatewayEvent) => {
    try {
      const result = await TitleGroupService.getTitleGroups();
      return await success({
        message: 'success',
        data: result,
      });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const getTitleGroupByIdHandler: Handler = authWrapper(
  '',
  async (event: APIGatewayEvent) => {
    try {
      let { groupId } = event.pathParameters;
      const result = await TitleGroupService.getTitleGroupById(+groupId);
      return await success({
        message: 'success',
        data: result,
      });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const getRatingsHandler: Handler = authWrapper(
  'Admin',
  async (event: APIGatewayEvent) => {
    try {
      const result = enumToArray(MovieRating);
      return await success({
        message: 'success',
        data: result,
      });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const getGenresHandler: Handler = authWrapper(
  'Admin',
  async (event: APIGatewayEvent) => {
    try {
      const result = enumToArray(Genre);
      return await success({
        message: 'success',
        data: result,
      });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const getByIdHandler: Handler = async (event: APIGatewayEvent) => {
  let { videoId } = event.pathParameters;
  var movie;
  try {
    movie = await TitleMetadataService.getMovieById(videoId);
  } catch (error) {
    //if movie not found
    return await badRequest(error);
  }
  let user: User, userPurchase: UserPurchase;
  try {
    user = await getAuthenticatedUser(event.headers);
  } catch (e) {}

  if (!!user) {
    const getResult = await UserPurchaseService.getUserPurchaseByUser(user.id);
    userPurchase = getResult.find((t) => t.titleMetaData.titleUuid === videoId);
  }
  return await success({
    message: 'success',
    data: {
      title: movie,
      userPurchase: userPurchase,
    },
  });
};

export const getMediaFilesHandler: Handler = authWrapper(
  'Admin',
  async (event: APIGatewayEvent) => {
    try {
      const result = await getItems();

      return await success({
        message: 'success',
        data: result,
      });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const createGroupHandler: Handler = authWrapper(
  'Admin',
  async (event: APIGatewayEvent) => {
    try {
      const upsertTitleGroupRequest = <IUpsertTitleGroupRequest>JSON.parse(event.body);
      const titleGroup = ObjMapper(upsertTitleGroupRequest, (e) => e);
      const result = await TitleGroupService.insert(<TitleGroup>titleGroup);

      return await success({
        message: 'success',
        data: result,
      });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const updateGroupHandler: Handler = authWrapper(
  'Admin',
  async (event: APIGatewayEvent) => {
    try {
      let { groupId } = event.pathParameters;
      const upsertTitleGroupRequest = <IUpsertTitleGroupRequest>JSON.parse(event.body);
      const titleGroup = <TitleGroup>ObjMapper(upsertTitleGroupRequest, (e) => e);
      titleGroup.id = +groupId;
      const result = await TitleGroupService.update(titleGroup.id, <TitleGroup>titleGroup);

      return await success({
        message: 'success',
        data: result,
      });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const updateGroupedTitlesHandler: Handler = authWrapper(
  'Admin',
  async (event: APIGatewayEvent) => {
    try {
      let { groupId } = event.pathParameters;
      const titleGroup = await TitleGroupService.getTitleGroupById(+groupId);
      if (!titleGroup) {
        return await failure({ message: 'title group not found' });
      }

      const updateGroupTitlesRequest = <IUpdateGroupTitlesRequest>JSON.parse(event.body);
      const result = await TitleGroupService.updateGroupTitles(
        +groupId,
        updateGroupTitlesRequest.titleIds,
      );

      return await success({
        message: 'success',
        data: result,
      });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const deleteGroupedTitleHandler: Handler = authWrapper(
  'Admin',
  async (event: APIGatewayEvent) => {
    try {
      let { groupId, titleId } = event.pathParameters;
      await TitleGroupService.deleteGroupedTitle(+groupId, +titleId);

      return await success({
        message: 'success',
        data: null,
      });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);

export const deleteTitleGroupHandler: Handler = authWrapper(
  'Admin',
  async (event: APIGatewayEvent) => {
    try {
      let { groupId } = event.pathParameters;
      await TitleGroupService.deleteTitleGroup(+groupId);

      return await success({
        message: 'success',
        data: null,
      });
    } catch (e) {
      return await failure({ message: e.message });
    }
  },
  true,
);
