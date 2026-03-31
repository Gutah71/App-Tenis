-- AlterTable
ALTER TABLE "Match" ADD COLUMN "scheduledDate" DATETIME;

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN "endDate" DATETIME;
ALTER TABLE "Tournament" ADD COLUMN "location" TEXT;
ALTER TABLE "Tournament" ADD COLUMN "startDate" DATETIME;

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leagueId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Announcement_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Announcement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
