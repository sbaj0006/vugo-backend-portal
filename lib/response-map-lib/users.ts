import { User } from '@/db/entities/User';
import { IUserProfile } from '@interfaces/user';

export const mapUserResponse = (user: User): IUserProfile => ({
  id: user.id,
  username: user.username,
  email: user.email,
  cognito_uuid: ""
});
