-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('youtube', 'instagram', 'pdf', 'other');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('creator', 'fan');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "username" TEXT,
    "role" "Role" NOT NULL,
    "stripeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accessToken" TEXT,
    "displayName" TEXT,
    "googleId" TEXT,
    "imageUrl" TEXT,
    "refreshToken" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authUser" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isCreator" BOOLEAN NOT NULL,
    "avatarUrl" TEXT,
    "subscriberCount" INTEGER,
    "revenue" DOUBLE PRECISION,
    "accessToken" TEXT,

    CONSTRAINT "authUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Content" (
    "contentId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "sourceType" "SourceType" NOT NULL,
    "transcript" TEXT NOT NULL,
    "videoId" TEXT,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comment" TEXT,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("contentId")
);

-- CreateTable
CREATE TABLE "content_vectors" (
    "id" TEXT NOT NULL,
    "contentId" UUID NOT NULL,
    "creatorId" UUID NOT NULL,
    "metadata" JSONB,
    "sourceType" "SourceType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_vectors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapedVideo" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "thumbnail" TEXT,
    "publishedAt" TIMESTAMP(3),
    "transcript" TEXT,
    "comments" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScrapedVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstagramReel" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "reelUrl" TEXT NOT NULL,
    "transcript" TEXT,
    "comments" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InstagramReel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "authUser_email_key" ON "authUser"("email");

-- CreateIndex
CREATE INDEX "Content_userId_videoId_idx" ON "Content"("userId", "videoId");

-- CreateIndex
CREATE INDEX "content_vectors_creatorId_idx" ON "content_vectors"("creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "ScrapedVideo_videoUrl_key" ON "ScrapedVideo"("videoUrl");

-- CreateIndex
CREATE UNIQUE INDEX "InstagramReel_reelUrl_key" ON "InstagramReel"("reelUrl");

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_userId_fkey" FOREIGN KEY ("userId") REFERENCES "authUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_vectors" ADD CONSTRAINT "content_vectors_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("contentId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_vectors" ADD CONSTRAINT "content_vectors_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "authUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScrapedVideo" ADD CONSTRAINT "ScrapedVideo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "authUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstagramReel" ADD CONSTRAINT "InstagramReel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "authUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
