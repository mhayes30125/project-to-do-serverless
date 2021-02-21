import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger'
import {updateTodo} from '../../businessLogic/todo'

const cloudwatch = new AWS.CloudWatch();
const logger = createLogger('updateTodo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  let requestWasSuccessful;

  try{
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  
    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const jwtToken = split[1];
      
    const todo = await updateTodo(updatedTodo,todoId, jwtToken);
  
    logger.info('UpdatedTodo',todo);
    requestWasSuccessful = true;
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(todo)
    }
  }
  catch(e)
  {
    requestWasSuccessful = false
    logger.error('Updated Todo caused error.', {error: e});
  }
  
  // Write Matric
  await successfulInvocations(requestWasSuccessful);

  return {
    statusCode: 500,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  }
}

async function successfulInvocations(requestWasSuccessful)
{
  
  await cloudwatch.putMetricData({
    MetricData: [
      {
        MetricName: 'Success',
        Dimensions: [
          {
            Name: 'ServiceName',
            Value: 'UpdateTodo'
          }
        ],
        Unit: 'Count',
        Value: requestWasSuccessful ? 1 : 0
      }
    ],
    Namespace: 'microlearning'
  }).promise()
}
