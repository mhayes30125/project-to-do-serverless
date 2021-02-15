import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS  from 'aws-sdk';
const docClient = new AWS.DynamoDB.DocumentClient();
const todosTable = process.env.TODOS_TABLE;
import { createLogger } from '../../utils/logger'

const logger = createLogger('getTodo')
import { getUserId } from '../auth/utilities';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  try{
    const todoId = event.pathParameters.todoId

    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const jwtToken = split[1];
  
    const userId = getUserId(jwtToken);
  
    logger.info(`Get Todo ${todoId}, ${userId}`);

    const result = await docClient.query({
      TableName : todosTable,
      KeyConditionExpression: 'userId = :userId and todoId = :todoId',
      ExpressionAttributeValues: {
          ':userId': userId,
          ':todoId' : todoId
      }
  }).promise()
  
    const item = result.Items[0]
  
    logger.info('Get Todo',{item});
  
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        item
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
