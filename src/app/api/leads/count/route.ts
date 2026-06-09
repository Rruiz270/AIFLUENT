import { NextRequest, NextResponse } from "next/server";
import { requireAuth, checkRateLimit, requireOrgId } from "@/lib/api-auth";
import { apiLimiter } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

// Conta REAL de leads que casam com os filtros/tags (para estimativa de audiência).
export async function GET(request: NextRequest) {
  const rl = checkRateLimit(request, apiLimiter);
  if (rl) return rl;
  const { error, session } = await requireAuth();
  if (error) return error;
  const { orgId, error: orgError } = requireOrgId(session);
  if (orgError) return orgError;

  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source");
    const temperature = searchParams.get("temperature");
    const status = searchParams.get("status");
    const tagsParam = searchParams.get("tags");
    const tags = tagsParam
      ? tagsParam
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { organizationId: orgId };
    if (source) where.source = source;
    if (temperature) where.temperature = temperature;
    if (status) where.status = status;
    if (tags.length) where.tags = { some: { tag: { name: { in: tags } } } };

    const { prisma } = await import("@/lib/prisma");
    const count = await prisma.lead.count({ where });
    return NextResponse.json({ count });
  } catch (err) {
    logger.error("GET /api/leads/count error", err);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
