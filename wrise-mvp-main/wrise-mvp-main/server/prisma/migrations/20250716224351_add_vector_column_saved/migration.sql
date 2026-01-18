/*
  Warnings:

  - You are about to drop the column `embedding` on the `content_vectors` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "content_vectors_embedding_idx";

-- AlterTable
ALTER TABLE "content_vectors" DROP COLUMN "embedding";
