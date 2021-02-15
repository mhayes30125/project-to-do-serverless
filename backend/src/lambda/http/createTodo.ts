import 'source-map-support/register'
import * as uuid from 'uuid'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import * as AWS  from 'aws-sdk'
import { getUserId } from '../auth/utilities'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createTodo')
const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  try{
    const newTodo: CreateTodoRequest = JSON.parse(event.body)

    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const jwtToken = split[1];
  
    const newToDoItem = {
      todoId : uuid.v4(),
      userId : getUserId(jwtToken),
      createdAt: new Date().toISOString(),
      name : newTodo.name,
      dueDate : newTodo.dueDate,
      done: false
    }
  
    await docClient.put({
      TableName: todosTable,
      Item: newToDoItem
    }).promise()
  
    logger.info('Created Todo Item',newToDoItem);
  
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        item : newToDoItem
      })
    }
  }
  catch(e)
  {
    logger.error('Create ToDo caused error.', {error: e});
  }
  
  return {
    statusCode: 500,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  }
}
