-- AlterTable
ALTER TABLE "developers" ADD COLUMN     "email_verification_token" VARCHAR,
ADD COLUMN     "password_reset_token" VARCHAR,
ADD COLUMN     "reset_token_expires_at" TIMESTAMP(6),
ADD COLUMN     "token_expires_at" TIMESTAMP(6);
