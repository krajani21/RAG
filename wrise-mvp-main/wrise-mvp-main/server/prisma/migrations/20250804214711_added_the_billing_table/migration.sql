-- CreateTable
CREATE TABLE "CreatorBilling" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "stripeCustomerId" TEXT,
    "hasPaid" BOOLEAN NOT NULL DEFAULT false,
    "plan" TEXT,
    "tier" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatorBilling_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreatorBilling_userId_key" ON "CreatorBilling"("userId");

-- AddForeignKey
ALTER TABLE "CreatorBilling" ADD CONSTRAINT "CreatorBilling_userId_fkey" FOREIGN KEY ("userId") REFERENCES "authUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
