import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as AWSXRay  from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS);

export class DataAccessManager{

    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly userIdIndex = process.env.USER_ID_INDEX,
        private readonly logger = createLogger('dataAccessManager')){
    }

    async createTodo(todoItem:TodoItem): Promise<TodoItem>{
    
        await this.docClient.put({
          TableName: this.todosTable,
          Item: todoItem
        }).promise()
      
        this.logger.info('Created Todo Item',todoItem);

        return todoItem;
    }

    async deleteTodo(userId:string,todoId:string){
      
      await this.docClient.delete({
        TableName:this.todosTable,
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

      this.logger.info(`Delete Todo Item ${userId} ${todoId}`);
    }

    async updateTodo(updatedTodo:TodoItem): Promise<TodoItem>{

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
  
      const result = await this.docClient.update({
        TableName: this.todosTable,
        Key:{
          "userId" : updatedTodo.userId,
          "todoId" : updatedTodo.todoId,
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues:expressionAttributeValues,
        ExpressionAttributeNames:
        {
            "#name":"name"
        },
        ReturnValues:"UPDATED_NEW"
      }).promise();

      this.logger.info('Update Todo Item',result);

      return updatedTodo;
    }

    async getTodo(userId:string,todoId:string):Promise<TodoItem>{
      
      const result = await this.docClient.query({
        TableName : this.todosTable,
        KeyConditionExpression: 'userId = :userId and todoId = :todoId',
        ExpressionAttributeValues: {
            ':userId': userId,
            ':todoId' : todoId
        }
        }).promise()
    
      const item = result.Items[0] as TodoItem;

      this.logger.info('Get Todo Item',item);

      return item;
    }

    async getTodos(userId:string):Promise<TodoItem[]>{

      const result = await this.docClient.query({
        TableName : this.todosTable,
        IndexName : this.userIdIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
      }).promise();
    
      const items = result.Items as TodoItem[];
      
      this.logger.info('Get Todo Items');

      return items;
    }
}


