import { NextRequest, NextResponse } from "next/server";
import { requireAuth, checkRateLimit, requireOrgId } from "@/lib/api-auth";
import { apiLimiter } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

// Lista as tags REAIS da empresa, com a contagem de leads de cada uma.
export async function GET(request: NextRequest) {
  const rl = checkRateLimit(request, apiLimiter);
  if (rl) return rl;
  const { error, session } = await requireAuth();
  if (error) return error;
  const { orgId, error: orgError } = requireOrgId(session);
  if (orgError) return orgError;

  try {
    const { prisma } = await import("@/lib/prisma");
    const tags = await prisma.tag.findMany({
      where: { organizationId: orgId },
      select: { name: true, _count: { select: { leads: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({
      tags: tags.map((t) => ({ name: t.name, count: t._count.leads })),
    });
  } catch (err) {
    logger.error("GET /api/tags error", err);
    return NextResponse.json({ tags: [] }, { status: 500 });
  }
}
