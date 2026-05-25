
# Day 5 — Middleware

---

## 1. What is Middleware?

Middleware is a **function that runs between the request arriving and the response being sent**.

Every time a request hits your server, it travels through a series of functions before it gets to the route handler. Those functions are middleware.

### Real Life Analogy 🏨
Think of a hotel. When a guest arrives, before they get to their room they go through:

1. Security check at the door ← security middleware
2. Receptionist checks their booking ← auth middleware
3. Bellboy logs their arrival ← logger middleware
4. **Guest reaches their room** ← route handler

Each step can:
- **Let them through** (call `next()`)
- **Stop them** (send a response and end the chain)
- **Add information** (attach data to the request)

```
Request → middleware 1 → middleware 2 → middleware 3 → Route Handler → Response
```

---

## 2. The Middleware Signature

Every middleware function receives **three arguments**:

```js
function myMiddleware(req, res, next) {
  // req  — the request object (you can read and modify it)
  // res  — the response object (you can end the request here)
  // next — a function that passes control to the next middleware
}
```

### The Three Things Middleware Can Do

```js
// 1. Run some code and pass control forward
function logger(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next(); // ← pass to next middleware or route
}

// 2. Modify req or res and pass forward
function addTimestamp(req, res, next) {
  req.requestTime = new Date().toISOString(); // attach data to req
  next();
}

// 3. Stop the request and send a response (no next() called)
function blockGuests(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' }); // stops here
  }
  next(); // only reaches here if token exists
}
```

### ⚠️ The Most Common Mistake

Forgetting to call `next()` when you should — the request just hangs forever:

```js
// ❌ Request will hang — never gets to the route
function badMiddleware(req, res, next) {
  console.log('Hello!');
  // forgot next()!
}

// ✅ Correct
function goodMiddleware(req, res, next) {
  console.log('Hello!');
  next(); // ← always call this unless you're ending the response
}
```

---

## 3. `app.use()` — Applying Middleware

### Global Middleware — runs for every request

```js
app.use(myMiddleware);
```

### Path Middleware — runs only for a specific path prefix

```js
app.use('/api', myMiddleware); // only runs for /api, /api/users, /api/events etc.
```

### Route-Level Middleware — runs only for one route

```js
app.get('/dashboard', checkAuth, (req, res) => {
  res.json({ message: 'Welcome to dashboard' });
});
//         ↑ middleware runs before the route handler
```

### Multiple Middleware on One Route

```js
app.post('/events', checkAuth, checkRole, validateInput, (req, res) => {
  // only reaches here if all three middleware pass
  res.status(201).json({ message: 'Event created' });
});
```

---

## 4. Order Matters

Middleware runs **top to bottom** in the order you define it. This is very important.

```js
// ✅ Correct order — express.json() runs before routes read req.body
app.use(express.json());
app.use(logger);

app.post('/users', (req, res) => {
  console.log(req.body); // works ✅
});

// ❌ Wrong order — express.json() runs AFTER the route
app.post('/users', (req, res) => {
  console.log(req.body); // undefined ❌
});

app.use(express.json()); // too late!
```

---

## 5. Built-in Express Middleware

Express comes with two built-in middleware functions you'll use in every project:

### `express.json()` — Parse JSON bodies

```js
app.use(express.json());
// Now req.body works for JSON requests
```

### `express.static()` — Serve Static Files

Serves files from a folder (HTML, CSS, images) directly:

```js
app.use(express.static('public'));
// Files in the /public folder are now accessible at their path
// e.g. /public/index.html → http://localhost:3000/index.html
```

---

## 6. Third-Party Middleware

### `morgan` — HTTP Request Logger

Morgan logs every incoming request to the console automatically.

```bash
npm install morgan
```

```js
const morgan = require('morgan');

app.use(morgan('dev'));
// Logs: GET /users 200 5.234 ms - 156
```

Morgan has different log formats:

```js
app.use(morgan('dev'));     // coloured, short — best for development
app.use(morgan('tiny'));    // minimal
app.use(morgan('combined'));// detailed — best for production
```

### `cors` — Allow Frontend to Talk to Your API

By default, browsers **block** requests from a different domain. This is called CORS (Cross-Origin Resource Sharing). Without fixing it, your React frontend cannot call your Node backend.

```bash
npm install cors
```

```js
const cors = require('cors');

// Allow ALL origins — fine for development
app.use(cors());

// Allow ONLY your frontend — better for production
app.use(cors({
  origin: 'http://localhost:5173', // your React Vite app URL
}));
```

---

## 7. Writing Your Own Middleware — Step by Step

### Middleware 1 — Request Logger

```js
function logger(req, res, next) {
  const time = new Date().toLocaleTimeString();
  console.log(`[${time}] ${req.method} ${req.url}`);
  next();
}

app.use(logger);

// Every request now prints:
// [10:32:15 AM] GET /users
// [10:32:20 AM] POST /users
```

### Middleware 2 — Attach Request Timestamp

```js
function addRequestTime(req, res, next) {
  req.requestTime = new Date().toISOString();
  next();
}

app.use(addRequestTime);

app.get('/users', (req, res) => {
  res.json({
    requestedAt: req.requestTime, // ← available because middleware set it
    data: users,
  });
});
```

### Middleware 3 — Simple API Key Check

```js
function checkApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== '12345-secret') {
    return res.status(401).json({ message: 'Invalid or missing API key' });
  }

  next(); // only proceeds if key is correct
}

// Apply only to specific routes
app.get('/admin', checkApiKey, (req, res) => {
  res.json({ message: 'Welcome, admin!' });
});
```

---

## 8. Error Handling Middleware

A special middleware that handles errors. It has **four arguments** — `err` is the first one:

```js
function errorHandler(err, req, res, next) {
  console.error(err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong on the server',
  });
}
```

### Important — Error middleware must be LAST

```js
app.use(express.json());
app.use(logger);

app.get('/users', ...);
app.post('/users', ...);

app.use(errorHandler); // ← always at the very bottom
```

### Sending Errors to the Error Handler

Use `next(err)` to pass an error from a route to the error handler:

```js
app.get('/users/:id', (req, res, next) => {
  const user = users.find(u => u.id === Number(req.params.id));

  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    return next(error); // ← sends to error handler middleware
  }

  res.json(user);
});
```

---

## 9. The Full Middleware Picture

```
Incoming Request
      ↓
  express.json()     ← parse JSON body
      ↓
  morgan()           ← log the request
      ↓
  cors()             ← allow frontend requests
      ↓
  logger (custom)    ← your own logging
      ↓
  Route Handlers     ← app.get(), app.post() etc.
      ↓
  errorHandler       ← catch any errors
      ↓
Outgoing Response
```

---

## 10. Practice — Full Server with Middleware

Build this complete server that combines everything from Day 10 and Day 11:

```js
// server.js
const express = require('express');
const morgan  = require('morgan');
const cors    = require('cors');

const app = express();

// ─── Middleware ────────────────────────────────
app.use(express.json());          // parse JSON bodies
app.use(morgan('dev'));            // log all requests
app.use(cors());                  // allow all origins

// Custom middleware — add request time to every req object
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Custom middleware — logger with method, URL, and time
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url} — ${req.requestTime}`);
  next();
});

// ─── Data ─────────────────────────────────────
const users = [
  { id: 1, name: 'Ada Lovelace',  email: 'ada@mail.com'   },
  { id: 2, name: 'Alan Turing',   email: 'alan@mail.com'  },
  { id: 3, name: 'Grace Hopper',  email: 'grace@mail.com' },
];

// ─── Routes ───────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'API is running', time: req.requestTime });
});

app.get('/users', (req, res) => {
  let results = users;

  if (req.query.name) {
    results = results.filter(u =>
      u.name.toLowerCase().includes(req.query.name.toLowerCase())
    );
  }

  res.json({ count: results.length, data: results });
});

app.get('/users/:id', (req, res, next) => {
  const id   = Number(req.params.id);
  const user = users.find(u => u.id === id);

  if (!user) {
    const err = new Error(`User with id ${id} not found`);
    err.status = 404;
    return next(err); // ← send to error handler
  }

  res.json(user);
});

app.post('/users', (req, res, next) => {
  const { name, email } = req.body;

  if (!name || !email) {
    const err = new Error('Name and email are required');
    err.status = 400;
    return next(err);
  }

  const newUser = { id: users.length + 1, name, email };
  users.push(newUser);

  res.status(201).json({ message: 'User created', user: newUser });
});

// ─── 404 Handler ──────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

// ─── Error Handler (always last) ──────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ─── Start Server ─────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
```

### Test Checklist in Postman

- [ ] `GET /` → shows message and request timestamp
- [ ] `GET /users` → all 3 users
- [ ] `GET /users?name=grace` → only Grace Hopper
- [ ] `GET /users/1` → Ada Lovelace
- [ ] `GET /users/99` → error handler returns 404 with message
- [ ] `POST /users` with valid body → 201 created
- [ ] `POST /users` with missing fields → error handler returns 400
- [ ] `GET /anything-random` → 404 route not found
- [ ] Check your terminal — morgan and custom logger both printing ✅

---

## ✅ Day 10 & 11 Checklist
- [ ] Can read URL params with `req.params`
- [ ] Can read query strings with `req.query` for filtering
- [ ] Can read request body with `req.body` after `express.json()`
- [ ] Know when to use params, query, and body
- [ ] Can explain what middleware is in simple words
- [ ] Can write custom middleware with `(req, res, next)`
- [ ] Know what happens if you forget `next()`
- [ ] Know middleware order matters — top to bottom
- [ ] Set up `morgan` and `cors`
- [ ] Built and tested the full server with all middleware in Postman

## 💡 Homework
1. Add a `PUT /users/:id` route that updates a user's name and email from `req.body`. Return 404 using `next(err)` if the user doesn't exist.
2. Add a `DELETE /users/:id` route. On success, return `204 No Content`. On not found, use `next(err)` to send a 404.
3. Write a middleware called `validateUserBody` that checks if `name` and `email` exist in `req.body` before the POST and PUT routes run — so the routes themselves don't need to check anymore.
4. **Bonus:** Add a request counter middleware that counts how many total requests the server has received since it started. Add a `GET /stats` route that returns `{ totalRequests: 42 }`.
