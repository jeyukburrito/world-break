import fs from "fs";
import path from "path";

import { afterEach, beforeEach, vi } from "vitest";

function loadSimpleEnvFile(filename: string) {
  const filePath = path.join(process.cwd(), filename);
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf-8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    if (!key || process.env[key]) {
      continue;
    }

    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

loadSimpleEnvFile(".env.local");
loadSimpleEnvFile(".env");

if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}

// Ensure DATABASE_URL is a standard postgres URL for tests
if (process.env.DATABASE_URL?.startsWith("prisma://") || process.env.DATABASE_URL?.startsWith("prisma+postgres://")) {
  console.warn("⚠️ Warning: DATABASE_URL is a Prisma Accelerate URL. Integration tests require a direct connection string (postgresql:// or postgres://).");
}

if (process.env.TEST_DIRECT_URL) {
  process.env.DIRECT_URL = process.env.TEST_DIRECT_URL;
}

export const redirectMock = vi.fn((location: string) => {
  throw new Error(`NEXT_REDIRECT:${location}`);
});

export const revalidatePathMock = vi.fn();
export const revalidateDashboardMock = vi.fn();
export const requireUserMock = vi.fn();
export const cookiesDeleteMock = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/lib/dashboard", () => ({
  revalidateDashboard: revalidateDashboardMock,
}));

vi.mock("@/lib/auth", () => ({
  requireUser: requireUserMock,
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    delete: cookiesDeleteMock,
  })),
}));

beforeEach(() => {
  redirectMock.mockClear();
  revalidatePathMock.mockClear();
  revalidateDashboardMock.mockClear();
  requireUserMock.mockReset();
  cookiesDeleteMock.mockClear();
});

afterEach(() => {
  vi.clearAllMocks();
});
