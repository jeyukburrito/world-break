-- Cleanup migration: fix partial-apply state from 20260322180000_migrate_cs_to_shop
-- Handles all possible states:
--   1. Both old migration fully applied (EventCategory has friendly+shop, no _old type)
--   2. Partial apply: EventCategory renamed to _old, new EventCategory may or may not exist
--   3. Columns may be typed as EventCategory or EventCategory_old

-- Step 1: Ensure no defaults reference the old type
ALTER TABLE "match_results" ALTER COLUMN "eventCategory" DROP DEFAULT;
ALTER TABLE "tournament_sessions" ALTER COLUMN "eventCategory" DROP DEFAULT;

-- Step 2: If columns are still typed as EventCategory_old, cast them through text
DO $$ BEGIN
  -- Check if match_results.eventCategory uses EventCategory_old
  IF EXISTS (
    SELECT 1 FROM information_schema.columns c
    JOIN pg_type t ON c.udt_name = t.typname
    WHERE c.table_name = 'match_results'
      AND c.column_name = 'eventCategory'
      AND c.udt_name = 'EventCategory_old'
  ) THEN
    -- Need to ensure new EventCategory type exists first
    IF NOT EXISTS (
      SELECT 1 FROM pg_type WHERE typname = 'EventCategory'
    ) THEN
      CREATE TYPE "EventCategory" AS ENUM ('friendly', 'shop');
    END IF;

    ALTER TABLE "match_results"
      ALTER COLUMN "eventCategory" TYPE "EventCategory"
      USING ("eventCategory"::text::"EventCategory");
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns c
    JOIN pg_type t ON c.udt_name = t.typname
    WHERE c.table_name = 'tournament_sessions'
      AND c.column_name = 'eventCategory'
      AND c.udt_name = 'EventCategory_old'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_type WHERE typname = 'EventCategory'
    ) THEN
      CREATE TYPE "EventCategory" AS ENUM ('friendly', 'shop');
    END IF;

    ALTER TABLE "tournament_sessions"
      ALTER COLUMN "eventCategory" TYPE "EventCategory"
      USING ("eventCategory"::text::"EventCategory");
  END IF;
END $$;

-- Step 3: Ensure EventCategory enum has correct values (friendly, shop — no cs)
-- If the type exists but still has 'cs', we need to recreate it
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'EventCategory' AND e.enumlabel = 'cs'
  ) THEN
    -- cs still exists in the enum — need full recreation
    ALTER TABLE "match_results" ALTER COLUMN "eventCategory" TYPE text USING "eventCategory"::text;
    ALTER TABLE "tournament_sessions" ALTER COLUMN "eventCategory" TYPE text USING "eventCategory"::text;
    DROP TYPE "EventCategory";
    CREATE TYPE "EventCategory" AS ENUM ('friendly', 'shop');
    ALTER TABLE "match_results" ALTER COLUMN "eventCategory" TYPE "EventCategory" USING "eventCategory"::"EventCategory";
    ALTER TABLE "tournament_sessions" ALTER COLUMN "eventCategory" TYPE "EventCategory" USING "eventCategory"::"EventCategory";
  END IF;
END $$;

-- Step 4: Migrate any remaining cs values (should be done already, but be safe)
UPDATE "match_results" SET "eventCategory" = 'shop'::"EventCategory" WHERE "eventCategory"::text = 'cs';
UPDATE "tournament_sessions" SET "eventCategory" = 'shop'::"EventCategory" WHERE "eventCategory"::text = 'cs';

-- Step 5: Re-add default on match_results
ALTER TABLE "match_results" ALTER COLUMN "eventCategory" SET DEFAULT 'friendly'::"EventCategory";

-- Step 6: Drop old type if it still exists
DROP TYPE IF EXISTS "EventCategory_old";
