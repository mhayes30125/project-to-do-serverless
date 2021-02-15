import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS  from 'aws-sdk';
const docClient = new AWS.DynamoDB.DocumentClient();
const todosTable = process.env.TODOS_TABLE;
const userIdIndex = process.env.USER_ID_INDEX;
import { createLogger } from '../../utils/logger'

const logger = createLogger('getTodos')
import { getUserId } from '../auth/utilities';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  try{
    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const jwtToken = split[1];
  
    const userId = getUserId(jwtToken);
  
    const result = await docClient.query({
      TableName : todosTable,
      IndexName : userIdIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
          ':userId': userId
      }
  }).promise()
  
    const items = result.Items
  
    logger.info('GetTodos',items);
  
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        items
      })
    }
  }
  catch(e)
  {
    logger.error('Get Todo caused error.', {error: e});
  }

  return {
    statusCode: 500,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  }
}
