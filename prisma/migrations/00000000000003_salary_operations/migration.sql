-- CreateEnum
CREATE TYPE "InstructorSalaryItemStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAID');

-- AlterTable
ALTER TABLE "InstructorSalaryItem" ADD COLUMN     "attendancePercent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "attendedSeconds" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "scheduledSeconds" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" "InstructorSalaryItemStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "InstructorSalaryItem_status_idx" ON "InstructorSalaryItem"("status");

-- CreateIndex
CREATE INDEX "InstructorSalaryItem_payoutId_idx" ON "InstructorSalaryItem"("payoutId");

