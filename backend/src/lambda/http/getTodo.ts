import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import { createLogger } from '../../utils/logger'
import { getTodo} from '../../businessLogic/todo'

const logger = createLogger('getTodo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  try{
    const todoId = event.pathParameters.todoId

    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const jwtToken = split[1];
  
    logger.info(`Get Todo Item ${todoId}`);

    const item = await getTodo(todoId,jwtToken );
  
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
