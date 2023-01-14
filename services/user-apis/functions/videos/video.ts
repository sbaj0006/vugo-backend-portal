import { User } from '@/db/entities/User';
import { UserPurchase } from '@/db/entities/UserPurchase';
import { TitleGroupService } from '@dbTransactions/title-group-service';
import { TitleMetadataService } from '@dbTransactions/title-meta-data-service';
import { UserPurchaseService } from '@dbTransactions/user-purchases-service';
import { getAuthenticatedUser } from '@lib/auth-lib';
import { authWrapper } from '@lib/authWrapper';
import { badRequest, failure, success } from '@lib/response-lib';
import { APIGatewayEvent, Handler } from 'aws-lambda';

export const listHandler: Handler = async (event: APIGatewayEvent) => {
  const movies = await TitleMetadataService.getMovies(true);
  return await success({
    message: 'success',
    data: movies,
  });
};

export const getByIdHandler: Handler = async (event: APIGatewayEvent) => {
  let { videoId } = event.pathParameters;
  const movie = await TitleMetadataService.getMovieById(videoId);
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
