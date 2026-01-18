-- CreateTable
CREATE TABLE "FanAccess" (
    "id" UUID NOT NULL,
    "fanId" UUID NOT NULL,
    "creatorId" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "accessType" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "checkoutSessionId" TEXT,
    "paymentIntentId" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FanAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FanAccess_checkoutSessionId_key" ON "FanAccess"("checkoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "FanAccess_fanId_creatorId_key" ON "FanAccess"("fanId", "creatorId");
