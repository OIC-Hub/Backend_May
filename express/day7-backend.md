# Day — Login & JWT Authentication

---

## 1. The Problem — HTTP Doesn't Remember You

Here's something important to understand: **HTTP is stateless**. Every request to your server is treated as brand new — the server has no memory of who you are from one request to the next.

So if a user logs in successfully on one request, how does the server know it's the same user on their *next* request — like "show me my profile" or "book this ticket"?

We need some way for the user to **prove who they are on every single request**, without typing their password every time. That's exactly what JWT solves.

---

## 2. What is a JWT?

JWT stands for **JSON Web Token**. It's a small piece of text the server gives the user after they log in successfully. The user then sends this token back on every future request to prove their identity.

### Real Life Analogy 🎫
Think of visiting a large event like a music festival.

> When you arrive, you show your ticket once at the gate. Security checks it, then puts a **wristband** on you.
>
> For the rest of the day, you don't need to show your ticket again — you just show your **wristband** to get into different areas.
>
> The wristband is proof you already passed the check.

```
Login        → like showing your ticket at the gate
JWT token    → like the wristband you get afterward
Every request → like showing the wristband to enter different areas
```

### Another Way to Think About It — An ID Card

```
1. You log in with your email and password (like applying for an ID)
2. Server verifies you are who you say you are
3. Server gives you an ID card (the JWT)
4. From now on, you just show your ID card (send the token) instead of your password
```

---

## 3. What's Inside a JWT?

A JWT is made of **three parts**, separated by dots:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImlhdCI6MTcxNjAwMDAwMH0.4f8a9b2c1d3e5f7a8b9c0d1e2f3a4b5c
└──────────── Header ────────────┘ └──────── Payload ────────┘ └──────── Signature ────────┘
```

| Part | What it contains |
|---|---|
| **Header** | Metadata — which algorithm was used to sign it |
| **Payload** | The actual data — usually the user's ID and role |
| **Signature** | Proof that the token wasn't tampered with |

### Important — JWTs Are NOT Encrypted

Anyone can decode a JWT and read the payload — try pasting any JWT into [jwt.io](https://jwt.io) and you'll see the data inside. **Never put sensitive data like passwords inside a JWT.** The signature only proves it wasn't *changed* — it doesn't hide the contents.

```js
// Good payload — just an identifier
{ id: '665f1a2b3c4d5e6f7a8b9c0d', role: 'user' }

// ❌ Never do this — don't put sensitive data in the payload
{ id: '123', password: 'mypassword123', creditCard: '4242...' }
```

---

## 4. Installing jsonwebtoken

```bash
npm install jsonwebtoken
```

```js
const jwt = require('jsonwebtoken');
```

---

## 5. Signing a Token — `jwt.sign()`

"Signing" means creating a new token.

```js
jwt.sign(payload, secret, options);
```

```js
const jwt = require('jsonwebtoken');

const payload = { id: '665f1a2b3c4d5e6f7a8b9c0d' };
const secret  = 'mySuperSecretKey123';

const token = jwt.sign(payload, secret, { expiresIn: '7d' });

console.log(token);
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NWYxYTJiM2M0ZDVlNmY3YThiOWMwZCIsImlhdCI6MTcxNjAwMDAwMH0.xyz123...
```

### Breaking Down the Parameters

```js
jwt.sign(
  { id: user._id },        // 1. Payload — data to store in the token
  process.env.JWT_SECRET,  // 2. Secret — used to sign and verify the token
  { expiresIn: '7d' }      // 3. Options — e.g. how long until it expires
);
```

### The Secret Key — Keep It Safe

The secret is what makes the signature valid. If someone else knows your secret, they can create fake tokens that your server will accept as real. **Always store it in `.env`, never hardcode it.**

```
# .env
JWT_SECRET=a8f5f167f44f4964e6c998dee827110c
JWT_EXPIRES_IN=7d
```

You can generate a strong random secret like this in the terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Common `expiresIn` Values

```js
{ expiresIn: '1h' }   // 1 hour
{ expiresIn: '1d' }   // 1 day
{ expiresIn: '7d' }   // 7 days
{ expiresIn: '30d' }  // 30 days
```

---

## 6. Verifying a Token — `jwt.verify()`

"Verifying" means checking if a token is valid and reading what's inside it.

```js
const decoded = jwt.verify(token, secret);
console.log(decoded);
// { id: '665f1a2b3c4d5e6f7a8b9c0d', iat: 1716000000, exp: 1716604800 }
```

If the token is invalid, expired, or tampered with, `jwt.verify()` **throws an error** — so always wrap it in try/catch:

```js
try {
  const decoded = jwt.verify(token, secret);
  console.log('Valid token!', decoded);
} catch (error) {
  console.log('Invalid or expired token');
}
```

> **Note:** We'll use `jwt.verify()` properly tomorrow when we build the auth middleware to protect routes. Today we focus on signing the token at login.

---

## 7. Building `POST /api/auth/login`

The login route does these steps in order:

```
1. Read email and password from req.body
2. Check both fields are present
3. Find the user in MongoDB by email
4. If no user found → 401 Unauthorized
5. Compare the submitted password with the stored hash using bcrypt
6. If passwords don't match → 401 Unauthorized
7. If everything is correct → sign a JWT and send it back
```

```js
// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const User   = require('../models/User');

// Helper function — keeps token creation in one place
function generateToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Step 1 — Check fields are present
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Step 2 — Find the user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // Step 3 — If no user, fail with a generic message
    // (Don't say "email not found" — that tells attackers which emails are registered)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Step 4 — Compare submitted password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Step 5 — Everything checks out — generate a token
    const token = generateToken(user._id);

    // Step 6 — Send the token and user info back
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });

  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, generateToken };
```

> ⚠️ **Security tip to teach students:** Notice both failure cases (`user not found` and `wrong password`) return the exact same message — `"Invalid email or password"`. This is intentional. If you said "email not found" vs "wrong password" separately, an attacker could figure out which emails are registered on your platform just by testing logins.

---

## 8. Updating the Routes File

```js
// routes/authRoutes.js
const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

module.exports = router;
```

---

## 9. Why Sign the Token Right After Registering Too?

A nice touch in real apps — after registering, log the user in immediately instead of making them fill the login form again:

```js
// In the register controller, after creating the user:
const token = generateToken(user._id);

res.status(201).json({
  success: true,
  message: 'Account created successfully',
  token, // ← bonus: user is logged in immediately after registering
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  },
});
```

---

## 10. Testing in Postman

### Test 1 — Successful Login

```
Method:  POST
URL:     http://localhost:3000/api/auth/login
Body:    raw → JSON
```

```json
{
  "email": "ada@mail.com",
  "password": "secret123"
}
```

**Expected response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NWYxYTJiM2M0ZDVlNmY3YThiOWMwZCIsImlhdCI6MTcxNjAwMDAwMCwiZXhwIjoxNzE2NjA0ODAwfQ.xyz...",
  "user": {
    "id": "665f1a2b3c4d5e6f7a8b9c0d",
    "name": "Ada Lovelace",
    "email": "ada@mail.com",
    "role": "user"
  }
}
```

**Copy this token** — you'll need it tomorrow to test protected routes.

---

### Test 2 — Wrong Password

```json
{
  "email": "ada@mail.com",
  "password": "wrongpassword"
}
```

**Expected response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### Test 3 — Email Doesn't Exist

```json
{
  "email": "doesnotexist@mail.com",
  "password": "anything"
}
```

**Expected response (401):** Same message as Test 2 — `"Invalid email or password"`

---

### Test 4 — Missing Fields

```json
{
  "email": "ada@mail.com"
}
```

**Expected response (400):**
```json
{
  "success": false,
  "message": "Please provide email and password"
}
```

---

## 11. Decode Your Token at jwt.io

Take the token from Test 1 and paste it into [jwt.io](https://jwt.io). You'll see the decoded payload on the right:

```json
{
  "id": "665f1a2b3c4d5e6f7a8b9c0d",
  "iat": 1716000000,
  "exp": 1716604800
}
```

- `iat` = issued at (when the token was created)
- `exp` = expires at (when the token becomes invalid)

This is a great demo to show students — proving that the token isn't "encrypted," just signed. Anyone can read it, but only your server (with the secret) can verify it's authentic.

---

## 12. Login Flow — The Full Picture

```
┌─────────────┐     1. POST /login (email + password)     ┌─────────────┐
│             │ ─────────────────────────────────────────▶ │             │
│   Client    │                                              │   Server    │
│  (Postman / │     2. Server verifies password with bcrypt  │             │
│   React)    │     3. Server signs a JWT                    │             │
│             │ ◀───────────────────────────────────────── │             │
└─────────────┘     4. { token, user }                      └─────────────┘

      Client stores the token (localStorage in React)

┌─────────────┐  5. GET /profile  Authorization: Bearer <token> ┌─────────┐
│   Client    │ ───────────────────────────────────────────────▶│ Server  │
└─────────────┘                                                  └─────────┘
                  (we build this protection tomorrow!)
```

---

## ✅ Day 22 Checklist
- [ ] Can explain what a JWT is using the ID card / wristband analogy
- [ ] Know the 3 parts of a JWT — header, payload, signature
- [ ] Understand that JWTs are signed, not encrypted — never put secrets inside
- [ ] Can sign a token with `jwt.sign(payload, secret, options)`
- [ ] Know why the JWT secret must be stored in `.env`
- [ ] Built the `POST /api/auth/login` route
- [ ] Used the same error message for "user not found" and "wrong password"
- [ ] Tested all 4 Postman scenarios
- [ ] Decoded a token at jwt.io to see what's inside

## 💡 Homework
1. Refactor the `register` controller to also return a token immediately after signup (so the user doesn't have to log in separately after registering).
2. Change `JWT_EXPIRES_IN` to `'10s'` temporarily, log in, wait 10 seconds, then try `jwt.verify()` on that token in a quick test script. What error do you get? Change it back to `'7d'` afterward.
3. **Bonus:** Add a `lastLogin` field to the User schema (type `Date`). Update it to `Date.now()` every time a user successfully logs in, using `user.save()`.
