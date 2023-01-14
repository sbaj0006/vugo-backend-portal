import { APIGatewayEvent, Handler } from "aws-lambda";

// entities
import { User } from "@/db/entities/User";
import { Admin } from "@/db/entities/Admin";
import { userRequest } from "@interfaces/user";
import { IAccessTokenObj } from "@interfaces/auth";
import { UserSignIn } from "@/db/entities/UserSignIn";
import { UserProduct } from "@/db/entities/UserProduct";
import { SocialAccount } from "@/db/entities/SocialAccount";

//lib
import { createSignedCookie } from "@lib/aws-lib";
import {
  signToken,
  verifyHashedPassword,
  encryptPassword,
  createTokenObject,
} from "@lib/auth-lib";
import {
  findFBUser,
  findGoogleUser,
  generateActivationToken,
  generateDrmToken,
  generateResetToken,
  resetPassword,
} from "@lib/user-lib";
import { badRequest, failure, success, unauthorized } from "@lib/response-lib";
import { authWrapper } from "@lib/authWrapper";
import { sendAuthEmail, sendActivationEmail, Message } from "@lib/sendgrid-lib";

//services
import { UserService } from "@dbTransactions/user-service";
import { UserSignInService } from "@dbTransactions/user-sign-in-service";
import { UserProductService } from "@dbTransactions/user-product-service";
import { SocialAccountService } from "@dbTransactions/social-account-service";
import { UserPurchase } from "@/db/entities/UserPurchase";
import { UserPurchaseService } from "@dbTransactions/user-purchases-service";
import { TitleService } from "@dbTransactions/title-service";

//interfaces
import { userResponse } from "@interfaces/user";
import {
  ResetPasswordTemplate,
  ChangePasswordTemplate,
  AccountActivationTemplate,
} from "@interfaces/emailTemplates";
import CONFIG from "../../../../config";
import { mapProductResult } from "@lib/obj-mapper";

//for the typing check so we restrict the roleName value
const adminRoleName: "Admin" = "Admin";
const userRoleName: "User" = "User";

export const signUpHandler: Handler = async (event: APIGatewayEvent) => {
  let userData = JSON.parse(event.body);
  try {
    let userType: string = userRoleName;

    let checkUser: User = await UserService.getUserByEmail(userData["email"]);

    if (checkUser) {
      return await failure({ message: "User already exists" });
    }

    userData["roles"] = userType;
    userData["username"] = userData["email"];

    let hashedPassword: string = await encryptPassword(userData["password"]);

    userData["hashedPassword"] = hashedPassword;

    let newUser: User = await UserService.createUser(userData);

    const baseUrl = CONFIG.consumerAppBaseUrl;

    const activationToken = generateActivationToken(
      newUser.id,
      newUser.username
    );

    const activationUrl = `${baseUrl}account/activate?userId=${newUser.id}&token=${activationToken}`;
    const templateData: AccountActivationTemplate = {
      activationUrl: `${activationUrl}`,
    };

    const message: Message = {
      to: newUser.username,
      templateData: templateData,
    };
    let result = await sendActivationEmail(message, "activationTemplate");

    return success({ username: newUser.username });
  } catch (e) {
    return await failure({ message: e.message });
  }
};

export const updateUserHandler: Handler = authWrapper(
  userRoleName,
  async (event: APIGatewayEvent) => {
    try {
      const user: User | Admin = event.requestContext.authorizer.dbUser;
      const request = JSON.parse(event.body);
      user.firstName = request.firstName;
      user.lastName = request.lastName;
      if (user instanceof User) await UserService.updateUser(user.id, user);
      return success({ message: "Update user success" });
    } catch (error) {
      return failure({ message: error.message || error });
    }
  }
);

export const signInHandler: Handler = async (event: APIGatewayEvent) => {
  try {
    var userData: userRequest = JSON.parse(event.body);
    const user: User = await UserService.getUserByEmail(userData.email);
    if (!user) {
      return await unauthorized({ message: "Incorrect Credentials" });
    }

    if (!user.hashedPassword)
      return await unauthorized({
        message: "Social user cannot sign in with the endpoint",
      });

    ///////////password matching

    const match = await verifyHashedPassword(
      userData["password"],
      user.hashedPassword
    );

    if (!match) return await unauthorized({ message: "Incorrect Credentials" });

    let tokenObj: IAccessTokenObj = createTokenObject(user.id, 3600);

    const newSignIn: UserSignIn = new UserSignIn();
    newSignIn.deviceId = userData.deviceId;
    newSignIn.signInDateTime = new Date();
    newSignIn.user = user;
    newSignIn.ipAddress = userData.IpAddress

    await UserSignInService.createUserSingIn(newSignIn);

    const retUser: userResponse = {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userDrmToken: generateDrmToken(user.id, user.username),
      role: userRoleName,
    };

    const retObj = {
      ...retUser,
      token: tokenObj,
    };
    return success({ message: "success", data: retObj });
  } catch (e) {
    return await failure({ message: e.message || e });
  }
};

export const forgotPasswordHandler: Handler = async (
  event: APIGatewayEvent
) => {
  let request = JSON.parse(event.body);
  let email: string = request.email;
  const user: User = await UserService.getUserByEmail(email);
  if (!user)
    return badRequest({ message: `Cannot find user with email ${email}` });

  try {
    const resetToken: string = generateResetToken(user.id, email);
    const baseUrl = CONFIG.consumerAppBaseUrl;
    const resetUrl = `${baseUrl}account/reset-password?userId=${user.id}&token=${resetToken}`;
    const templateData: ResetPasswordTemplate = {
      resetUrl: `${resetUrl}`,
    };

    const message: Message = {
      to: email,
      templateData: templateData,
    };
    let result = await sendAuthEmail(message, "resetPasswordTemplate");

    return success("Reset password email has been sent.");
  } catch (e) {
    return await failure({ message: e.message || e });
  }
};

export const resetPasswordHandler: Handler = async (event: APIGatewayEvent) => {
  let passwordData = JSON.parse(event.body);
  const userId: string = event.pathParameters.userId;
  const token: string = passwordData.resetPasswordToken;
  const newPassword: string = passwordData.newPassword;
  try {
    const updatedUser: User = await resetPassword(userId, newPassword, token);
    if (updatedUser) return success("Password has been reset successfully.");
  } catch (e) {
    return await failure({ message: e.message || e });
  }
};

export const changePasswordHandler: Handler = async (
  event: APIGatewayEvent
) => {
  let passwordData = JSON.parse(event.body);
  const email: string = passwordData.email;
  const newPassword: string = passwordData.newPassword;
  const currentPassword: string = passwordData.currentPassword;

  try {
    const user: User = await UserService.getUserByEmail(email);

    if (user == null) {
      return await unauthorized({ message: "User not found" });
    }
    const match = await verifyHashedPassword(
      currentPassword,
      user.hashedPassword
    );

    if (!match) {
      return await unauthorized({ message: "Invalid current password" });
    }
    const baseUrl = CONFIG.consumerAppBaseUrl;
    const notMeUrl = `${baseUrl}account/forgot-password?email=${user.username}`;

    const templateData: ChangePasswordTemplate = {
      notMeUrl: `${notMeUrl}`,
    };

    const message: Message = {
      to: email,
      templateData: templateData,
    };

    await sendAuthEmail(message, "changePasswordTemplate");

    user.hashedPassword = await encryptPassword(newPassword);

    const updatedUser: User = await UserService.updateUser(user.id, user);

    if (updatedUser) return success("Password has been reset successfully.");
  } catch (e) {
    return await failure({ message: e.message || e });
  }
};

export const activateAccountHandler: Handler = async (
  event: APIGatewayEvent
) => {
  const token: string = JSON.parse(event.body).activationToken;
  const userId: string = event.pathParameters.userId;
  //validate by regenrating the token
  const user: User = await UserService.getUserById(userId);
  const checkToken = generateActivationToken(user.id, user.username);

  if (checkToken !== token) return unauthorized("Invalid token");

  try {
    const user: User = await UserService.getUserById(userId);
    user.activated = true;

    await UserService.updateUser(userId, user);

    return await success({ message: "User activated" });
  } catch (error) {
    return await failure({ message: error.message || error });
  }
};
export const getMeInfoHandler: Handler = authWrapper(
  userRoleName,
  async (event: APIGatewayEvent) => {
    try {
      // const { size, page } = event.queryStringParameters || { size: 10, page: 1};
      // const user = await UserService.getAllUser(+size, +page);
      const user: User | Admin = event.requestContext.authorizer.dbUser;

      delete user.hashedPassword;

      var userRole: "User" | "Admin";

      if (user instanceof User) userRole = userRoleName;
      if (user instanceof Admin) userRole = adminRoleName;

      const retUser: userResponse = {
        userId: user.id,
        email: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        userDrmToken: generateDrmToken(user.id, user.username),
        role: userRole,
      };

      return await success({ message: "success", data: retUser });
    } catch (e) {
      return await failure({ message: e.message || e });
    }
  }
);

export const getUserDeviceHandler: Handler = authWrapper(
  userRoleName,
  async (event: APIGatewayEvent) => {
    try {
      // const { size, page } = event.queryStringParameters || { size: 10, page: 1};
      // const user = await UserService.getAllUser(+size, +page);
      const user: User = event.requestContext.authorizer.dbUser;
      const userId: string = user.id;
      const results: UserSignIn[] = await UserSignInService.getUserDevice(
        userId
      );
      const deviceArr:string[] = results.map(res=> (res.deviceId))

      return await success({ message: "success", data: deviceArr });
    } catch (e) {
      return await failure({ message: e.message || e });
    }
  }
);

export const getUserActivitiesHandler: Handler = authWrapper(
  userRoleName,
  async (event: APIGatewayEvent) => {
    try {
      // const { size, page } = event.queryStringParameters || { size: 10, page: 1};
      // const user = await UserService.getAllUser(+size, +page);
      const user: User = event.requestContext.authorizer.dbUser;
      const userId: string = user.id;
      const results: UserSignIn[] = await UserSignInService.getUserSignInByUser(
        userId
      );

      return await success({ message: "success", data: results });
    } catch (e) {
      return await failure({ message: e.message || e });
    }
  }
);

export const signOutHandler: Handler = authWrapper(
  userRoleName,
  async (event: APIGatewayEvent) => {
    try {
      const token = event.headers.Authorization.replace("Bearer ", "");

      return await success({ message: "success" });
    } catch (e) {
      console.error("Error: ", e);
      return await failure({ message: e.message || e });
    }
  }
);

export const userProductHandler: Handler = authWrapper(
  userRoleName,
  async (event: APIGatewayEvent) => {
    try {
      // const { size, page } = event.queryStringParameters || { size: 10, page: 1};
      // const user = await UserService.getAllUser(+size, +page);
      // const userId: string = user.id;
      const userId:string = event.pathParameters.userId
      const results: UserProduct[] = await UserProductService.getUserProductByUser(
        userId
      );

      const mappedRes = mapProductResult(results);

      return await success({ message: "success", data: mappedRes });
    } catch (e) {
      console.error("Error: ", e);
      return await failure({ message: e.message || e });
    }
  }
);

export const purchaseHistoryHandler: Handler = authWrapper(
  userRoleName,
  async (event: APIGatewayEvent) => {
    try {
      // const { size, page } = event.queryStringParameters || { size: 10, page: 1};
      // const user = await UserService.getAllUser(+size, +page);
      const userId: string = event.pathParameters.userId;
      const checkUser: User = await UserService.getUserById(userId);
      if (!checkUser) {
        return await badRequest({ message: "Invalid User" });
      }

      const results: UserProduct[] = await UserProductService.getUserProductByUser(
        userId
      );
      ///rename the product return
      const mappedRes =mapProductResult(results)

      return await success({ message: "success", data: mappedRes });
    } catch (e) {
      console.error("Error: ", e);
      return await failure({ message: e.message });
    }
  }
);

export const userTitlesHandler: Handler = async (event: APIGatewayEvent) => {
  const userId: string = event.pathParameters.userId;
  const user: User = await UserService.getUserById(userId);
  if (!user) {
    return await badRequest({ message: "Invalid User" });
  }
  try {
    const retData: UserPurchase[] = await UserPurchaseService.getUserPurchaseByUser(
      userId
    );
    return success(retData);
  } catch (error) {
    return failure({ message: error.message || error });
  }
};

export const createUserPurchaseHandler: Handler = async (
  event: APIGatewayEvent
) => {
  const userId: string = event.pathParameters.userId;
  const titleId: string = event.pathParameters.titleId;
  var postData = JSON.parse(event.body);

  const user: User = await UserService.getUserById(userId);

  if (!user) {
    return await badRequest({ message: "Invalid User" });
  }
  try {
    const title = await TitleService.getTitleById(titleId);
    const newUserPurchase: UserPurchase = await UserPurchaseService.createUserPurchase(
      user,
      title,
      postData.duration
    );
    return success(newUserPurchase);
  } catch (error) {
    return failure({ message: error.message || error });
  }
};

export const getSignedCookieHandler: Handler = authWrapper(
  userRoleName,
  async (event: APIGatewayEvent) => {
    try {
      const cookie = await createSignedCookie();

      return await success({ message: "success", data: cookie });
    } catch (e) {
      console.error("Error: ", e);
      return await failure({ message: e.message || e });
    }
  }
);

export const socialSignInHandler: Handler = async (event: APIGatewayEvent) => {
  var socialSignInData: any = JSON.parse(event.body);
  var socialUser;

  try {
    if (socialSignInData.provider.toLowerCase() === "facebook")
      socialUser = await findFBUser(socialSignInData);

    if (socialSignInData.provider.toLowerCase() === "google")
      socialUser = await findGoogleUser(socialSignInData);
  } catch (error) {
    return await failure(error.message);
  }

  //if the social sign in credential is not correct
  if (!socialUser)
    return await unauthorized({ errorMessage: "User not found" });

  var user: User = await UserService.getUserByEmail(socialUser.email);
  let accessToken: string;

  if (!user) {
    let newUser = new User();
    //first name and last name have different name fields for google and facebook user
    //the ones with underscore are for google user
    newUser.firstName = socialUser["firstName"] || socialUser["given_name"];
    newUser.lastName = socialUser["lastName"] || socialUser["family_name"];
    newUser.username = socialUser["email"];
    newUser.email = socialUser["email"];
    try {
      await UserService.createUser(newUser);
    } catch (error) {
      return await failure(error);
    }

    user = newUser;

    let socialAccount = new SocialAccount();
    socialAccount.user = user;
    socialAccount.socialId = socialUser["id"];
    socialAccount.socialType = socialSignInData["provider"];
    socialAccount.details = JSON.stringify(socialUser);

    await SocialAccountService.insert(socialAccount);
  }
  const newSignIn: UserSignIn = new UserSignIn();
  newSignIn.deviceId = socialSignInData.deviceId;
  newSignIn.signInDateTime = new Date();
  newSignIn.user = user;


  await UserSignInService.createUserSingIn(newSignIn);

  const retUser: userResponse = {
    userId: user.id,
    email: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    userDrmToken: generateDrmToken(user.id, user.username),
    role: userRoleName,
  };

  accessToken = signToken(user.id);
  let tokenObj: IAccessTokenObj = <IAccessTokenObj>{
    access_token: accessToken,
    expires_in: 3600,
    token_type: "Bearer",
  };
  const retObj = {
    ...retUser,
    token: tokenObj,
  };

  return success(retObj);
};
