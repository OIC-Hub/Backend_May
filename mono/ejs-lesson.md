# Bonus Lesson — EJS (Embedded JavaScript Templating)

---

## 1. What is EJS?

So far, your Express server has only ever returned **JSON** — data for a frontend (like React) to consume. EJS lets your server return **fully rendered HTML pages** instead.

**EJS** stands for **Embedded JavaScript**. It's a templating engine — a tool that lets you write HTML with JavaScript mixed inside it, so the server can generate dynamic web pages.

### Real Life Analogy 📄
Think of EJS like a **mail merge** in Microsoft Word. You write one letter template with placeholders like `[Name]` and `[Address]`, and the program fills in different data for each person — generating hundreds of personalized letters from one template.

EJS works the same way — you write **one HTML template** with placeholders, and the server fills in real data every time someone visits the page.

```
Template (one file)          +    Data (changes each time)    =    Final HTML (sent to browser)

<h1>Hello, <%= name %></h1>       { name: "Ada" }                  <h1>Hello, Ada</h1>
```

---

## 2. Where Does EJS Fit? Server-Rendered vs API

This is an important distinction for students who have only built React apps so far.

| | API + React (what you built earlier) | Server-Rendered with EJS (today) |
|---|---|---|
| Server sends | JSON data | Full HTML pages |
| Who builds the UI? | React (in the browser) | Express (on the server) |
| Routing | React Router (client-side) | Express routes (server-side) |
| Page reloads? | No — single page app | Yes — each route is a fresh page |
| Used for | Modern web apps, dashboards | Simple websites, admin panels, server-rendered blogs |

```
React + API flow:
Browser → asks server for JSON → React builds the HTML in the browser

EJS flow:
Browser → asks server for a page → server builds the FULL HTML → sends it ready-made
```

Both are valid — EJS is commonly used for simpler sites, internal admin tools, or when you want a webpage without setting up a separate frontend project.

---

## 3. Installing EJS

```bash
npm install ejs
```

You don't need to `require('ejs')` directly in most cases — Express handles it for you once you tell it to use EJS as the "view engine."

```js
// server.js
const express = require('express');
const app = express();

app.set('view engine', 'ejs'); // tells Express to use EJS for rendering
```

By default, Express looks for your templates inside a folder called **`views`**.

```
project/
├── views/              ← EJS templates go here
│   ├── home.ejs
│   └── about.ejs
├── server.js
└── package.json
```

---

## 4. Your First EJS Page

Create `views/home.ejs`:

```html
<!-- views/home.ejs -->
<!DOCTYPE html>
<html>
<head>
  <title>My First EJS Page</title>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>This page was rendered by the server using EJS.</p>
</body>
</html>
```

Render it from a route using `res.render()` instead of `res.json()`:

```js
// server.js
app.get('/', (req, res) => {
  res.render('home'); // looks for views/home.ejs
});
```

Visit `http://localhost:3000` in your browser — you'll see a full HTML page, not JSON.

---

## 5. EJS Syntax — The Tags You Need to Know

EJS uses special tags to mix JavaScript into your HTML. There are 3 main tags:

| Tag | What it does |
|---|---|
| `<%= %>` | Outputs a value (escaped — safe for text) |
| `<%- %>` | Outputs a value (unescaped — used for raw HTML) |
| `<% %>` | Runs JavaScript logic (no output) — for loops, if-statements |

---

### `<%= %>` — Output a Value

This is the one you'll use 90% of the time. It prints a value directly into the HTML, and automatically escapes special characters (protects against XSS attacks).

```html
<h1>Hello, <%= name %>!</h1>
<p>You have <%= cartCount %> items in your cart.</p>
```

Passed from the route like this:

```js
app.get('/', (req, res) => {
  res.render('home', {
    name: 'Ada',
    cartCount: 3,
  });
});
```

Result:
```html
<h1>Hello, Ada!</h1>
<p>You have 3 items in your cart.</p>
```

---

### `<% %>` — Run Logic (No Output)

Use this for `if` statements, `for` loops, and any JavaScript that doesn't directly print something.

```html
<% if (isLoggedIn) { %>
  <p>Welcome back!</p>
<% } else { %>
  <p>Please log in.</p>
<% } %>
```

```html
<ul>
  <% for (let i = 0; i < fruits.length; i++) { %>
    <li><%= fruits[i] %></li>
  <% } %>
</ul>
```

### Looping with `.forEach()` (Cleaner Style)

```html
<ul>
  <% users.forEach(function(user) { %>
    <li><%= user.name %> — <%= user.email %></li>
  <% }); %>
</ul>
```

---

### `<%- %>` — Output Raw HTML (Use Carefully)

Use this **only** when you intentionally want to output actual HTML tags (like when including partials — more on that soon). Never use it for user-submitted content, since it skips the safety escaping.

```html
<!-- ❌ Dangerous if "bio" came from user input -->
<div><%- user.bio %></div>

<!-- ✅ Safe — use <%= %> for anything from users -->
<div><%= user.bio %></div>
```

---

## 6. Passing Data from Express to EJS

The second argument of `res.render()` is an object — every key becomes a variable available inside the template.

```js
app.get('/profile', (req, res) => {
  res.render('profile', {
    name: 'Grace Hopper',
    role: 'Admiral',
    skills: ['COBOL', 'Compilers', 'Leadership'],
    isOnline: true,
  });
});
```

```html
<!-- views/profile.ejs -->
<h1><%= name %></h1>
<p><%= role %></p>

<% if (isOnline) { %>
  <span style="color: green;">● Online</span>
<% } else { %>
  <span style="color: gray;">● Offline</span>
<% } %>

<h3>Skills</h3>
<ul>
  <% skills.forEach(function(skill) { %>
    <li><%= skill %></li>
  <% }); %>
</ul>
```

---

## 7. Partials — Reusable Template Pieces

Just like React components let you reuse UI, EJS **partials** let you reuse pieces of HTML across multiple pages — like a navbar or footer.

### Real Life Analogy 🧩
Think of partials like a **LEGO piece** you build once and snap into multiple builds — instead of rebuilding the same navbar HTML on every single page.

### Creating a Partial

```
views/
├── partials/
│   ├── navbar.ejs
│   └── footer.ejs
├── home.ejs
└── about.ejs
```

```html
<!-- views/partials/navbar.ejs -->
<nav>
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/contact">Contact</a>
</nav>
```

```html
<!-- views/partials/footer.ejs -->
<footer>
  <p>&copy; 2025 My Company. All rights reserved.</p>
</footer>
```

### Including a Partial — `<%- include() %>`

Use `<%- %>` (not `<%= %>`) for includes, since you're injecting actual HTML:

```html
<!-- views/home.ejs -->
<!DOCTYPE html>
<html>
<head><title>Home</title></head>
<body>

  <%- include('partials/navbar') %>

  <main>
    <h1>Welcome Home!</h1>
  </main>

  <%- include('partials/footer') %>

</body>
</html>
```

Now every page that includes `navbar.ejs` and `footer.ejs` shares the exact same markup — change it once, and it updates everywhere.

### Passing Data into a Partial

```html
<%- include('partials/navbar', { activePage: 'home' }) %>
```

```html
<!-- partials/navbar.ejs -->
<nav>
  <a href="/" class="<%= activePage === 'home' ? 'active' : '' %>">Home</a>
  <a href="/about" class="<%= activePage === 'about' ? 'active' : '' %>">About</a>
</nav>
```

---

## 8. Serving CSS — Static Files

EJS handles HTML, but CSS files need to be served separately using `express.static()`.

```
project/
├── public/
│   └── style.css       ← CSS lives here
├── views/
│   └── home.ejs
└── server.js
```

```js
// server.js
app.use(express.static('public')); // makes /public files accessible
```

```html
<!-- views/home.ejs -->
<head>
  <link rel="stylesheet" href="/style.css">
</head>
```

> Note: even though the file is at `public/style.css`, you link to it as `/style.css` — Express strips the `public` folder name automatically.

---

## 9. Full Practice — Mini Event Listing Page (Server-Rendered)

Let's rebuild a simplified, server-rendered version of the events page from your Event Ticket Platform — this time using EJS instead of React.

### File Structure

```
ejs-events/
├── public/
│   └── style.css
├── views/
│   ├── partials/
│   │   ├── navbar.ejs
│   │   └── footer.ejs
│   ├── home.ejs
│   └── event-detail.ejs
├── server.js
└── package.json
```

---

### `server.js`

```js
const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

const events = [
  { id: 1, name: 'Afrobeats Night Lagos', category: 'Music', date: '2025-08-15', price: 5000 },
  { id: 2, name: 'Lagos Tech Summit',     category: 'Tech',  date: '2025-08-22', price: 10000 },
  { id: 3, name: 'Naija Food Festival',   category: 'Food',  date: '2025-09-05', price: 3000 },
];

// Home page — list all events
app.get('/', (req, res) => {
  res.render('home', {
    pageTitle: 'All Events',
    events: events,
  });
});

// Event detail page
app.get('/events/:id', (req, res) => {
  const event = events.find(e => e.id === Number(req.params.id));

  if (!event) {
    return res.status(404).send('Event not found');
  }

  res.render('event-detail', {
    pageTitle: event.name,
    event: event,
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
```

---

### `views/partials/navbar.ejs`

```html
<nav class="navbar">
  <a href="/" class="logo">🎟️ TicketNG</a>
</nav>
```

### `views/partials/footer.ejs`

```html
<footer class="footer">
  <p>&copy; 2025 TicketNG. Built with EJS.</p>
</footer>
```

---

### `views/home.ejs`

```html
<!DOCTYPE html>
<html>
<head>
  <title><%= pageTitle %></title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>

  <%- include('partials/navbar') %>

  <main class="container">
    <h1>Upcoming Events</h1>

    <div class="event-grid">
      <% events.forEach(function(event) { %>
        <a href="/events/<%= event.id %>" class="event-card">
          <span class="badge"><%= event.category %></span>
          <h3><%= event.name %></h3>
          <p>📅 <%= event.date %></p>
          <p class="price">₦<%= event.price.toLocaleString() %></p>
        </a>
      <% }); %>
    </div>
  </main>

  <%- include('partials/footer') %>

</body>
</html>
```

---

### `views/event-detail.ejs`

```html
<!DOCTYPE html>
<html>
<head>
  <title><%= pageTitle %></title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>

  <%- include('partials/navbar') %>

  <main class="container">
    <a href="/">← Back to events</a>
    <h1><%= event.name %></h1>
    <span class="badge"><%= event.category %></span>
    <p>📅 <%= event.date %></p>
    <p class="price">₦<%= event.price.toLocaleString() %></p>
  </main>

  <%- include('partials/footer') %>

</body>
</html>
```

---

### `public/style.css`

```css
body {
  font-family: Arial, sans-serif;
  margin: 0;
  background: #f8fafc;
  color: #0f172a;
}

.navbar {
  background: #0f172a;
  padding: 16px 24px;
}

.navbar .logo {
  color: white;
  font-weight: bold;
  text-decoration: none;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.event-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.event-card {
  display: block;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  text-decoration: none;
  color: inherit;
}

.badge {
  font-size: 12px;
  background: #e0e7ff;
  color: #4f46e5;
  padding: 2px 10px;
  border-radius: 20px;
}

.price {
  font-weight: bold;
  color: #4f46e5;
}

.footer {
  text-align: center;
  padding: 16px;
  color: #888;
  font-size: 13px;
}
```

---

### Test It

```bash
npm install express ejs
node server.js
```

- [ ] Visit `http://localhost:3000` → see all 3 events in a grid
- [ ] Click an event → goes to `/events/1`, `/events/2`, etc.
- [ ] Visit `/events/99` → see "Event not found"
- [ ] Navbar and footer appear identically on both pages (because of partials)

---

## 10. EJS vs React — Quick Recap for Students

| | EJS | React |
|---|---|---|
| Where HTML is built | On the server | In the browser |
| Page navigation | Full page reload each time | No reload (SPA) |
| Best for | Simple sites, admin panels, server-rendered blogs | Interactive apps, dashboards, SPAs |
| Learning curve | Simple — just HTML + a few tags | More concepts (components, state, hooks) |
| You already know | All of the JS logic — same `if`, same `.forEach()` | — |

> EJS is a great tool to know, but for the kind of interactive product you built in the Event Ticket Platform (live price calculation, instant filtering, no page reloads) — React is still the better tool. Think of EJS as another option in your toolbox, not a replacement for React.

---

## ✅ Checklist
- [ ] Can explain what EJS is and how it differs from the React + API approach
- [ ] Set `view engine` to `ejs` and rendered a page with `res.render()`
- [ ] Know the difference between `<%= %>`, `<%- %>`, and `<% %>`
- [ ] Can pass data from a route into a template
- [ ] Can loop through arrays and use if-statements inside EJS
- [ ] Created and included partials for shared layout (navbar, footer)
- [ ] Served CSS using `express.static()`
- [ ] Built the mini server-rendered events page

## 💡 Homework
1. Add a search form on the home page — a simple HTML `<form>` with `method="GET"` and an input named `search`. Use `req.query.search` in the route to filter the events array before rendering, so the page reloads with filtered results.
2. Add a `views/partials/event-card.ejs` partial for a single event card, and use `<%- include('partials/event-card', { event: event }) %>` inside the `.forEach()` loop instead of writing the card markup directly in `home.ejs`.
3. **Bonus:** Add a 4th event to the array with no `price` (set it to `0`). On the event card, show "Free" instead of "₦0" using a ternary inside `<%= %>`: `<%= event.price === 0 ? 'Free' : '₦' + event.price.toLocaleString() %>`
