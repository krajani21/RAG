/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "FanAccess" ADD COLUMN     "subscriptionLink" TEXT;

-- DropTable
DROP TABLE "User";

-- AddForeignKey
ALTER TABLE "FanAccess" ADD CONSTRAINT "FanAccess_fanId_fkey" FOREIGN KEY ("fanId") REFERENCES "authUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FanAccess" ADD CONSTRAINT "FanAccess_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "authUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
