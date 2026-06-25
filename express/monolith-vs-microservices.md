# Bonus Lesson — Monolithic Architecture

---

## 1. What is a Monolith?

A **monolithic application** (or "monolith") is an app where the entire system — frontend, backend logic, database access, authentication, everything — is built and deployed as **one single unit**.

### Real Life Analogy 🏠
Think of a monolith like a **single house** with everything inside it — the kitchen, bedroom, bathroom, and living room are all under one roof, sharing the same walls and foundation.

If you want to renovate the kitchen, you still have to deal with the whole house. You can't just "unplug" the kitchen and work on it separately.

```
┌─────────────────────────────────────┐
│         ONE APPLICATION              │
│                                       │
│  Auth   Events   Bookings   Users   │
│  Logic  Logic     Logic     Logic   │
│                                       │
│         ONE Database                 │
│         ONE Codebase                 │
│         ONE Deployment               │
└─────────────────────────────────────┘
```

This is exactly what you've been building throughout this course — the Event Ticket Platform API is a monolith. Auth, events, and bookings all live in the same Express app, share the same `server.js`, and deploy together as one unit.

---

## 2. What Does a Monolith Look Like in Code?

```
ticketng-api/                  ← ONE project, ONE deployment
├── controllers/
│   ├── authController.js      ← auth logic
│   ├── eventController.js     ← events logic
│   └── bookingController.js   ← bookings logic
├── models/
│   ├── User.js
│   ├── Event.js
│   └── Booking.js
├── routes/
│   ├── authRoutes.js
│   ├── eventRoutes.js
│   └── bookingRoutes.js
└── server.js                  ← everything starts from here
```

Even though the code is organized into separate files (which is good practice!), it's still **one application**. All of it runs as a single Node process, talks to a single MongoDB database, and is deployed to a single server (like Render).

> **Important distinction:** Organizing code into folders (controllers, models, routes) is good structure. It does **not** make your app a microservice. A monolith can be very well organized and still be a monolith.

---

## 3. The Opposite — Microservices (Just So You Know What It's Compared To)

A **microservices architecture** splits the application into many small, independent services — each with its own codebase, its own database, and its own deployment.

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Auth Service │   │Event Service │   │Booking Service│
│              │   │              │   │              │
│  own DB      │   │  own DB      │   │  own DB      │
│  own server  │   │  own server  │   │  own server  │
└──────────────┘   └──────────────┘   └──────────────┘
       ↑                  ↑                   ↑
       └──────────────────┴───────────────────┘
              All talk to each other over the network
              (usually through an API Gateway)
```

### Real Life Analogy 🏢
Instead of one house, microservices is like a **business park** with separate buildings — one for HR, one for Sales, one for Engineering. Each building has its own staff, its own security, its own electricity. If the HR building catches fire, Sales keeps working fine.

---

## 4. Monolith vs Microservices — Side by Side

| | Monolith | Microservices |
|---|---|---|
| Codebase | One repository | Many repositories |
| Database | Usually one shared DB | Each service has its own DB |
| Deployment | Deploy the whole app at once | Deploy each service independently |
| Communication | Functions calling functions directly | Services call each other over the network (HTTP, message queues) |
| Good for | Small teams, startups, MVPs | Large teams, large-scale companies |
| Complexity to start | Low | High |
| Complexity at scale | Can get messy | Easier to scale individual parts |
| Examples (early stage) | Instagram, Facebook, Twitter all started as monoliths | Netflix, Uber, Amazon (today, at massive scale) |

---

## 5. Why Almost Every Company Starts with a Monolith

This is the most important point of this lesson:

> **Nearly every successful tech company — Amazon, Netflix, Uber, Airbnb, Shopify — started as a monolith.** They only broke into microservices years later, once they had hundreds of engineers and millions of users.

### Why? Because monoliths are:

```
✅ Faster to build           — one codebase, one place to work
✅ Easier to test             — no network calls between parts
✅ Easier to deploy           — push one app, done
✅ Cheaper to run             — one server, one database
✅ Simpler to debug           — everything in one place, one log file
✅ Perfect for small teams    — no need to coordinate across services
```

### Why Companies Eventually Move to Microservices

As a company grows, problems start to appear:

```
❌ Codebase becomes huge and hard to navigate
❌ One small bug can crash the entire app
❌ Hundreds of engineers working in the same codebase → conflicts
❌ Can't scale just the "popular" part of the app independently
❌ Slow deployments — the whole app must redeploy for any change
```

At that point, splitting into microservices starts to make sense — but only because the **scale** justifies the added complexity.

---

## 6. The Trap Beginners Fall Into

A very common mistake new developers make is trying to build microservices on Day 1 because it sounds more "advanced" or "professional."

### Why This is a Mistake

```
Microservices require you to handle:
- Service-to-service communication (HTTP calls between your own services)
- Distributed data — keeping multiple databases in sync
- Network failures — what if one service is down?
- More complex deployment (multiple servers, containers, orchestration)
- Authentication shared across services
- Much more DevOps knowledge (Docker, Kubernetes, message queues)
```

For a small app, a learning project, or even most startups in their first 1-3 years — this complexity solves problems you don't have yet, while creating new problems you didn't have before.

### The Rule of Thumb

> **Start with a monolith. Split into microservices only when you have a real, painful reason to.**

That "real reason" is usually: a large team that keeps stepping on each other's code, a specific part of the app that needs to scale independently (like a video processing service), or strict requirements to deploy one part without touching others.

---

## 7. Is Your Event Ticket Platform a "Bad" Monolith?

No — not at all. What you've built is exactly how it **should** be done:

```
✅ Organized into routes / controllers / models (clean structure)
✅ Each resource (auth, events, bookings) has its own files
✅ Easy to understand, easy to deploy, easy to debug
✅ Perfect for a small team or solo developer
✅ Can be scaled later if needed
```

This pattern even has a name — a **modular monolith**. It's a monolith (one deployment, one database) but internally organized as if each part were separate, with clean boundaries between them. Many real companies run modular monoliths successfully for years.

```
ticketng-api/
├── modules/
│   ├── auth/
│   │   ├── auth.controller.js
│   │   ├── auth.routes.js
│   │   └── auth.model.js
│   ├── events/
│   │   ├── event.controller.js
│   │   ├── event.routes.js
│   │   └── event.model.js
│   └── bookings/
│       ├── booking.controller.js
│       ├── booking.routes.js
│       └── booking.model.js
└── server.js
```

This structure groups files **by feature** instead of by type — it's a nice evolution of the project structure you've already been using, and it's a great stepping stone if a project ever does need to be split into microservices later.

---

## 8. When Would YOU Actually Need Microservices?

Be honest with students about this — it helps set realistic expectations for their careers:

```
You need microservices when:
✓ You have 50+ engineers who can't all work in one codebase efficiently
✓ Different parts of your app have very different scaling needs
   (e.g. video processing needs 100 servers, but auth only needs 2)
✓ Different parts need to be written in different languages
✓ You need to deploy parts of your system independently, multiple times a day
✓ One team needs full ownership over one service without touching others

You do NOT need microservices when:
✗ You're building a personal project
✗ You're a small team (1-10 people)
✗ Your app doesn't have millions of users yet
✗ You just think it sounds "more professional"
```

---

## 9. Summary Diagram

```
                    MONOLITH                    MICROSERVICES
                  
   Team size        1-15 people                 50+ people
   
   Codebase      ┌──────────────┐         ┌────┐ ┌────┐ ┌────┐
                 │              │         │Auth│ │Event│ │Book│
                 │  Everything  │         └────┘ └────┘ └────┘
                 │              │
                 └──────────────┘

   Database      ┌──────────────┐         ┌────┐ ┌────┐ ┌────┐
                 │   One DB      │         │ DB │ │ DB │ │ DB │
                 └──────────────┘         └────┘ └────┘ └────┘

   Deployment       Deploy once              Deploy each separately

   Best for      Startups, MVPs,           Large-scale companies
                 learning, small teams      with complex needs
```

---

## ✅ Checklist
- [ ] Can explain what a monolith is in your own words
- [ ] Can explain what microservices are, in contrast
- [ ] Know why almost every company starts with a monolith
- [ ] Understand the real risks of jumping to microservices too early
- [ ] Can identify that the Event Ticket Platform built in this course is a (well-organized) monolith
- [ ] Know what a "modular monolith" is and why it's a good middle ground

## 💬 Discussion Questions (Use in Class)
1. "If Instagram started as a monolith with just 13 employees, why do you think it eventually moved toward microservices as it grew to billions of users?"
2. "What problems would you run into if you tried to split your Event Ticket Platform into 3 separate services (auth, events, bookings) right now, today, as a solo developer?"
3. "Look at your own project structure — is it closer to a plain monolith or a modular monolith? What would you change to make it more modular?"

## 💡 Homework
1. Reorganize your Event Ticket Platform project structure from **type-based** (`controllers/`, `models/`, `routes/`) into **feature-based** modules (`modules/auth/`, `modules/events/`, `modules/bookings/`) as shown in section 7. Confirm the app still runs exactly the same after the reorganization.
2. Write a short paragraph (5-6 sentences) in your own words: "Why did I choose to build my final project as a monolith, and under what conditions would I consider splitting it into microservices in the future?"
