/*
  Warnings:

  - You are about to drop the column `active` on the `Coach` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `Player` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "SalaryHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "coachId" TEXT NOT NULL,
    CONSTRAINT "SalaryHistory_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ImportSummary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileName" TEXT NOT NULL,
    "stats_created" INTEGER NOT NULL,
    "stats_updated" INTEGER NOT NULL,
    "stats_unchanged" INTEGER NOT NULL,
    "stats_errors" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "ImportDetail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "summaryId" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "entityId" TEXT,
    "conflictEntityId" TEXT,
    "conflictData" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ImportDetail_summaryId_fkey" FOREIGN KEY ("summaryId") REFERENCES "ImportSummary" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Coach" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "dni" TEXT,
    "birthDate" DATETIME,
    "observations" TEXT,
    "tira" TEXT,
    "category" TEXT,
    "role" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVO',
    "salary" REAL NOT NULL DEFAULT 0,
    "registrationDate" DATETIME,
    "withdrawalDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Coach" ("category", "createdAt", "email", "id", "name", "phone", "tira", "updatedAt") SELECT "category", "createdAt", "email", "id", "name", "phone", "tira", "updatedAt" FROM "Coach";
DROP TABLE "Coach";
ALTER TABLE "new_Coach" RENAME TO "Coach";
CREATE UNIQUE INDEX "Coach_dni_key" ON "Coach"("dni");
CREATE TABLE "new_Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "birthDate" DATETIME NOT NULL,
    "tira" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVO',
    "scholarship" BOOLEAN NOT NULL DEFAULT false,
    "federated" BOOLEAN NOT NULL DEFAULT false,
    "playsPrimera" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT,
    "phone" TEXT,
    "partnerNumber" TEXT,
    "shirtNumber" INTEGER,
    "contactName" TEXT,
    "observations" TEXT,
    "category" TEXT,
    "registrationDate" DATETIME,
    "withdrawalDate" DATETIME,
    "siblings" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastSocialPayment" TEXT,
    "lastActivityPayment" TEXT
);
INSERT INTO "new_Player" ("birthDate", "category", "contactName", "createdAt", "dni", "email", "firstName", "id", "lastName", "observations", "partnerNumber", "phone", "playsPrimera", "registrationDate", "scholarship", "shirtNumber", "siblings", "tira", "updatedAt", "withdrawalDate") SELECT "birthDate", "category", "contactName", "createdAt", "dni", "email", "firstName", "id", "lastName", "observations", "partnerNumber", "phone", "playsPrimera", "registrationDate", "scholarship", "shirtNumber", "siblings", "tira", "updatedAt", "withdrawalDate" FROM "Player";
DROP TABLE "Player";
ALTER TABLE "new_Player" RENAME TO "Player";
CREATE UNIQUE INDEX "Player_dni_key" ON "Player"("dni");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
