import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createLogger } from '../../utils/logger'
import {createTodo} from '../../businessLogic/todo'

const logger = createLogger('createTodo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  try{
    const newTodo: CreateTodoRequest = JSON.parse(event.body)

    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const jwtToken = split[1];
  
    const newToDoItem = await createTodo(newTodo.name,newTodo.dueDate,jwtToken);

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
