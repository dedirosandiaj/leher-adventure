-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('LOGISTICS', 'SIMAKSI', 'TRANSPORTATION', 'ACCOMMODATION', 'FOOD', 'EQUIPMENT', 'OTHER');

-- CreateTable
CREATE TABLE "expense" (
    "id" UUID NOT NULL,
    "journeyId" UUID,
    "category" "ExpenseCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "expense_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE SET NULL ON UPDATE CASCADE;
