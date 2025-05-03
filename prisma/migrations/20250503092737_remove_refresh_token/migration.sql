/*
  Warnings:

  - You are about to drop the column `refreshToken` on the `Reference` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Reference_refreshToken_key";

-- AlterTable
ALTER TABLE "Reference" DROP COLUMN "refreshToken";
