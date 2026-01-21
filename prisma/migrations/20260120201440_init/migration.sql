/*
  Warnings:

  - You are about to drop the column `name` on the `Player` table. All the data in the column will be lost.
  - You are about to drop the column `siblings` on the `Player` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `Player` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Player` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "_PlayerSiblings" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PlayerSiblings_A_fkey" FOREIGN KEY ("A") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PlayerSiblings_B_fkey" FOREIGN KEY ("B") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "birthDate" DATETIME NOT NULL,
    "category" TEXT,
    "tira" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "scholarship" BOOLEAN NOT NULL DEFAULT false,
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
INSERT INTO "new_Player" ("active", "birthDate", "category", "contactName", "createdAt", "dni", "email", "id", "observations", "partnerNumber", "phone", "registrationDate", "scholarship", "shirtNumber", "tira", "updatedAt", "withdrawalDate") SELECT "active", "birthDate", "category", "contactName", "createdAt", "dni", "email", "id", "observations", "partnerNumber", "phone", "registrationDate", "scholarship", "shirtNumber", "tira", "updatedAt", "withdrawalDate" FROM "Player";
DROP TABLE "Player";
ALTER TABLE "new_Player" RENAME TO "Player";
CREATE UNIQUE INDEX "Player_dni_key" ON "Player"("dni");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_PlayerSiblings_AB_unique" ON "_PlayerSiblings"("A", "B");

-- CreateIndex
CREATE INDEX "_PlayerSiblings_B_index" ON "_PlayerSiblings"("B");
