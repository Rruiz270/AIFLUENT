import { NextRequest, NextResponse } from "next/server";
import { requireAuth, checkRateLimit, requireOrgId } from "@/lib/api-auth";
import { apiLimiter } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import {
  buildAudienceWhere,
  type BroadcastSegment,
} from "@/lib/broadcast-segment";

export const runtime = "nodejs";
export const maxDuration = 60;

// Conta quantos leads atendem à segmentação (preview da distribuição).
export async function POST(request: NextRequest) {
  const rl = checkRateLimit(request, apiLimiter);
  if (rl) return rl;
  const { error, session } = await requireAuth("gestor");
  if (error) return error;
  const { orgId, error: orgError } = requireOrgId(session);
  if (orgError) return orgError;

  try {
    const body = await request.json();
    const segment = (body.segment as BroadcastSegment) || {};
    const consultantId = (body.consultantId as string) || null;
    const teamId = (body.teamId as string) || null;
    const preview = body.preview === true;

    const { prisma } = await import("@/lib/prisma");
    const where = buildAudienceWhere(orgId, segment, {
      requireWhatsapp: false,
    });

    if (preview) {
      const count = await prisma.lead.count({ where });
      return NextResponse.json({ count });
    }

    if (!consultantId && !teamId) {
      return NextResponse.json(
        { error: "Escolha um consultor e/ou um time" },
        { status: 400 },
      );
    }
    // valida que o consultor/time são da empresa
    if (consultantId) {
      const u = await prisma.user.findUnique({
        where: { id: consultantId },
        select: { organizationId: true, teamId: true },
      });
      if (!u || u.organizationId !== orgId)
        return NextResponse.json(
          { error: "Consultor inválido" },
          { status: 400 },
        );
    }
    if (teamId) {
      const t = await prisma.team.findUnique({
        where: { id: teamId },
        select: { organizationId: true },
      });
      if (!t || t.organizationId !== orgId)
        return NextResponse.json({ error: "Time inválido" }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (consultantId) data.consultantId = consultantId;
    if (teamId) data.teamId = teamId;

    const res = await prisma.lead.updateMany({ where, data });
    logger.info("leads_assigned", {
      orgId,
      count: res.count,
      consultantId,
      teamId,
    });
    return NextResponse.json({ assigned: res.count });
  } catch (err) {
    logger.error("POST /api/leads/assign error", err);
    return NextResponse.json({ error: "Falha ao distribuir" }, { status: 500 });
  }
}
