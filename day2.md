````md
# Core Node.js Modules + Async JavaScript

---

# Day 2 — Core Node.js Modules

# What Are Built-in Modules?

Node.js comes with powerful modules already included.

You do NOT need to install them with npm.

Examples:
- `fs` → File System
- `path` → File paths
- `os` → Operating system information
- `http` → Create servers

---

# 1. FS Module — File System

The `fs` module allows us to:
- Read files
- Write files
- Update files
- Delete files
- Create folders

---

## Importing fs

```js
const fs = require('fs');
````


# Reading Files

## Example

```js
const fs = require('fs');

const data = fs.readFileSync('message.txt', 'utf8');

console.log(data);
```


# Writing Files

## Example

```js
const fs = require('fs');

fs.writeFileSync('note.txt', 'Hello students!');

console.log('File created successfully');
```

---

# Appending to Files

```js
fs.appendFileSync('note.txt', '\nNew line added');
```

---

# Deleting Files

```js
fs.unlinkSync('note.txt');
```

---

# Creating Folders

```js
fs.mkdirSync('notes');
```

---

# Reading JSON Files

## users.json

```json
[
  {
    "name": "Israel",
    "age": 22
  }
]
```

## Reading JSON

```js
const fs = require('fs');

const data = fs.readFileSync('users.json', 'utf8');

const users = JSON.parse(data);

console.log(users);
```

---

# Writing JSON Files

```js
const fs = require('fs');

const users = [
  {
    name: 'Ada',
    age: 25
  }
];

fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
```

---

# 3. OS Module

The `os` module gives information about the computer system.

---

## Importing os

```js
const os = require('os');
```

---

# Useful Methods

## Platform

```js
console.log(os.platform());
```

---

## CPU Architecture

```js
console.log(os.arch());
```

---

## Free Memory

```js
console.log(os.freemem());
```

---

## Total Memory

```js
console.log(os.totalmem());
```

---

# 4. HTTP Module

Before Express existed, Node.js used the built-in `http` module.

This helps students understand what Express is actually simplifying.

---

# Creating a Raw HTTP Server

```js
const http = require('http');

const server = http.createServer((req, res) => {
  res.write('Hello from Node.js Server');
  res.end();
});

server.listen(5000, () => {
  console.log('Server running on port 5000');
});
```

---

# Understanding req and res

| Object | Meaning            |
| ------ | ------------------ |
| `req`  | Incoming request   |
| `res`  | Response sent back |

---

# Checking Request URL

```js
const server = http.createServer((req, res) => {

  if (req.url === '/') {
    res.end('Home Page');
  }

  else if (req.url === '/about') {
    res.end('About Page');
  }

  else {
    res.end('404 Page Not Found');
  }

});
```

---

# Practice Project — Mini Notes App

## Goal

Build a Notes App using:

* `fs`
* JSON files
* Node.js

---

# Features

Students should be able to:

* Add notes
* Read all notes
* Delete notes


# Day 3 — Async JavaScript for Backend


# Why Async Matters

Servers handle MANY users at once.

If one operation blocks the server:

* every user waits
* performance becomes terrible

Node.js solves this with asynchronous programming.

---

# Blocking vs Non-Blocking Code

## Blocking Example

```js
const fs = require('fs');

const data = fs.readFileSync('largeFile.txt', 'utf8');

console.log(data);

console.log('This waits until file finishes reading');
```

---

# Non-Blocking Example

```js
const fs = require('fs');

fs.readFile('largeFile.txt', 'utf8', (err, data) => {

  if (err) {
    console.log(err);
    return;
  }

  console.log(data);

});

console.log('This runs immediately');
```

---

# Callbacks

A callback is a function passed into another function.

---

# Callback Example

```js
function greet(name, callback) {
  console.log('Hello ' + name);

  callback();
}

greet('Israel', () => {
  console.log('Callback executed');
});
```

---

# Callback Hell

```js
loginUser(() => {
  getProfile(() => {
    getPosts(() => {
      getComments(() => {

      });
    });
  });
});
```

This becomes difficult to read.

Promises solve this.

---

# Promises

A Promise represents:

* pending
* fulfilled
* rejected

---

# Promise Example

```js
const promise = new Promise((resolve, reject) => {

  let success = true;

  if (success) {
    resolve('Operation successful');
  } else {
    reject('Operation failed');
  }

});

promise
  .then(data => console.log(data))
  .catch(err => console.log(err));
```

---

# Async/Await

Modern way to handle asynchronous code.

Cleaner than callbacks and `.then()`.

---

# Async Function Example

```js
async function getData() {
  return 'Hello';
}

getData().then(console.log);
```

---

# Await Example

```js
function fetchUser() {

  return new Promise((resolve) => {

    setTimeout(() => {
      resolve('User fetched');
    }, 2000);

  });

}

async function getUser() {

  const user = await fetchUser();

  console.log(user);

}

getUser();
```

---

# Try/Catch

Used to handle errors safely.

---

# Example

```js
async function getData() {

  try {

    const result = await fetchUser();

    console.log(result);

  } catch (error) {

    console.log(error);

  }

}
```

---

# Reading Files Asynchronously

```js
const fs = require('fs');

fs.readFile('message.txt', 'utf8', (err, data) => {

  if (err) {
    console.log(err);
    return;
  }

  console.log(data);

});
```

---

# Reading Files with Promises

```js
const fs = require('fs/promises');

async function readData() {

  try {

    const data = await fs.readFile('message.txt', 'utf8');

    console.log(data);

  } catch (error) {

    console.log(error);

  }

}

readData();
```

---

# Fetching API Data

Node.js v18+ supports `fetch()` natively.

---

# Example

```js
async function getUsers() {

  try {

    const response = await fetch('https://jsonplaceholder.typicode.com/users');

    const data = await response.json();

    console.log(data);

  } catch (error) {

    console.log(error);

  }

}

getUsers();
```

---

# Class Exercise

## Task 1

Read a JSON file asynchronously and print the contents.

---

## Task 2

Fetch users from:

```bash
https://jsonplaceholder.typicode.com/users
```

Then:

* print all names
* print all emails

---

# Mini Challenge

Build a script that:

1. Fetches users from an API
2. Saves them into `users.json`
3. Reads the file again
4. Prints the users

---

# Homework

## Build an Async Notes App

Requirements:

* Read notes asynchronously
* Save notes asynchronously
* Use async/await
* Handle errors using try/catch

Bonus:

* Add timestamps
* Prevent duplicate note titles


