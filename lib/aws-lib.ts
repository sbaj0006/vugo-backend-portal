import * as AWS from 'aws-sdk';
import CONFIG from '../config';

AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,
});


export const createSignedCookie = async () => {


  const privateKeyName: string = "vugo-staging-cf-private-key"
  const privateKey: string = process.env.CF_PRIVATE_KEY || await getAWSecrets(privateKeyName)
  console.log("===========private key is ===============")
  console.log(privateKey)

  const signer: AWS.CloudFront.Signer = await new AWS.CloudFront.Signer('PUBLIC_ACCESS_KEY', privateKey);

  const policy = JSON.stringify({
    Statement: [
      {
        Resource: `${CONFIG.s3.CLOUD_FRONT_URL}*`,//cdn.your-domain.com/*', // http* => http and https
        Condition: {
          DateLessThan: {
            'AWS:EpochTime':
              Math.floor(new Date().getTime() / 1000) + 60 * 60 * 1, // Current Time in UTC + time in seconds, (60 * 60 * 1 = 1 hour)
          },
        },
      },
    ],
  });

  const cookies = await signer.getSignedCookie({ policy })
  return cookies

}

export const getAWSecrets = async (secretName: string) => {


  var secret: string
  // Create a Secrets Manager client
  var client: AWS.SecretsManager = await new AWS.SecretsManager({
    region: process.env.REGION,
  });


  return new Promise<string>((resolve, reject) => {
    client.getSecretValue({ SecretId: secretName }, function (err, data) {
      if (err) {
        console.log(`============secret manager error with name ${secretName}==========`)
        console.log('aws config is ')

        console.log(JSON.stringify({
          accessKeyId: process.env.ACCESS_KEY_ID,
          secretAccessKey: process.env.SECRET_ACCESS_KEY,
          region: process.env.REGION,
        }))
        console.log(err)
        reject(err)
      }
      else {

        if ('SecretString' in data) {
          secret = data.SecretString;
        } else {
          // let buff = new Buffer(data.SecretBinary, 'base64');
          secret = data.SecretBinary.toString('ascii');
        }
        resolve(secret)
      }
    })

  })
}
