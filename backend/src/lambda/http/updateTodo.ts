import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../auth/utilities'
import * as AWS  from 'aws-sdk'
import { createLogger } from '../../utils/logger'

const logger = createLogger('upadateTodo')
const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try{
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  
    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const jwtToken = split[1];
  
    const userId = getUserId(jwtToken);

    let expressionAttributeValues = {
      ":name":updatedTodo.name,
      ":dueDate":updatedTodo.dueDate,
      ":done":updatedTodo.done
    }

    let updateExpression = "set #name=:name, dueDate=:dueDate, done=:done"

    if(updatedTodo.attachmentUrl || updatedTodo.attachmentUrl === "")
    {
      expressionAttributeValues[":attachmentUrl"] = updatedTodo.attachmentUrl;
      updateExpression = `${updateExpression},attachmentUrl=:attachmentUrl`
    }

    const result = await docClient.update({
      TableName:todosTable,
      Key:{
        "userId" : userId,
        "todoId" : todoId,
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues:expressionAttributeValues,
      ExpressionAttributeNames:
      {
          "#name":"name"
      },
      ReturnValues:"UPDATED_NEW"
    }).promise();
  
    logger.info('UpdatedTodo',result);
  
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result)
    }
  }
  catch(e)
  {
    logger.error('Updated Todo caused error.', {error: e});
  }
  
  return {
    statusCode: 500,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  }
}
