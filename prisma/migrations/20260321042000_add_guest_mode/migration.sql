ALTER TABLE "users"
ADD COLUMN "isGuest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "guestToken" TEXT;

CREATE UNIQUE INDEX "users_guestToken_key" ON "users"("guestToken");
