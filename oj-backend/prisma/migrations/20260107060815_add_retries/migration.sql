-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastStartedAt" TIMESTAMP(3);
