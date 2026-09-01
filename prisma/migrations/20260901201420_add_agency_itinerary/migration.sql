-- CreateTable
CREATE TABLE "AgencyItinerary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quotationNumber" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "tripTitle" TEXT NOT NULL,
    "destinations" TEXT[],
    "prompt" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgencyItinerary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgencyItinerary_quotationNumber_key" ON "AgencyItinerary"("quotationNumber");

-- CreateIndex
CREATE INDEX "AgencyItinerary_userId_createdAt_idx" ON "AgencyItinerary"("userId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "AgencyItinerary" ADD CONSTRAINT "AgencyItinerary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
