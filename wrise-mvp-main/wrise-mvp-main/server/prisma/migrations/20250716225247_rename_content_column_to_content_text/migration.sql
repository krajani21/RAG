/*
  Warnings:

  - Added the required column `contentText` to the `content_vectors` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "content_vectors_creatorId_idx";

-- AlterTable
ALTER TABLE "content_vectors" ADD COLUMN     "contentText" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "content_vectors_creatorId_contentId_idx" ON "content_vectors"("creatorId", "contentId");
