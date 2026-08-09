-- CreateEnum
CREATE TYPE "CertificateStatus" AS ENUM ('ISSUED', 'REVOKED');

-- CreateEnum
CREATE TYPE "AnnouncementAudience" AS ENUM ('ALL', 'STUDENTS', 'INSTRUCTORS', 'COURSE');

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN "required" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN "eligibleSnapshot" JSONB,
ADD COLUMN "issuedById" TEXT,
ADD COLUMN "revocationReason" TEXT,
ADD COLUMN "revokedAt" TIMESTAMP(3),
ADD COLUMN "revokedById" TEXT,
ADD COLUMN "status" "CertificateStatus" NOT NULL DEFAULT 'ISSUED';

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "deletedById" TEXT,
ADD COLUMN "moderationReason" TEXT;

-- AlterTable
ALTER TABLE "ChatRoom" ADD COLUMN "title" TEXT,
ALTER COLUMN "type" SET DEFAULT 'COURSE';

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN "announcementId" TEXT,
ADD COLUMN "linkUrl" TEXT,
ADD COLUMN "type" TEXT NOT NULL DEFAULT 'GENERAL';

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN "passingPercent" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN "required" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "authorId" TEXT,
    "courseId" TEXT,
    "audience" "AnnouncementAudience" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Assignment_courseId_required_idx" ON "Assignment"("courseId", "required");

-- CreateIndex
CREATE INDEX "Certificate_courseId_status_idx" ON "Certificate"("courseId", "status");

-- CreateIndex
CREATE INDEX "ChatMessage_senderId_createdAt_idx" ON "ChatMessage"("senderId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatMessage_deletedAt_idx" ON "ChatMessage"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChatRoom_courseId_type_key" ON "ChatRoom"("courseId", "type");

-- CreateIndex
CREATE INDEX "ChatRoom_type_idx" ON "ChatRoom"("type");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_announcementId_idx" ON "Notification"("announcementId");

-- CreateIndex
CREATE INDEX "Quiz_courseId_required_idx" ON "Quiz"("courseId", "required");

-- CreateIndex
CREATE INDEX "Announcement_audience_publishedAt_idx" ON "Announcement"("audience", "publishedAt");

-- CreateIndex
CREATE INDEX "Announcement_courseId_publishedAt_idx" ON "Announcement"("courseId", "publishedAt");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_revokedById_fkey" FOREIGN KEY ("revokedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
