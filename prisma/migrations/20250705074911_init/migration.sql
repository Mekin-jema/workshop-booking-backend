/*
  Warnings:

  - The `status` column on the `Booking` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `isActive` on the `TimeSlot` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `isActive` on the `Workshop` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "TimeSlot" DROP COLUMN "isActive",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "startTime" SET DATA TYPE TEXT,
ALTER COLUMN "endTime" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'CUSTOMER';

-- AlterTable
ALTER TABLE "Workshop" DROP COLUMN "isActive",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- DropEnum
DROP TYPE "BookingStatus";

-- DropEnum
DROP TYPE "Role";
