/*
  Warnings:

  - You are about to drop the column `memberId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_memberId_fkey";

-- DropIndex
DROP INDEX "User_memberId_key";

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "password" TEXT NOT NULL DEFAULT 'customer123';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "memberId";

-- CreateTable
CREATE TABLE "Trainer" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL DEFAULT 'trainer123',
    "phone" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Trainer',
    "salary" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "joinDate" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "branchId" TEXT NOT NULL,

    CONSTRAINT "Trainer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trainer_email_key" ON "Trainer"("email");

-- AddForeignKey
ALTER TABLE "Trainer" ADD CONSTRAINT "Trainer_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
