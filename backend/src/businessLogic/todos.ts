import { TodoItem } from "../models/TodoItem"
import { CreateTodoRequest } from "../requests/CreateTodoRequest"
import * as uuid from 'uuid'
import { parseUserId } from "../auth/utils"
import { TodosAcces } from "../dataLayer/todosAccess"
import { TodoUpdate } from "../models/TodoUpdate"
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest"
import { getSignedUploadUrl } from "../dataLayer/fileStorage"

const bucketName = process.env.TODOS_ATTACHEMENT_S3_BUCKET;
const todoAccess = new TodosAcces()

export async function getTodosPerUser(jwtToken: string) : Promise<TodoItem[]> {
  const userId = parseUserId(jwtToken)
  return todoAccess.getTodoItems(userId)
}

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    jwtToken: string
  ): Promise<TodoItem> {
  
    const itemId = uuid.v4()
    const userId = parseUserId(jwtToken)
  
    return await todoAccess.createTodoItem({
      todoId: itemId,
      userId: userId,
      createdAt: new Date().toISOString(),
      name: createTodoRequest.name,
      dueDate: createTodoRequest.dueDate,
      done: false,
      attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${itemId}`
    })
}

export async function updateTodo(
  todoId: string,
  updatedTodo: UpdateTodoRequest,
  jwtToken: string
): Promise<TodoUpdate> {
  const userId = parseUserId(jwtToken)
  
  return await todoAccess.updateTodoItem(todoId, userId, updatedTodo)
}

export async function deleteTodo(todoId: string, jwtToken: string) {
  const userId = parseUserId(jwtToken)

  return await todoAccess.deleteTodoItem(todoId, userId)
}

export function generateUploadUrl(todoId: string) : string {
  return getSignedUploadUrl(todoId)
}