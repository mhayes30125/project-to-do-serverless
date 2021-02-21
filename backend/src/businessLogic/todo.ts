
import { DataAccessManager } from '../dataLayer/dataAccessManager'
import 'source-map-support/register'
import * as uuid from 'uuid'
import { getUserId } from '../utils/auth'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import {UpdateTodoRequest} from '../requests/UpdateTodoRequest'
const dataAccessManager = new DataAccessManager();
const logger = createLogger('business-todo')

export async function createTodo(name:string, dueDate: string, jwtToken: string): Promise<TodoItem> {

    const userId = getUserId(jwtToken);

    logger.info(`Create Todo for: ${userId} ${name} ${dueDate}`);
    
    return await dataAccessManager.createTodo({
        todoId : uuid.v4(),
        userId : userId,
        createdAt: new Date().toISOString(),
        name : name,
        dueDate : dueDate,
        done: false
    });
  }

export async function deleteTodo(jwtToken:string,todoId:string) {
    
    const userId = getUserId(jwtToken);

    logger.info(`Delete Todo for: ${userId} ${todoId}`);

    return await dataAccessManager.deleteTodo(userId,todoId);
}

export async function getTodo(todoId:string, jwtToken: string): Promise<TodoItem> {

    const userId = getUserId(jwtToken);
    logger.info(`Get Todo for: ${userId} ${todoId}`);
    
    return await dataAccessManager.getTodo(userId,todoId);
  }

export async function getTodos(jwtToken: string): Promise<TodoItem[]> {

    const userId = getUserId(jwtToken);

    logger.info(`Get Todos for: ${userId}`);
    
    return await dataAccessManager.getTodos(userId);
  }

export async function updateTodo(todoItemRequest: UpdateTodoRequest,todoId: string, jwtToken: string): Promise<TodoItem> {
    
    logger.info(`Update Todos for: ${todoId}`);
    // 1. Get the current todo
    const currentTodo = await getTodo(todoId,jwtToken);

    // 2. Update current Todo
    currentTodo.name = todoItemRequest.name;
    currentTodo.dueDate = todoItemRequest.dueDate;
    currentTodo.done = todoItemRequest.done;
    currentTodo.attachmentUrl = todoItemRequest.attachmentUrl;
    
    // 3. Call the data access layer
    const result = dataAccessManager.updateTodo(currentTodo);

    return result;
}