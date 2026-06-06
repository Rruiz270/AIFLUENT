import { describe, it, expect, vi, beforeEach } from "vitest";

// Capture whether the cron actually touched the database.
const findManyMock = vi.fn().mockResolvedValue([]);
vi.mock("@/lib/prisma", () => ({
  prisma: { organization: { findMany: findManyMock } },
}));

import { GET } from "../automation/cron/route";

function req(headers: Record<string, string> = {}) {
  return {
    headers: { get: (k: string) => headers[k.toLowerCase()] ?? null },
  } as unknown as Parameters<typeof GET>[0];
}

describe("Cron auth — fail closed (Audit #3)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when CRON_SECRET is not configured (never runs unauthenticated)", async () => {
    const orig = process.env.CRON_SECRET;
    delete process.env.CRON_SECRET;

    const res = await GET(req());
    expect(res.status).toBe(401);
    expect(findManyMock).not.toHaveBeenCalled();

    process.env.CRON_SECRET = orig;
  });

  it("returns 401 when the authorization header does not match", async () => {
    const orig = process.env.CRON_SECRET;
    process.env.CRON_SECRET = "super-secret";

    const res = await GET(req({ authorization: "Bearer wrong" }));
    expect(res.status).toBe(401);
    expect(findManyMock).not.toHaveBeenCalled();

    process.env.CRON_SECRET = orig;
  });

  it("runs when CRON_SECRET is configured and the header matches", async () => {
    const orig = process.env.CRON_SECRET;
    process.env.CRON_SECRET = "super-secret";

    const res = await GET(req({ authorization: "Bearer super-secret" }));
    expect(res.status).toBe(200);
    expect(findManyMock).toHaveBeenCalled();

    process.env.CRON_SECRET = orig;
  });
});
