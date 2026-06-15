# Day 6 — User Registration & Password Hashing
 
---

## 1. Why We Never Store Plain Passwords

Let's say a user signs up with the password `mypassword123`. If you save that directly to MongoDB, your database looks like this:

```json
{
  "name": "Ada Lovelace",
  "email": "ada@mail.com",
  "password": "mypassword123"
}
```

Now imagine a hacker breaks into your database. They can see every user's password **in plain text** — and because most people reuse passwords, the hacker now has access to their email, bank, social media, everything.

**This has happened to real companies.** LinkedIn leaked 6.5 million passwords in 2012. Adobe leaked 150 million in 2013. People lost access to accounts they never even knew were connected.

### The Solution — Hashing

Instead of saving the real password, we run it through a **hashing function** that converts it to a random-looking string. This process cannot be reversed.

```
"mypassword123"  →  "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
```

Now even if a hacker steals the database, they only see a meaningless string — not the real password.

### Hash vs Encryption — What's the Difference?

Students often confuse these two:

| | Hashing | Encryption |
|---|---|---|
| Can it be reversed? | ❌ No | ✅ Yes (with a key) |
| Good for passwords? | ✅ Yes | ❌ No |
| Example | bcrypt, SHA-256 | AES, RSA |

Encryption can be decrypted. Hashing cannot. That's why we **always hash passwords**, never encrypt them.

### How Does Login Work Then?

When a user logs in, we don't "un-hash" the password. Instead we:

1. Take the password they typed
2. Hash it the same way
3. Compare the two hashes — if they match, the password is correct

```
Signup:  "mypassword123"  →  hash  →  save hash to DB
Login:   "mypassword123"  →  hash  →  compare with stored hash ✅
```

---

## 2. What is bcrypt?

`bcrypt` is a popular password hashing library. It was designed specifically for hashing passwords — unlike general-purpose hashes like SHA-256, bcrypt is intentionally **slow**. That's a feature, not a bug. Slow hashing makes brute-force attacks much harder.

### Salt Rounds — What It Means

bcrypt adds a **salt** — a random piece of data — to each password before hashing. This means even if two users have the same password, their hashes will be different.

```
User A: "password123" + random salt → "$2b$10$abc..."
User B: "password123" + different salt → "$2b$10$xyz..."
```

The **salt rounds** number (also called cost factor) controls how slow the hashing is. The higher the number, the slower — and safer — the hash:

```
10 salt rounds → takes ~100ms   ← good default for most apps
12 salt rounds → takes ~400ms   ← good for high security
14 salt rounds → takes ~1.5s    ← very slow, overkill for most apps
```

**Use 10 for this course.** It's the industry standard default.

---

## 3. Installing bcryptjs

```bash
npm install bcryptjs
```

> There are two packages — `bcrypt` (written in C++) and `bcryptjs` (pure JavaScript). We use `bcryptjs` because it works on all platforms without any native dependencies. They have the same API.

```js
const bcrypt = require('bcryptjs');
```

---

## 4. Hashing a Password — `bcrypt.hash()`

```js
const bcrypt = require('bcryptjs');

const plainPassword = 'mypassword123';
const saltRounds = 10;

// bcrypt.hash() returns a promise — always use async/await
const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

console.log(hashedPassword);
// "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
```

Every time you hash the same password, you get a **different hash** — because bcrypt adds a different salt each time. That's normal and correct.

```js
await bcrypt.hash('mypassword123', 10); // "$2b$10$abc..."
await bcrypt.hash('mypassword123', 10); // "$2b$10$xyz..." ← different!
```

---

## 5. Comparing Passwords — `bcrypt.compare()`

When a user logs in, use `bcrypt.compare()` to check if the password they typed matches the stored hash:

```js
const bcrypt = require('bcryptjs');

const plainPassword  = 'mypassword123';  // what the user typed
const storedHash     = '$2b$10$N9qo...'; // what's in the database

const isMatch = await bcrypt.compare(plainPassword, storedHash);

console.log(isMatch); // true ✅ — password is correct

// Wrong password
const isMatch2 = await bcrypt.compare('wrongpassword', storedHash);
console.log(isMatch2); // false ❌
```

`bcrypt.compare()` returns `true` or `false`. That's all you need to know.

---

## 6. Project Setup

Before building the register route, let's make sure the project structure is in place.

### File Structure for Today

```
auth-api/
├── config/
│   └── db.js              ← MongoDB connection
├── controllers/
│   └── authController.js  ← register logic lives here
├── models/
│   └── User.js            ← User schema
├── routes/
│   └── authRoutes.js      ← /api/auth routes
├── middleware/
│   └── errorMiddleware.js ← error handler
├── .env
├── .gitignore
├── package.json
└── server.js
```

### `.env` file

```
PORT=3000
MONGO_URI=mongodb+srv://youruser:yourpassword@cluster.mongodb.net/authdb
```

### `.gitignore`

```
node_modules
.env
```

---

## 7. The User Model

```js
// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,       // no two users can have the same email
      lowercase: true,    // always save as lowercase
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'organizer'],
      default: 'user',
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

module.exports = mongoose.model('User', userSchema);
```

---

## 8. The Database Connection

```js
// config/db.js
const mongoose = require('mongoose');

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1); // stop the server if DB fails to connect
  }
}

module.exports = connectDB;
```

---

## 9. Building `POST /auth/register`

This is the main goal of today. The register route does these 5 things in order:

```
1. Read name, email, password from req.body
2. Check all fields are present
3. Check if the email is already registered
4. Hash the password
5. Save the new user to MongoDB
```

```js
// controllers/authController.js
const bcrypt = require('bcryptjs');
const User   = require('../models/User');

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Step 1 — Check all fields are present
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password',
      });
    }

    // Step 2 — Check minimum password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Step 3 — Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Step 4 — Hash the password
    const saltRounds    = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Step 5 — Save the new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword, // ← never save the plain password
    });

    // Step 6 — Respond (never send the password back)
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });

  } catch (error) {
    next(error); // send to error handler middleware
  }
}

module.exports = { register };
```

---

## 10. The Routes File

```js
// routes/authRoutes.js
const express = require('express');
const { register } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);

module.exports = router;
```

---

## 11. Error Middleware

```js
// middleware/errorMiddleware.js

function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err.message);

  // Handle MongoDB duplicate key error (email already exists)
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'An account with this email already exists',
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', '),
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong on the server',
  });
}

module.exports = errorHandler;
```

---

## 12. Wiring It All Together in `server.js`

```js
// server.js
const express      = require('express');
const dotenv       = require('dotenv');
const cors         = require('cors');
const morgan       = require('morgan');
const connectDB    = require('./config/db');
const authRoutes   = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorMiddleware');

dotenv.config(); // load .env variables first
connectDB();     // connect to MongoDB

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Auth API is running ✅' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler — always last
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

---

## 13. Testing in Postman

### Test 1 — Successful Registration

```
Method:  POST
URL:     http://localhost:3000/api/auth/register
Body:    raw → JSON
```

```json
{
  "name": "Ada Lovelace",
  "email": "ada@mail.com",
  "password": "secret123"
}
```

**Expected response (201):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "665f1a2b3c4d5e6f7a8b9c0d",
    "name": "Ada Lovelace",
    "email": "ada@mail.com",
    "role": "user"
  }
}
```

---

### Test 2 — Missing Fields

```json
{
  "email": "ada@mail.com"
}
```

**Expected response (400):**
```json
{
  "success": false,
  "message": "Please provide name, email and password"
}
```

---

### Test 3 — Duplicate Email

Send the same request as Test 1 again.

**Expected response (400):**
```json
{
  "success": false,
  "message": "An account with this email already exists"
}
```

---

### Test 4 — Password Too Short

```json
{
  "name": "Grace Hopper",
  "email": "grace@mail.com",
  "password": "abc"
}
```

**Expected response (400):**
```json
{
  "success": false,
  "message": "Password must be at least 6 characters"
}
```

---

### Test 5 — Check MongoDB Compass

After a successful registration, open MongoDB Compass and look at the `users` collection. You should see:

```json
{
  "_id": "665f1a2b...",
  "name": "Ada Lovelace",
  "email": "ada@mail.com",
  "password": "$2b$10$N9qo8uLOickgx2ZMRZoMye...", ← hashed ✅
  "role": "user",
  "createdAt": "2025-06-01T10:00:00.000Z",
  "updatedAt": "2025-06-01T10:00:00.000Z"
}
```

The password is **never** the plain text — always the hash. That's what success looks like.

---

## ✅ Day 21 Checklist
- [ ] Can explain why plain passwords must never be stored
- [ ] Know the difference between hashing and encryption
- [ ] Know what salt rounds are and why 10 is the standard default
- [ ] Can hash a password using `bcrypt.hash()`
- [ ] Can compare a password using `bcrypt.compare()`
- [ ] Built the `POST /api/auth/register` endpoint
- [ ] Checked for duplicate emails before creating a user
- [ ] Verified in MongoDB Compass that the password is stored as a hash
- [ ] Tested all 5 Postman scenarios

## 💡 Homework
1. Add a `GET /api/auth/users` route that returns all users — but **never include the password field** in the response. Hint: use `.select('-password')` in Mongoose.
2. Try registering with the same email but different casing — `Ada@mail.com` vs `ada@mail.com`. What happens? How does the `lowercase: true` on the schema help?
3. **Bonus:** Add a `confirmPassword` field to the register request. In the controller, check that `password === confirmPassword` before saving. If they don't match, return a 400 error.
