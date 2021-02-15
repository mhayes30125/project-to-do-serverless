import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../auth/utilities'
import * as AWS  from 'aws-sdk'
import { createLogger } from '../../utils/logger'

const logger = createLogger('deleteTodo')
const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  try{
    const todoId = event.pathParameters.todoId

    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const jwtToken = split[1];
    const userId = getUserId(jwtToken);
  
    await docClient.delete({
      TableName:todosTable,
      Key:{
        "userId" : userId,
        "todoId" : todoId,
      },
      ConditionExpression:"userId=:userId and todoId=:todoId",
      ExpressionAttributeValues: {
          ":userId": userId,
          ":todoId" : todoId
      }
    }).promise();
  
    logger.info('Deleted Todo',todoId);
  
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        todoId
      })
    }
  }
  catch(e)
  {
    logger.error('Delete ToDo caused error.', {error: e});
  }
  
  return {
    statusCode: 500,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  }
}
