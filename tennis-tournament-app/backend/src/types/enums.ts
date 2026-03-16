// ─────────────────────────────────────────────────────────────────────────────
// Application-layer enums
//
// SQLite does not support Prisma enums natively → values are stored as String.
// These TypeScript types enforce valid values throughout the codebase.
//
// When migrating to PostgreSQL:
//   1. Uncomment the `enum` blocks in prisma/schema.prisma.
//   2. Replace `String` fields with the corresponding Prisma enum type.
//   3. Remove or alias the types below — Prisma will generate them automatically.
// ─────────────────────────────────────────────────────────────────────────────

export type Role = 'ADMIN' | 'PLAYER';

export type TournamentStatus =
  | 'DRAFT'
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'FINISHED'
  | 'CANCELLED';

export type Modality = 'SINGLES' | 'DOUBLES';
