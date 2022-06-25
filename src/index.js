const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (!user) return response.status(400).json({ error: "User not found" });

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.find((user) => user.username === username);
  if (userAlreadyExists)
    return response.status(400).send({ error: "Username already in use" });

  const user = {
    name,
    username,
    id: uuidv4(),
    todos: [],
  };

  users.push(user);

  return response.status(201).send(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).send(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).send(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { id } = request.params;

  const { user } = request;

  const todoToUpdateIndex = user.todos.findIndex((todo) => todo.id == id);

  if (todoToUpdateIndex === -1)
    return response.status(404).send({ error: "Todo not exists" });
  const todoToUpdate = user.todos[todoToUpdateIndex];

  const updatedTodo = {
    ...todoToUpdate,
    title,
    deadline: new Date(deadline),
  };

  user.todos[todoToUpdateIndex] = updatedTodo;

  return response.status(200).send(updatedTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const { user } = request;

  const todoToUpdateIndex = user.todos.findIndex((todo) => todo.id == id);

  if (todoToUpdateIndex === -1)
    return response.status(404).send({ error: "Todo not exists" });
  const todoToUpdate = user.todos[todoToUpdateIndex];

  const updatedTodo = {
    ...todoToUpdate,
    done: true,
  };

  user.todos[todoToUpdateIndex] = updatedTodo;

  return response.status(200).send(updatedTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;

  const todoToDelete = user.todos.find((todo) => todo.id === id);
  if (!todoToDelete)
    return response.status(404).send({ error: "Todo not exists" });

  user.todos.splice(todoToDelete, 1);

  return response.status(204).send();
});

module.exports = app;
