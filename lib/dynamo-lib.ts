import * as AWS from 'aws-sdk';
import { ScanInput } from 'aws-sdk/clients/dynamodb';
import CONFIG from '../config';

AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,
});

export const getItems = (tableName: string = ''): Promise<any> => {
  const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
  if (!tableName.length) {
    tableName = CONFIG.dynamo.DB_TABLE_NAME;
  }
  let items = [];
  let params: ScanInput = { TableName: tableName };
  return new Promise((resolve, reject) => {
    function onScan(err, data) {
      if (err) {
        console.error('Unable to scan the table. Error JSON:', JSON.stringify(err, null, 2));
        reject();
      } else {
        items = items.concat(data.Items);

        if (typeof data.LastEvaluatedKey !== 'undefined') {
          params.ExclusiveStartKey = data.LastEvaluatedKey;
          docClient.scan(params, onScan);
        } else {
          resolve(items);
        }
      }
    }
    docClient.scan(params, onScan);
  });
};
