/*
  Warnings:

  - You are about to drop the `ForgotPassword` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ForgotPassword" DROP CONSTRAINT "ForgotPassword_userId_fkey";

-- DropTable
DROP TABLE "public"."ForgotPassword";

-- CreateTable
CREATE TABLE "forgot_password" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forgot_password_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "forgot_password" ADD CONSTRAINT "forgot_password_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
