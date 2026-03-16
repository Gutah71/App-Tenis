# App-Tenis

Aplicación web fullstack para la gestión de torneos locales de tenis.  
Proyecto desarrollado como base para un **Trabajo Fin de Grado (TFG)**.

## Stack tecnológico

**Frontend**
- React
- Vite
- TypeScript
- React Router
- Tailwind CSS

**Backend**
- Node.js
- Express
- TypeScript
- Prisma ORM

**Base de datos**
- SQLite (desarrollo)
- PostgreSQL (previsto para producción)

---

## Instalación

Instalar dependencias:

```bash
npm install --prefix frontend
npm install --prefix backend

**Configurar Base de Datos**

cd backend
copy .env.example .env
npx prisma migrate dev --name init

** Ejecutar el proyecto **

Abrir dos terminales.

Frontend:
cd frontend
npm run dev

Backend:
cd backend
npm run dev

## Estado actual

El repositorio contiene la estructura inicial del proyecto con frontend, backend y base de datos configurados y funcionando.

## Funcionalidades previstas

- registro y login de usuarios
- roles ADMIN / PLAYER
- creación de torneos
- inscripción de jugadores
- generación automática del bracket
- gestión de resultados
- subida de reglas en PDF

## Estructura del proyecto

tennis-tournament-app/
├── package.json              ← scripts raíz de conveniencia
├── .gitignore
│
├── frontend/                 ← React + Vite + TS + Tailwind + React Router
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── router.tsx
│       ├── index.css
│       ├── components/
│       │   └── Layout.tsx
│       └── pages/
│           ├── HomePage.tsx
│           └── NotFoundPage.tsx
│
└── backend/                  ← Node + Express + TS + Prisma
    ├── package.json
    ├── tsconfig.json
    ├── .env  /  .env.example
    ├── prisma/
    │   ├── schema.prisma
    │   └── migrations/
    └── src/
        ├── app.ts
        ├── server.ts
        ├── lib/
        │   └── prisma.ts       ← singleton PrismaClient
        ├── routes/
        │   └── index.ts
        └── types/
            └── enums.ts        ← Role, TournamentStatus, Modality
