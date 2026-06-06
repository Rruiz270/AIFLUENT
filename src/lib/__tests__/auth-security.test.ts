import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const AUTH_SRC = join(process.cwd(), "src/lib/auth.ts");

// Mock the Prisma client so authorizeCredentials exercises the DB-only path
// without a real database. count()=1 skips the first-login seed; findUnique
// returns null so no user matches.
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      count: vi.fn().mockResolvedValue(1),
      findUnique: vi.fn().mockResolvedValue(null),
      update: vi.fn(),
      create: vi.fn(),
    },
    organization: { findFirst: vi.fn(), create: vi.fn() },
  },
}));

import { authorizeCredentials, resolveAuthSecret } from "../auth";

describe("Auth security — no hardcoded backdoor (Audit #1)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects the former demo admin backdoor (admin@aifluent.com / Admin@2026)", async () => {
    const result = await authorizeCredentials({
      email: "admin@aifluent.com",
      password: "Admin@2026",
    });
    expect(result).toBeNull();
  });

  it("rejects the former demo gestor/operador backdoors", async () => {
    expect(
      await authorizeCredentials({
        email: "gestor@aifluent.com",
        password: "Gestor@2026",
      }),
    ).toBeNull();
    expect(
      await authorizeCredentials({
        email: "operador@aifluent.com",
        password: "Operador@2026",
      }),
    ).toBeNull();
  });

  it("source no longer contains any hardcoded demo credentials", () => {
    const src = readFileSync(AUTH_SRC, "utf8");
    expect(src).not.toMatch(/Admin@2026|Gestor@2026|Operador@2026/);
    expect(src).not.toMatch(/demo-admin|demo-gestor|demo-operador/);
  });
});

describe("Auth security — AUTH_SECRET required (Audit #2)", () => {
  it("throws when AUTH_SECRET is missing", () => {
    const orig = process.env.AUTH_SECRET;
    delete process.env.AUTH_SECRET;
    expect(() => resolveAuthSecret()).toThrow();
    process.env.AUTH_SECRET = orig;
  });

  it("throws when AUTH_SECRET is too short (weak)", () => {
    const orig = process.env.AUTH_SECRET;
    process.env.AUTH_SECRET = "short";
    expect(() => resolveAuthSecret()).toThrow();
    process.env.AUTH_SECRET = orig;
  });

  it("returns the secret when AUTH_SECRET is set and strong", () => {
    const orig = process.env.AUTH_SECRET;
    process.env.AUTH_SECRET = "a-sufficiently-long-secret-value-123";
    expect(resolveAuthSecret()).toBe("a-sufficiently-long-secret-value-123");
    process.env.AUTH_SECRET = orig;
  });

  it("source no longer derives a key from a constant fallback string", () => {
    const src = readFileSync(AUTH_SRC, "utf8");
    expect(src).not.toMatch(/aifluent-crm-2026/);
  });
});
