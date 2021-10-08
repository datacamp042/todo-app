import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'

//const XAWS = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger('todoAccess')

export class TodosAcces {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE) {
  }

  async getTodoItems(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient.query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      }).promise()

      const items = result.Items
     return items as TodoItem[]
  }

  async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todoItem
    }).promise()

    return todoItem
  }

  async updateTodoItem(todoId: string, userId: string, updatedTodo: TodoUpdate): Promise<TodoUpdate> {
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        "todoId": todoId,
        "userId": userId
      },
      UpdateExpression: "set #n=:n, dueDate=:dd, done=:d",
      ExpressionAttributeValues: {
        ":n": updatedTodo.name,
        ":dd": updatedTodo.dueDate,
        ":d": updatedTodo.done
      },
      ExpressionAttributeNames: {
        "#n": "name"
      }
    }).promise()

    return updatedTodo
  }

  async deleteTodoItem(todoId: string, userId: string) {
    await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        "todoId": todoId,
        "userId": userId
      }
    }).promise()
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {

    logger.info('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
