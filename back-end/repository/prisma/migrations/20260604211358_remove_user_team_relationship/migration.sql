/*
  Warnings:

  - The values [COACH] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `Goal` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `teamId` on the `Goal` table. All the data in the column will be lost.
  - The `id` column on the `Goal` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Match` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `awayTeamId` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `homeTeamId` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `refereeId` on the `Match` table. All the data in the column will be lost.
  - The `id` column on the `Match` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Player` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `teamId` on the `Player` table. All the data in the column will be lost.
  - The `id` column on the `Player` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Team` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Team` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `teamId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[teamName,shirtNumber]` on the table `Player` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `teamName` to the `Goal` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `matchId` on the `Goal` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `playerId` on the `Goal` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `teamName` to the `Player` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'REFEREE', 'USER', 'GUEST');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- DropForeignKey
ALTER TABLE "Goal" DROP CONSTRAINT "Goal_matchId_fkey";

-- DropForeignKey
ALTER TABLE "Goal" DROP CONSTRAINT "Goal_playerId_fkey";

-- DropForeignKey
ALTER TABLE "Goal" DROP CONSTRAINT "Goal_teamId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_awayTeamId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_homeTeamId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_refereeId_fkey";

-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_teamId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_teamId_fkey";

-- DropIndex
DROP INDEX "Goal_teamId_idx";

-- DropIndex
DROP INDEX "Match_awayTeamId_idx";

-- DropIndex
DROP INDEX "Match_homeTeamId_idx";

-- DropIndex
DROP INDEX "Match_refereeId_idx";

-- DropIndex
DROP INDEX "Player_teamId_idx";

-- DropIndex
DROP INDEX "Player_teamId_shirtNumber_key";

-- DropIndex
DROP INDEX "Team_name_key";

-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "Goal" DROP CONSTRAINT "Goal_pkey",
DROP COLUMN "teamId",
ADD COLUMN     "teamName" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "matchId",
ADD COLUMN     "matchId" INTEGER NOT NULL,
DROP COLUMN "playerId",
ADD COLUMN     "playerId" INTEGER NOT NULL,
ADD CONSTRAINT "Goal_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Match" DROP CONSTRAINT "Match_pkey",
DROP COLUMN "awayTeamId",
DROP COLUMN "homeTeamId",
DROP COLUMN "refereeId",
ADD COLUMN     "awayTeamName" TEXT,
ADD COLUMN     "homeTeamName" TEXT,
ADD COLUMN     "refereeUsername" TEXT,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Match_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Player" DROP CONSTRAINT "Player_pkey",
DROP COLUMN "teamId",
ADD COLUMN     "teamName" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Player_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Team" DROP CONSTRAINT "Team_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Team_pkey" PRIMARY KEY ("name");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
DROP COLUMN "teamId",
ALTER COLUMN "role" SET DEFAULT 'USER',
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("username");

-- CreateIndex
CREATE INDEX "Goal_matchId_idx" ON "Goal"("matchId");

-- CreateIndex
CREATE INDEX "Goal_playerId_idx" ON "Goal"("playerId");

-- CreateIndex
CREATE INDEX "Goal_teamName_idx" ON "Goal"("teamName");

-- CreateIndex
CREATE INDEX "Match_refereeUsername_idx" ON "Match"("refereeUsername");

-- CreateIndex
CREATE INDEX "Match_homeTeamName_idx" ON "Match"("homeTeamName");

-- CreateIndex
CREATE INDEX "Match_awayTeamName_idx" ON "Match"("awayTeamName");

-- CreateIndex
CREATE INDEX "Player_teamName_idx" ON "Player"("teamName");

-- CreateIndex
CREATE UNIQUE INDEX "Player_teamName_shirtNumber_key" ON "Player"("teamName", "shirtNumber");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_homeTeamName_fkey" FOREIGN KEY ("homeTeamName") REFERENCES "Team"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_awayTeamName_fkey" FOREIGN KEY ("awayTeamName") REFERENCES "Team"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_refereeUsername_fkey" FOREIGN KEY ("refereeUsername") REFERENCES "User"("username") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_teamName_fkey" FOREIGN KEY ("teamName") REFERENCES "Team"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_teamName_fkey" FOREIGN KEY ("teamName") REFERENCES "Team"("name") ON DELETE CASCADE ON UPDATE CASCADE;
