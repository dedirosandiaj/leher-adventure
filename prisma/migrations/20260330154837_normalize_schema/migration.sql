/*
  Warnings:

  - The primary key for the `About` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `EquipmentItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `category` on the `EquipmentItem` table. All the data in the column will be lost.
  - The primary key for the `HeroText` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Mountain` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `status` on the `Mountain` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Mountain` table. All the data in the column will be lost.
  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Gallery` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HeroSlide` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Member` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `member_equipment` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `id` on the `About` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `categoryId` to the `EquipmentItem` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `EquipmentItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `HeroText` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Mountain` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "MediaSection" AS ENUM ('HERO', 'GALLERY');

-- CreateEnum
CREATE TYPE "JourneyStatus" AS ENUM ('PLANNED', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "member_equipment" DROP CONSTRAINT "member_equipment_item_id_fkey";

-- DropForeignKey
ALTER TABLE "member_equipment" DROP CONSTRAINT "member_equipment_member_id_fkey";

-- AlterTable
ALTER TABLE "About" DROP CONSTRAINT "About_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "About_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "EquipmentItem" DROP CONSTRAINT "EquipmentItem_pkey",
DROP COLUMN "category",
ADD COLUMN     "categoryId" UUID NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "EquipmentItem_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "HeroText" DROP CONSTRAINT "HeroText_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "HeroText_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Mountain" DROP CONSTRAINT "Mountain_pkey",
DROP COLUMN "status",
DROP COLUMN "year",
ADD COLUMN     "difficulty" TEXT,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "location" TEXT,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "Mountain_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "Admin";

-- DropTable
DROP TABLE "Gallery";

-- DropTable
DROP TABLE "HeroSlide";

-- DropTable
DROP TABLE "Member";

-- DropTable
DROP TABLE "TeamMember";

-- DropTable
DROP TABLE "member_equipment";

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "phone" TEXT,
    "photo" TEXT,
    "ig" TEXT,
    "isTeam" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" UUID NOT NULL,
    "title" TEXT,
    "url" TEXT NOT NULL,
    "type" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "section" "MediaSection" NOT NULL DEFAULT 'GALLERY',
    "order" INTEGER NOT NULL DEFAULT 0,
    "thumbnail" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Journey" (
    "id" UUID NOT NULL,
    "mountainId" UUID NOT NULL,
    "year" INTEGER NOT NULL DEFAULT 2024,
    "status" "JourneyStatus" NOT NULL DEFAULT 'PLANNED',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "description" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "Journey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentCategory" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "EquipmentCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_equipment" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "itemId" UUID NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "user_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentCategory_name_key" ON "EquipmentCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_equipment_userId_itemId_key" ON "user_equipment"("userId", "itemId");

-- AddForeignKey
ALTER TABLE "Journey" ADD CONSTRAINT "Journey_mountainId_fkey" FOREIGN KEY ("mountainId") REFERENCES "Mountain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentItem" ADD CONSTRAINT "EquipmentItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "EquipmentCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_equipment" ADD CONSTRAINT "user_equipment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_equipment" ADD CONSTRAINT "user_equipment_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "EquipmentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
