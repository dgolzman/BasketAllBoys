/*
  Warnings:

  - You are about to drop the column `category` on the `Player` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "birthDate" DATETIME NOT NULL,
    "tira" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "scholarship" BOOLEAN NOT NULL DEFAULT false,
    "playsPrimera" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT,
    "phone" TEXT,
    "partnerNumber" TEXT,
    "shirtNumber" INTEGER,
    "contactName" TEXT,
    "observations" TEXT,
    "registrationDate" DATETIME,
    "withdrawalDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Player" ("active", "birthDate", "contactName", "createdAt", "dni", "email", "firstName", "id", "lastName", "observations", "partnerNumber", "phone", "registrationDate", "scholarship", "shirtNumber", "tira", "updatedAt", "withdrawalDate") SELECT "active", "birthDate", "contactName", "createdAt", "dni", "email", "firstName", "id", "lastName", "observations", "partnerNumber", "phone", "registrationDate", "scholarship", "shirtNumber", "tira", "updatedAt", "withdrawalDate" FROM "Player";
DROP TABLE "Player";
ALTER TABLE "new_Player" RENAME TO "Player";
CREATE UNIQUE INDEX "Player_dni_key" ON "Player"("dni");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
