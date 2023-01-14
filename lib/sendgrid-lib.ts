import CONFIG from "../config";
import {
  ResetPasswordTemplate,
  ChangePasswordTemplate,
  AccountActivationTemplate,
} from "@interfaces/emailTemplates";

export type Message = {
  to: string;
  templateData:
    | ResetPasswordTemplate
    | ChangePasswordTemplate
    | AccountActivationTemplate;
};

//message  example that works with the sendgrid
// {
//   "personalizations": [
//     {
//       "to": [
//         {
//           "email": "fabioyang781@gmail.com"
//         }
//       ],
//       "dynamic_template_data": {
//         "resetUrl": "www.google.com.au"
//       }
//     }
//   ],
//   "from": {
//     "email": "activate@vugo.com.au"

//   },

//   "template_id": "d-10b45e3855ca4c93a57b64c25f22bcd6"
// }
type sendGridMessage = {
  personalizations: [
    {
      to: [{ email: string }],
      dynamic_template_data:
      | ResetPasswordTemplate
      | ChangePasswordTemplate
      | AccountActivationTemplate,
    },
  ],
  from: { email: string, name?:string},
  templateId: string,
 
};

const setSendGridClient = () => {
  const sgMail = require("@sendgrid/mail");
  sgMail.setApiKey(CONFIG.sendgrid.apiKey);
  return sgMail;
};

const sendEmail = (sendMessage: sendGridMessage) => {
  console.log("========send message in email lib");
  console.log(sendMessage);
  const sgMail = setSendGridClient();
  return new Promise((resolve, reject) => {
    sgMail.send(sendMessage, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

export const sendAuthEmail = async (
  message: Message,
  templateName: "resetPasswordTemplate" | "changePasswordTemplate"
) => {
  const sendMessage: sendGridMessage = {
    personalizations: [
      {
        to: [{ email: message.to }],
        dynamic_template_data: message.templateData,
      },
    ],
    from: { email: CONFIG.sendgrid.activeFromName,
             name:CONFIG.sendgrid.defaultName},
    templateId: CONFIG.sendgrid[templateName],
  };

  try {
    return await sendEmail(sendMessage);
  } catch (err) {
    console.log("Auth email error");
    console.log(err);
    throw err;
  }
};

export const sendActivationEmail = async (
  message: Message,
  //restrict value to activationTemplate
  templateName: "activationTemplate" = "activationTemplate"
) => {
  const sendMessage: sendGridMessage = {
    personalizations: [
      {
        to: [{ email: message.to }],
        dynamic_template_data: message.templateData,
      },

    ],
    from: { email: CONFIG.sendgrid.activeFromName },
    templateId: CONFIG.sendgrid[templateName],
  };

  try {
    return await sendEmail(sendMessage);
  } catch (err) {
    console.log(err);
    throw err;
  }
};
