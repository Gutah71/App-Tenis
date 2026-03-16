# AI Development Instructions

These rules must be followed by any AI assistant working on this repository
(Claude, ChatGPT, etc.).

The goal is to maintain a clean, consistent and scalable codebase.

---

# Project

Tennis Tournament Management Web Application.

Main features:

- User registration and authentication
- Roles: ADMIN and PLAYER
- Admin can create tournaments
- Players can register for tournaments
- Automatic elimination bracket generation
- Match result management
- Bracket visualization
- Tournament rules PDF upload

---

# Tech Stack (DO NOT CHANGE)

Frontend
- React
- Vite
- TypeScript
- React Router
- TailwindCSS

Backend
- Node.js
- Express
- TypeScript
- Prisma ORM

Database
- SQLite (development)
- PostgreSQL (production)

---

# Repository Structure

tennis-tournament-app
│
├ frontend
└ backend

Frontend and backend must remain separate projects.

---

# Frontend Rules

Location:
frontend/src

Structure:

src
│
├ components
├ pages
├ router.tsx
├ App.tsx
└ main.tsx

Guidelines:

- Use functional React components
- Use React Router
- Pages go inside `pages/`
- Shared UI goes inside `components/`
- Do NOT introduce Redux or heavy state libraries
- Use hooks for state

# Styling Rules

Styling must follow these rules strictly:

- Do NOT write CSS inside React components
- Do NOT use inline styles
- Do NOT use `<style>` tags
- Do NOT create style objects inside components

Allowed approaches:

1. TailwindCSS utility classes
2. Global styles in `index.css`
3. Dedicated CSS files if needed

Example (correct):

<div className="flex items-center justify-between p-4 bg-white shadow rounded-lg">

Example (incorrect):

<div style={{ padding: "10px", backgroundColor: "white" }}>

---

# Backend Rules

Location:
backend/src

Structure:

src
│
├ routes
├ controllers
├ services
├ middlewares
├ lib
│   └ prisma.ts
│
├ app.ts
└ server.ts

Architecture rules:

- Routes define endpoints
- Controllers handle HTTP logic
- Services contain business logic
- Prisma handles database access

Do not mix responsibilities.

---

# Prisma Rules

Schema location:

backend/prisma/schema.prisma

Current development database:
SQLite

Production database:
PostgreSQL

To switch to PostgreSQL:

1. Change datasource provider
2. Update DATABASE_URL
3. Run migrations

---

# Match Model

Matches represent the tournament bracket.

Important fields:

- player1Id
- player2Id
- winnerId
- nextMatchId

Winners progress to the next match using `nextMatchId`.

Do not redesign this structure without explanation.

---

# Authentication

Planned system:

- bcrypt for password hashing
- JWT tokens
- authentication middleware
- role authorization middleware

Roles:

ADMIN
PLAYER

---

# Middleware

Backend middleware should include:

- authentication
- role authorization
- error handler
- request logging

Existing libraries:

- helmet
- cors
- morgan
- dotenv

---

# Coding Style

Rules:

- Use TypeScript
- Use async/await
- Avoid `any`
- Prefer readability
- Small focused functions

---

# Forbidden Additions

AI must NOT introduce:

- Redux
- Next.js
- NestJS
- GraphQL
- Microservices
- Docker
- WebSockets
- Serverless architecture

Keep the architecture simple.

---

# Development Order

Modules must be implemented in this order:

1. Authentication
2. Tournament CRUD
3. Player registration
4. Match generation
5. Match results
6. Bracket visualization
7. PDF upload

---

# API Design

Use RESTful routes.

Examples:

POST   /auth/register  
POST   /auth/login  

GET    /tournaments  
POST   /tournaments  
GET    /tournaments/:id  

POST   /tournaments/:id/register  

POST   /matches/:id/result  

---

# Error Handling

Backend must return structured JSON errors.

Example:

{
  "error": "Tournament not found"
}

---

# Security

Rules:

- Passwords must be hashed
- JWT must protect private routes
- Admin routes require ADMIN role

---

# AI Behaviour

When generating code:

- Do not change architecture
- Respect existing schema
- Do not introduce new frameworks
- Prefer simple solutions
- Explain major changes before implementing them

# Important Rule for AI

Never place CSS inside React components.

If styling is required:
- Prefer TailwindCSS classes
- Otherwise create or update a CSS file

Inline styling is forbidden unless explicitly requested.