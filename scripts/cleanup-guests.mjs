import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

function parseArgs(argv) {
  const options = {
    dryRun: true,
    days: 60,
  };

  for (const arg of argv) {
    if (arg === "--apply") {
      options.dryRun = false;
      continue;
    }

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg.startsWith("--days=")) {
      const value = Number.parseInt(arg.slice("--days=".length), 10);
      if (!Number.isNaN(value) && value > 0) {
        options.days = value;
      }
    }
  }

  return options;
}

async function main() {
  const { dryRun, days } = parseArgs(process.argv.slice(2));
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const where = {
    guestTokenHash: { not: null },
    updatedAt: { lt: cutoff },
  };

  const targetCount = await prisma.user.count({ where });

  console.log(
    `[cleanup-guests] mode=${dryRun ? "dry-run" : "apply"} days=${days} cutoff=${cutoff.toISOString()} targetUsers=${targetCount}`,
  );

  if (targetCount === 0) {
    console.log("[cleanup-guests] No expired guest users found.");
    return;
  }

  if (dryRun) {
    console.log("[cleanup-guests] Dry run only. Re-run with --apply to delete expired guest users.");
    return;
  }

  const result = await prisma.user.deleteMany({ where });
  console.log(`[cleanup-guests] Deleted ${result.count} guest users.`);
}

main()
  .catch((error) => {
    console.error("[cleanup-guests] Failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
