# System Architecture

The application follows a simple fullstack architecture.

Frontend and backend are separated.

---

# Architecture Overview

Frontend (React)
↓
REST API (Express)
↓
Database (SQLite / PostgreSQL)

---

# Frontend

Framework:
React + Vite + TypeScript

Responsibilities:

- UI
- routing
- forms
- API calls

Pages include:

- Home
- Login
- Register
- Tournament List
- Tournament Detail
- Admin Panel
- Bracket View

---

# Backend

Framework:
Node.js + Express

Responsibilities:

- authentication
- business logic
- database interaction
- validation

Layered architecture:

Routes  
Controllers  
Services  
Database (Prisma)

---

# Database

ORM:
Prisma

Development:
SQLite

Production:
PostgreSQL

Main models:

User  
Tournament  
Registration  
Match

---

# Bracket System

The tournament bracket is represented by linked matches.

Each match has:

nextMatchId

When a match finishes:

winner → assigned to nextMatch

This allows automatic bracket progression.

---

# Deployment (Future)

Frontend:
Vercel

Backend:
Render

Database:
Neon PostgreSQL

---

# Scalability

The architecture is intentionally simple.

No microservices.

No distributed systems.

Single API + single database.

This keeps the project maintainable.