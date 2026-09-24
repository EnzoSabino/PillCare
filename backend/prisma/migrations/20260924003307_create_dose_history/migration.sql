/*
  Warnings:

  - You are about to drop the column `isGeneric` on the `Medication` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturer` on the `Medication` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Medication` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Medication` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "DoseHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "takenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "medicationId" TEXT NOT NULL,
    CONSTRAINT "DoseHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DoseHistory_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Medication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "quantityInStock" INTEGER NOT NULL,
    "refillThreshold" INTEGER NOT NULL DEFAULT 5,
    "frequencyHours" INTEGER NOT NULL DEFAULT 8,
    "nextDoseAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Medication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Medication" ("createdAt", "dosage", "frequencyHours", "id", "name", "nextDoseAt", "quantityInStock", "refillThreshold", "userId") SELECT "createdAt", "dosage", "frequencyHours", "id", "name", "nextDoseAt", "quantityInStock", "refillThreshold", "userId" FROM "Medication";
DROP TABLE "Medication";
ALTER TABLE "new_Medication" RENAME TO "Medication";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "password") SELECT "createdAt", "email", "id", "name", "password" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
