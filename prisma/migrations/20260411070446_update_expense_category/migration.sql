/*
  Warnings:

  - The values [ACCOMMODATION,FOOD,EQUIPMENT] on the enum `ExpenseCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ExpenseCategory_new" AS ENUM ('LOGISTICS', 'SIMAKSI', 'TRANSPORTATION', 'EQUIPMENT_RENTAL', 'OTHER');
ALTER TABLE "expense" ALTER COLUMN "category" TYPE "ExpenseCategory_new" USING ("category"::text::"ExpenseCategory_new");
ALTER TYPE "ExpenseCategory" RENAME TO "ExpenseCategory_old";
ALTER TYPE "ExpenseCategory_new" RENAME TO "ExpenseCategory";
DROP TYPE "public"."ExpenseCategory_old";
COMMIT;
