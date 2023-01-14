import { User } from "../db/entities/User";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Callback,
  Context,
  Handler,
} from "aws-lambda";
import { forbidden, unauthorized } from "@lib/response-lib";
import {
  getAdminUser,
  getAuthenticatedUser,
} from "@lib/auth-lib";
import { UserService } from "../dbTransactions/user-service";
import { Admin } from "@/db/entities/Admin";

/** Wraps all API Lambda handlers with common middleware */
export const authWrapper = (
  userRole: string,
  handler: Handler,
  isContainingNonAuth: boolean = false
): ((
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback
) => Promise<APIGatewayProxyResult>) => async (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback
): Promise<APIGatewayProxyResult> => {
  // Not working on production
  // console.log("=================event headers================", event.headers.Authorization)
  if (isContainingNonAuth) {
    return handler(event, context, callback);
  }
  let user: User | Admin;

  try {
    if (userRole === "User") {
      //admin should be able to call user api
      user = await getAuthenticatedUser(event.headers);
      if (!user) user = await getAdminUser(event.headers);
    } else if (userRole === "Admin") user = await getAdminUser(event.headers);
    else {
      user = await getAuthenticatedUser(event.headers);
      if (!user) {
        user = await getAdminUser(event.headers);
      }
    }
  } catch (e) {
    return await unauthorized({ message: e.message });
  }
  if (!user) {
    return await forbidden({ message: "Not found user" });
  }
  try {
    // tryCheckUserRole(user, userRole);
    //check if user are activated
    if (user instanceof User) {
      if (!user.activated) return forbidden({ message: "User not activated" });
    }

    event.requestContext.authorizer = {
      dbUser: user,
    };
  } catch (e) {
    console.error(e);
    return await forbidden({ message: e.message });
  }
  return handler(event, context, callback);
};
