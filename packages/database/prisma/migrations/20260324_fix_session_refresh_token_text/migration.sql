-- AlterTable: increase refresh_token column to TEXT to support RS256 JWT tokens (~580+ chars)
ALTER TABLE "sessions" ALTER COLUMN "refresh_token" TYPE TEXT;
