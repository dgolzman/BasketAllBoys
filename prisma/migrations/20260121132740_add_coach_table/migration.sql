/*
  Warnings:

  - You are about to drop the `_PlayerSiblings` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Player" ADD COLUMN "category" TEXT;
ALTER TABLE "Player" ADD COLUMN "siblings" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_PlayerSiblings";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "CategoryMapping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "minYear" INTEGER NOT NULL,
    "maxYear" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Coach" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "tira" TEXT,
    "category" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DismissedAuditIssue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ruleId" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoryMapping_category_key" ON "CategoryMapping"("category");

-- CreateIndex
CREATE UNIQUE INDEX "DismissedAuditIssue_ruleId_identifier_key" ON "DismissedAuditIssue"("ruleId", "identifier");
