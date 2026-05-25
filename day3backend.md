# Day 3 — Introduction to Express.js

---

## 1. A Quick Reminder — What You Built Yesterday

On Day 2 you built a server using Node's built-in `http` module. It worked — but it took a lot of code just to do simple things.

Let's look at it again:

```js
// Day 2 — raw Node.js HTTP server
const http = require('http');

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Welcome!' }));

  } else if (req.method === 'GET' && req.url === '/about') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'About page' }));

  } else if (req.method === 'GET' && req.url === '/users') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([{ name: 'Ada' }, { name: 'Grace' }]));

  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Not found' }));
  }
});

server.listen(3000, () => console.log('Server running on port 3000'));
```

Even for just 4 routes this is already getting messy. Imagine 20 routes. Imagine handling POST, PUT, DELETE too. It would become unreadable very quickly.

That's exactly the problem **Express** was built to solve.

---

## 2. What is Express?

Express is not a replacement for Node.js. It is a **library built on top of Node's `http` module** that gives you a cleaner, simpler way to build servers.

### Real Life Analogy 🏗️
Think of Node's `http` module like building a house with raw bricks, sand, and cement — you can do it but it's slow and painful.

Express is like having pre-made walls, doors, and windows ready to use. You still need Node (the foundation) underneath — Express just makes the building process much faster.

```
Node.js http module  →  the foundation (always running underneath)
Express              →  the tools that make building easier
```

### What Express Adds

| Problem with raw Node | How Express solves it |
|---|---|
| Manual `if/else` for every route | `app.get()`, `app.post()` per route |
| Manually set Content-Type header | `res.json()` handles it automatically |
| Manually call `JSON.stringify()` | `res.json()` does it for you |
| Parsing request bodies manually | `express.json()` middleware |
| No built-in way to add shared logic | Middleware system |

---

## 3. Installing Express

Make sure you are inside your project folder first:

```bash
# Step 1 — create the project folder
mkdir day9-express
cd day9-express

# Step 2 — initialise npm
npm init -y

# Step 3 — install Express
npm install express

# Step 4 — install nodemon so the server restarts on save
npm install --save-dev nodemon
```

Open `package.json` and add the dev script:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

From now on, start your server with:
```bash
npm run dev
```

---

## 4. Your First Express Server

Create a file called `server.js`:

```js
// server.js
const express = require('express');

const app = express(); // create the app

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```

Run it:
```bash
npm run dev
```

You should see:
```
Server is running on http://localhost:3000
```

That's it. Your server is running. Nothing blows up.

Now let's add routes.

---

## 5. Defining Routes — `app.get()`, `app.post()`, `app.put()`, `app.delete()`

A **route** tells the server: *"When a request comes in with this METHOD and this URL — run this function."*

```js
app.METHOD(PATH, HANDLER);
```

```
METHOD  →  the HTTP method (get, post, put, delete)
PATH    →  the URL path ('/users', '/products/:id')
HANDLER →  the function that runs when this route is matched
```

### Examples

```js
// GET /
app.get('/', (req, res) => {
  res.send('Welcome to my API!');
});

// GET /about
app.get('/about', (req, res) => {
  res.send('This is the about page');
});

// POST /users
app.post('/users', (req, res) => {
  res.send('Creating a new user...');
});

// PUT /users/1
app.put('/users/:id', (req, res) => {
  res.send(`Updating user ${req.params.id}`);
});

// DELETE /users/1
app.delete('/users/:id', (req, res) => {
  res.send(`Deleting user ${req.params.id}`);
});
```

---

## 6. `req` and `res` — Express vs Raw Node

Express gives you the same `req` (request) and `res` (response) objects as raw Node — but with **extra methods and properties** added on top.

### `req` — the Request Object

```js
req.method       // 'GET', 'POST', 'PUT', 'DELETE'
req.url          // '/users/5'
req.params       // { id: '5' }       ← URL params e.g. /users/:id
req.query        // { search: 'ada' } ← query string e.g. ?search=ada
req.body         // { name: 'Ada' }   ← request body (POST/PUT)
req.headers      // all request headers
```

### `res` — the Response Object

```js
res.send()       // send any response (text, HTML, buffer)
res.json()       // send JSON response — sets Content-Type automatically
res.status()     // set the HTTP status code
res.sendFile()   // send a file
res.redirect()   // redirect to another URL
```

### Side by Side Comparison

```js
// ❌ Raw Node — verbose, error-prone
res.writeHead(200, { 'Content-Type': 'application/json' });
res.end(JSON.stringify({ name: 'Ada' }));

// ✅ Express — clean and simple
res.json({ name: 'Ada' });
```

---

## 7. The Three Response Methods You'll Use Most

### `res.send()` — Send Anything

```js
res.send('Hello World');           // sends plain text
res.send('<h1>Hello</h1>');        // sends HTML
res.send({ name: 'Ada' });         // sends JSON (but use res.json() instead)
```

### `res.json()` — Send JSON

This is what you'll use 90% of the time for APIs. It:
- Automatically converts the object to a JSON string
- Automatically sets the `Content-Type: application/json` header

```js
// Single object
res.json({ name: 'Ada', role: 'Engineer' });

// Array
res.json([{ id: 1 }, { id: 2 }]);

// With a success flag (good practice)
res.json({ success: true, data: { name: 'Ada' } });
```

### `res.status().json()` — Set Status Code + Send JSON

By default, responses send status 200 (OK). But sometimes you need a different code:

```js
// 201 — Created (after successfully creating something)
res.status(201).json({ success: true, message: 'User created' });

// 400 — Bad Request (client sent wrong data)
res.status(400).json({ success: false, message: 'Email is required' });

// 404 — Not Found
res.status(404).json({ success: false, message: 'User not found' });

// 500 — Server Error
res.status(500).json({ success: false, message: 'Something went wrong' });
```

### Status Codes Quick Reference

| Code | Meaning | When to use |
|---|---|---|
| 200 | OK | Successful GET or UPDATE |
| 201 | Created | Successful POST (new resource created) |
| 204 | No Content | Successful DELETE (nothing to return) |
| 400 | Bad Request | Client sent invalid data |
| 401 | Unauthorized | Not logged in |
| 403 | Forbidden | Logged in but not allowed |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Something broke on the server |

---

## 8. `app.listen()` — Starting the Server

```js
app.listen(PORT, callback);
```

```js
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

### Using a PORT from Environment Variables

Hardcoding `3000` is fine locally, but in production the port is assigned by the hosting service. Use `process.env.PORT` with a fallback:

```js
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

---

## 9. Practice — Rebuild the Raw HTTP Server in Express

### Goal
Take the Day 8 raw Node server and rebuild it using Express. Then look at them side by side and appreciate how much cleaner it is.

### The Raw Node Version (Day 8)
```js
// raw-server.js — what you built yesterday
const http = require('http');

const users = [
  { id: 1, name: 'Ada Lovelace' },
  { id: 2, name: 'Alan Turing' },
  { id: 3, name: 'Grace Hopper' },
];

const server = http.createServer((req, res) => {

  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Welcome to the API!' }));

  } else if (req.method === 'GET' && req.url === '/about') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'This is a simple Node.js API' }));

  } else if (req.method === 'GET' && req.url === '/users') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(users));

  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Route not found' }));
  }
});

server.listen(3000, () => console.log('Server on port 3000'));
```

---

### The Express Version (What You Build Today)

```js
// server.js — same server, rebuilt with Express
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

const users = [
  { id: 1, name: 'Ada Lovelace' },
  { id: 2, name: 'Alan Turing' },
  { id: 3, name: 'Grace Hopper' },
];

// GET /
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API!' });
});

// GET /about
app.get('/about', (req, res) => {
  res.json({ message: 'This is a simple Express API' });
});

// GET /users — return all users
app.get('/users', (req, res) => {
  res.json(users);
});

// GET /users/:id — return one user
app.get('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user);
});

// POST /users — add a new user
app.use(express.json()); // allow Express to read the request body

app.post('/users', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  const newUser = { id: users.length + 1, name };
  users.push(newUser);

  res.status(201).json({ message: 'User created', user: newUser });
});

// 404 — catch all unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

---

### Side by Side Comparison

| | Raw Node | Express |
|---|---|---|
| Lines of code (4 routes) | ~30 lines | ~20 lines |
| Routing | Manual `if/else` | `app.get()` per route |
| Setting Content-Type | `res.writeHead(200, {...})` | Automatic with `res.json()` |
| Converting to JSON | `JSON.stringify(data)` | `res.json(data)` |
| Ending the response | `res.end(...)` | Automatic |
| Adding a new route | Another `if/else` block | One new `app.get()` line |
| Reading URL params | Parse manually | `req.params.id` |

---

### Test in Postman or Browser

| Request | Expected Response |
|---|---|
| `GET /` | `{ "message": "Welcome to the API!" }` |
| `GET /about` | `{ "message": "This is a simple Express API" }` |
| `GET /users` | Array of 3 users |
| `GET /users/1` | `{ "id": 1, "name": "Ada Lovelace" }` |
| `GET /users/99` | 404 — `{ "message": "User not found" }` |
| `POST /users` with `{ "name": "Grace" }` | 201 — new user object |
| `POST /users` with no body | 400 — `{ "message": "Name is required" }` |
| `GET /anything-else` | 404 — `{ "message": "Route not found" }` |

---

## ✅ Day 9 Checklist
- [ ] Can explain what Express is and how it sits on top of Node's `http` module
- [ ] Know how to install Express and set up a project with nodemon
- [ ] Can define routes with `app.get()`, `app.post()`, `app.put()`, `app.delete()`
- [ ] Understand the difference between `req` and `res` in Express vs raw Node
- [ ] Know when to use `res.send()`, `res.json()`, and `res.status().json()`
- [ ] Know common HTTP status codes and when to use each
- [ ] Built the Express server and tested all routes in Postman

## 💡 Homework
1. Add a `PUT /users/:id` route that finds a user by id and updates their name from `req.body`. Return 404 if the user doesn't exist.
2. Add a `DELETE /users/:id` route that removes a user from the array. Return 404 if not found, 204 if deleted successfully.
3. **Bonus:** Add a `GET /users` route that accepts a query parameter — `GET /users?name=ada` — and filters the results to only return users whose name contains that search term (case insensitive). Hint: use `req.query.name` and `.filter()`.
