-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "birthDate" DATETIME,
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
    "lastActivityPayment" TEXT,
    "federationYear" INTEGER,
    "federationInstallments" TEXT
);
INSERT INTO "new_Player" ("birthDate", "category", "contactName", "createdAt", "dni", "email", "federated", "federationInstallments", "federationYear", "firstName", "id", "lastActivityPayment", "lastName", "lastSocialPayment", "observations", "partnerNumber", "phone", "playsPrimera", "registrationDate", "scholarship", "shirtNumber", "siblings", "status", "tira", "updatedAt", "withdrawalDate") SELECT "birthDate", "category", "contactName", "createdAt", "dni", "email", "federated", "federationInstallments", "federationYear", "firstName", "id", "lastActivityPayment", "lastName", "lastSocialPayment", "observations", "partnerNumber", "phone", "playsPrimera", "registrationDate", "scholarship", "shirtNumber", "siblings", "status", "tira", "updatedAt", "withdrawalDate" FROM "Player";
DROP TABLE "Player";
ALTER TABLE "new_Player" RENAME TO "Player";
CREATE UNIQUE INDEX "Player_dni_key" ON "Player"("dni");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
