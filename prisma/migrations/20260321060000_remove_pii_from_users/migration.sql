-- Remove PII columns and tighten guest token storage.
--
-- 1. Drop email/name — these are duplicated from Supabase auth.users and never read back.
-- 2. Drop isGuest — redundant; a user is a guest iff guestTokenHash IS NOT NULL.
-- 3. Rename guestToken → guestTokenHash and backfill existing rows with SHA-256 hashes.
--    Existing guest sessions (cookie holds raw UUID) will not match the new hashes —
--    those guests simply get new ephemeral sessions on their next visit (acceptable for guests).

-- Drop PII columns
DROP INDEX IF EXISTS "users_email_key";
ALTER TABLE "users" DROP COLUMN IF EXISTS "email";
ALTER TABLE "users" DROP COLUMN IF EXISTS "name";

-- Drop redundant isGuest flag
ALTER TABLE "users" DROP COLUMN IF EXISTS "isGuest";

-- Rename guestToken → guestTokenHash and hash existing plaintext values in-place
DROP INDEX IF EXISTS "users_guestToken_key";
ALTER TABLE "users" RENAME COLUMN "guestToken" TO "guestTokenHash";
UPDATE "users" SET "guestTokenHash" = encode(sha256("guestTokenHash"::bytea), 'hex') WHERE "guestTokenHash" IS NOT NULL;
CREATE UNIQUE INDEX "users_guestTokenHash_key" ON "users"("guestTokenHash");
