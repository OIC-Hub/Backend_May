# Day 4 — Request Data: Params, Query & Body

---

## 1. The Three Ways to Send Data to a Server

When a client (browser or Postman) sends a request to your server, it can include data in three different places:

```
1. URL Params   →  /users/5             → req.params
2. Query String →  /users?name=ada      → req.query
3. Request Body →  { "name": "Ada" }    → req.body
```

### Real Life Analogy 🏪
Think of a request to your server like ordering at a restaurant:

> **URL Params** — you point at the menu and say "I want item number 5" — the ID is in the URL itself
>
> **Query String** — you say "show me all jollof rice, sorted by price" — extra filters attached to your order
>
> **Request Body** — you fill out a form with your full details before submitting — a package of data you send along

---

## 2. URL Params — `req.params`

URL params let you make **dynamic routes** — one route that works for many different values.

You define a param by adding `:` in front of the name:

```js
app.get('/users/:id', (req, res) => {
  console.log(req.params); // { id: '5' }
  console.log(req.params.id); // '5'
});
```

### ⚠️ URL params are always strings

Even if the user visits `/users/5`, `req.params.id` will be the string `'5'`, not the number `5`. Convert it when needed:

```js
const id = Number(req.params.id); // or parseInt(req.params.id)
```

### Multiple Params

You can have more than one param in a URL:

```js
app.get('/users/:userId/posts/:postId', (req, res) => {
  console.log(req.params);
  // { userId: '3', postId: '12' }
});
```

### Full Example

```js
const users = [
  { id: 1, name: 'Ada Lovelace',  role: 'Engineer' },
  { id: 2, name: 'Alan Turing',   role: 'Mathematician' },
  { id: 3, name: 'Grace Hopper',  role: 'Admiral' },
];

// GET /users/2 → returns Alan Turing
app.get('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user);
});
```

---

## 3. Query Strings — `req.query`

Query strings are key-value pairs added to the end of a URL after a `?`. They are used for **optional filters, search terms, sorting, and pagination**.

```
/users?name=ada
       ↑
       ? marks the start of the query string

/users?name=ada&city=lagos&sort=asc
              ↑
              & separates multiple key-value pairs
```

Express automatically parses query strings into `req.query`:

```js
// Request: GET /users?name=ada&city=lagos
app.get('/users', (req, res) => {
  console.log(req.query);
  // { name: 'ada', city: 'lagos' }

  console.log(req.query.name); // 'ada'
  console.log(req.query.city); // 'lagos'
});
```

### ⚠️ Query string values are always strings too

```js
// Request: GET /products?limit=10&page=2
req.query.limit // '10' — string, not number
req.query.page  // '2'  — string, not number

// Convert them
const limit = Number(req.query.limit) || 10;
const page  = Number(req.query.page)  || 1;
```

### Practical Example — Search and Filter

```js
const events = [
  { id: 1, name: 'Afrobeats Night', category: 'Music',  city: 'Lagos' },
  { id: 2, name: 'Tech Summit',     category: 'Tech',   city: 'Lagos' },
  { id: 3, name: 'Food Festival',   category: 'Food',   city: 'Abuja' },
];

// GET /events?category=Tech
// GET /events?city=Lagos
// GET /events?category=Music&city=Lagos
app.get('/events', (req, res) => {
  let results = events;

  // Filter by category if provided
  if (req.query.category) {
    results = results.filter(e => e.category === req.query.category);
  }

  // Filter by city if provided
  if (req.query.city) {
    results = results.filter(e => e.city === req.query.city);
  }

  res.json({
    count: results.length,
    data: results,
  });
});
```

Test these in Postman or the browser:
- `GET /events` → all 3
- `GET /events?category=Tech` → only Tech Summit
- `GET /events?city=Lagos` → Afrobeats + Tech Summit
- `GET /events?category=Music&city=Lagos` → only Afrobeats Night

---

## 4. Request Body — `req.body`

The request body is used to send **larger amounts of data** from the client to the server. Mainly used with `POST`, `PUT`, and `PATCH` requests.

```json
// The JSON body sent by the client
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "role": "Engineer"
}
```

### The Problem — Body Doesn't Work Out of the Box

By default, Express does not know how to read JSON from the request body. You have to tell it to by adding `express.json()` middleware.

```js
// ❌ Without express.json() — body is undefined
app.post('/users', (req, res) => {
  console.log(req.body); // undefined 😬
});

// ✅ With express.json() — body is parsed correctly
app.use(express.json()); // add this line near the top, before your routes

app.post('/users', (req, res) => {
  console.log(req.body); // { name: 'Ada', email: 'ada@example.com' }
});
```

### Where to Put `express.json()`

Always put it near the top of your file, **before** any routes. It needs to run before the routes try to read `req.body`:

```js
const express = require('express');
const app = express();

app.use(express.json()); // ← here, before routes

app.get('/', ...);
app.post('/users', ...);
```

### Full POST Example

```js
const users = [
  { id: 1, name: 'Ada Lovelace' },
  { id: 2, name: 'Alan Turing' },
];

app.use(express.json());

app.post('/users', (req, res) => {
  const { name, email } = req.body;

  // Basic validation
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // Create new user
  const newUser = {
    id: users.length + 1,
    name,
    email,
  };

  users.push(newUser);

  res.status(201).json({
    message: 'User created successfully',
    user: newUser,
  });
});
```

---

## 5. Params vs Query vs Body — When to Use Which

| | URL Params | Query String | Request Body |
|---|---|---|---|
| Example | `/users/5` | `/users?name=ada` | `{ "name": "Ada" }` |
| Used with | Any method | GET mainly | POST, PUT, PATCH |
| Good for | Identifying a resource | Filtering, sorting, searching | Creating or updating data |
| Accessed via | `req.params` | `req.query` | `req.body` |
| Visible in URL? | ✅ Yes | ✅ Yes | ❌ No |

---

## 6. Testing with Postman

### Setting Up a GET Request with Params

```
Method:  GET
URL:     http://localhost:3000/users/2
```

Click **Send**. You should get Alan Turing back.

### Setting Up a GET Request with Query String

```
Method:  GET
URL:     http://localhost:3000/events
```

In Postman, go to the **Params** tab and add:
| Key | Value |
|---|---|
| category | Tech |

Postman automatically builds the URL: `http://localhost:3000/events?category=Tech`

### Setting Up a POST Request with Body

```
Method:  POST
URL:     http://localhost:3000/users
```

Click the **Body** tab → select **raw** → select **JSON** from the dropdown → type:

```json
{
  "name": "Grace Hopper",
  "email": "grace@example.com"
}
```

Click **Send**. You should get a 201 response with the new user.

---

## 7. Practice — `/users/:id` + `POST /users`

Build this complete `server.js` from scratch:

```js
// server.js
const express = require('express');
const app = express();

app.use(express.json()); // must be before routes

const users = [
  { id: 1, name: 'Ada Lovelace',  email: 'ada@mail.com'  },
  { id: 2, name: 'Alan Turing',   email: 'alan@mail.com' },
  { id: 3, name: 'Grace Hopper',  email: 'grace@mail.com'},
];

// GET /users — with optional ?name= search
app.get('/users', (req, res) => {
  let results = users;

  if (req.query.name) {
    results = results.filter(u =>
      u.name.toLowerCase().includes(req.query.name.toLowerCase())
    );
  }

  res.json({ count: results.length, data: results });
});

// GET /users/:id — get one user
app.get('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ message: `User with id ${id} not found` });
  }

  res.json(user);
});

// POST /users — create a new user
app.post('/users', (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are both required' });
  }

  const newUser = { id: users.length + 1, name, email };
  users.push(newUser);

  res.status(201).json({ message: 'User created', user: newUser });
});

// 404 catch-all
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
```




