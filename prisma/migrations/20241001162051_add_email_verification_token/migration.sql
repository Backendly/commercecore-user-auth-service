-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_verification_token" VARCHAR,
ADD COLUMN     "email_verified" BOOLEAN DEFAULT false;
