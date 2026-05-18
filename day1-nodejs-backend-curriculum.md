# Day 1 — What is a Backend & Node.js Basics

> **Week 1 of 4 · Node.js + MongoDB Backend Curriculum**

---

---

## Part 1 — Mental Model

### What is a server?

A server is just a computer — one that listens for incoming requests and sends back responses. Unlike your laptop, a server is always running, always waiting. When you visit a website, your browser sends a request to a server somewhere in the world, and that server sends back HTML, data, or both.

Think of it like a restaurant:

- **You (browser)** — place an order (HTTP request)
- **Waiter (server)** — takes the order, goes to the kitchen
- **Kitchen (database)** — prepares the data
- **Waiter again** — brings it back to your table (HTTP response)

### Frontend vs Backend

| | Frontend | Backend |
|---|---|---|
| **Where it runs** | Browser (user's device) | Server (your machine or the cloud) |
| **Language** | HTML, CSS, JavaScript | Node.js, Python, Ruby, etc. |
| **What it handles** | UI, interactions, display | Data, logic, authentication, secrets |
| **Visible to users** | Yes | No |

The backend is where you keep things users should never see: database credentials, business logic, API keys, and raw data.

### What is Node.js?

Node.js is JavaScript that runs **outside the browser**. It uses the same V8 engine that powers Chrome, but wraps it with C++ bindings that give JavaScript access to the file system, network, operating system, and more.

Before Node.js (2009), JavaScript could only run in browsers. Node.js changed that — suddenly you could use one language for both frontend and backend.

```
Browser          Server (Node.js)         Database
───────          ────────────────         ────────
fetch('/events')  →  receive request
                     query database   →   find({})
                     build response   ←   return rows
render UI        ←  res.json(data)
```

---

## Part 2 — Setup & First Run

### Installing Node.js

1. Go to [nodejs.org](https://nodejs.org)
2. Download the **LTS (Long Term Support)** version — it's the most stable
3. Run the installer and follow the prompts
4. Node.js comes with **npm** (Node Package Manager) bundled — you get both at once

### Verifying your installation

Open your terminal and run:

```bash
node -v
# → v20.x.x  (or similar)

npm -v
# → 10.x.x  (or similar)
```

If both print version numbers, you're set. If you see "command not found", restart your terminal and try again — or re-run the installer.

### Running your first JavaScript file

Create a new folder for today's work, then create a file called `index.js`:

```js
console.log("Hello from Node.js!")
```

Run it from the terminal:

```bash
node index.js
# → Hello from Node.js!
```

That's it. You just ran JavaScript outside a browser.

### The Node REPL

Type `node` alone in the terminal (no filename) to open the **REPL** — an interactive JavaScript shell:

```bash
node
```

```
Welcome to Node.js v20.x.x
Type ".help" for more information.
>
```

You can type any JavaScript expression and see the result immediately:

```
> 2 + 2
4
> "hello".toUpperCase()
'HELLO'
> new Date()
2025-...
```

The REPL is great for quick experiments. Exit with `.exit` or press **Ctrl + C** twice.

---

## Part 3 — Key Globals

Node.js gives you several global variables that are always available — no import needed.

### `console.log` and friends

```js
console.log("This prints to the terminal")
console.error("This prints to stderr — useful for errors")
console.warn("A warning message")
console.table([{ name: "Alice" }, { name: "Bob" }])  // prints a table
```

In the browser, `console.log` appears in DevTools. In Node.js, it prints directly to your terminal.

### `__dirname` and `__filename`

```js
console.log(__dirname)
// → /Users/you/projects/my-app   (absolute path to this folder)

console.log(__filename)
// → /Users/you/projects/my-app/index.js   (absolute path to this file)
```

These are useful when you need to build paths to other files relative to your script — more reliable than assuming where the user ran the command from.

### `process.env`

`process` is a global object that gives you information about the current Node.js process. `process.env` holds **environment variables** — key/value pairs you set in the terminal or a `.env` file:

```js
// Read an environment variable
const port = process.env.PORT
console.log(port)   // → 3000  (if PORT was set)

// Check the Node.js version
console.log(process.version)   // → v20.x.x

// See all environment variables
console.log(process.env)   // → { HOME: '/Users/you', PATH: '...', ... }
```

Set a variable when running a script:

```bash
PORT=3000 node index.js
```

> **Why this matters:** You'll use `process.env` constantly in backend development to store secrets (database passwords, API keys) without hardcoding them into your source code.

### Reading files with the `fs` module

The `fs` (file system) module lets you read and write files. It's a built-in Node.js module — no installation needed.

**Callback style** (older, still common):

```js
const fs = require('fs')

fs.readFile('./message.txt',  {
  if (err) throw err
  console.log(data)
})
```

**Promise style** (modern, preferred):

```js
const { readFile } = require('fs/promises')

async function main() {
  const text = await readFile('./message.txt', 'utf8')
  console.log(text)
}

main()
```

> Prefer the promise style (`fs/promises`) in all new code — it's cleaner, easier to read, and works naturally with `async/await`.

**Writing a file:**

```js
const { writeFile } = require('fs/promises')

await writeFile('./output.txt', 'Hello, file system!')
```

---

## Part 4 — Putting It Together

Here's a script that combines everything from today:

```js
const { readFile } = require('fs/promises')

async function main() {
  // 1. Print name and current date
  const name = "Your Name"
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  console.log(`Name: ${name}`)
  console.log(`Date: ${today}`)

  // 2. Show file paths
  console.log(`\nScript location:`)
  console.log(`  Folder: ${__dirname}`)
  console.log(`  File:   ${__filename}`)

  // 3. Show an environment variable
  const env = process.env.NODE_ENV || 'development'
  console.log(`\nEnvironment: ${env}`)

  // 4. Read a file
  try {
    const message = await readFile('./message.txt', 'utf8')
    console.log(`\nFile contents:\n${message}`)
  } catch (err) {
    console.error('\nmessage.txt not found — create it first!')
  }
}

main()
```

---

## Practice Exercise

**Task:** Write a script (`day1.js`) that does the following:

- [ ] Prints your name and the current date (use `new Date().toLocaleDateString()`)
- [ ] Creates a `message.txt` file with any content you like (do this manually or with `writeFile`)
- [ ] Reads `message.txt` and prints its contents to the terminal
- [ ] Prints the absolute path of your script using `__dirname` and `__filename`

*

| Concept | What it is |
|---|---|
| `node index.js` | Runs a JavaScript file with Node.js |
| `node` (no args) | Opens the interactive REPL |
| `__dirname` | Absolute path to the current folder |
| `__filename` | Absolute path to the current file |
| `process.env.KEY` | Reads an environment variable |
| `require('fs/promises')` | Imports the file system module |
| `await readFile(path, 'utf8')` | Reads a file as a string |

---

## What's Next

**Day 2** — Node Modules, `require`, npm, and `package.json`

You'll learn how Node.js organizes code into modules, how to install third-party packages with npm, and how `package.json` works — the foundation for every Node project you'll ever build.

---

*Node.js + MongoDB Backend Curriculum · Week 1, Day 1*
