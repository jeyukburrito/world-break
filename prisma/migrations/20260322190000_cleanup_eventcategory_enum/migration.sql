-- Cleanup migration: finish removing `cs` from EventCategory.
-- This migration is intentionally resilient to both states below:
--   1. `20260322180000_migrate_cs_to_shop` was marked applied but never executed.
--   2. `20260322180000_migrate_cs_to_shop` partially ran and left EventCategory_old behind.

-- Step 1: remove defaults / constraints that still reference the old enum shape.
ALTER TABLE "match_results" ALTER COLUMN "eventCategory" DROP DEFAULT;
ALTER TABLE "tournament_sessions" ALTER COLUMN "eventCategory" DROP DEFAULT;
ALTER TABLE "match_results" DROP CONSTRAINT IF EXISTS "chk_tournament_phase_category";

-- Step 2: normalize any remaining cs data before recreating the enum.
UPDATE "match_results"
SET "eventCategory" = 'shop'
WHERE "eventCategory"::text = 'cs';

UPDATE "tournament_sessions"
SET "eventCategory" = 'shop'
WHERE "eventCategory"::text = 'cs';

-- Step 3: ensure both columns point at an enum that only contains friendly/shop.
DO $$
DECLARE
  match_type text;
  tournament_type text;
  current_eventcategory_has_cs boolean;
BEGIN
  SELECT c.udt_name
  INTO match_type
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'match_results'
    AND c.column_name = 'eventCategory';

  SELECT c.udt_name
  INTO tournament_type
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'tournament_sessions'
    AND c.column_name = 'eventCategory';

  SELECT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'EventCategory'
      AND e.enumlabel = 'cs'
  )
  INTO current_eventcategory_has_cs;

  IF match_type = 'EventCategory_old' OR tournament_type = 'EventCategory_old' THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_type
      WHERE typname = 'EventCategory'
    ) THEN
      CREATE TYPE "EventCategory" AS ENUM ('friendly', 'shop');
    END IF;

    IF match_type = 'EventCategory_old' THEN
      ALTER TABLE "match_results"
        ALTER COLUMN "eventCategory" TYPE "EventCategory"
        USING ("eventCategory"::text::"EventCategory");
    END IF;

    IF tournament_type = 'EventCategory_old' THEN
      ALTER TABLE "tournament_sessions"
        ALTER COLUMN "eventCategory" TYPE "EventCategory"
        USING ("eventCategory"::text::"EventCategory");
    END IF;
  ELSIF current_eventcategory_has_cs THEN
    ALTER TYPE "EventCategory" RENAME TO "EventCategory_old";
    CREATE TYPE "EventCategory" AS ENUM ('friendly', 'shop');

    ALTER TABLE "match_results"
      ALTER COLUMN "eventCategory" TYPE "EventCategory"
      USING ("eventCategory"::text::"EventCategory");

    ALTER TABLE "tournament_sessions"
      ALTER COLUMN "eventCategory" TYPE "EventCategory"
      USING ("eventCategory"::text::"EventCategory");
  END IF;
END $$;

-- Step 4: restore the intended schema contract.
ALTER TABLE "match_results"
  ALTER COLUMN "eventCategory" SET DEFAULT 'friendly'::"EventCategory";

ALTER TABLE "match_results"
  ADD CONSTRAINT "chk_tournament_phase_category" CHECK (
    ("eventCategory" = 'shop' AND "tournamentPhase" IS NOT NULL)
    OR ("eventCategory" = 'friendly' AND "tournamentPhase" IS NULL)
  );

-- Step 5: clean up any leftover legacy enum type.
DROP TYPE IF EXISTS "EventCategory_old";
