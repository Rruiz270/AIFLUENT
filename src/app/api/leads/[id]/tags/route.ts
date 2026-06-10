import { NextRequest, NextResponse } from "next/server";
import { requireAuth, checkRateLimit, requireOrgId } from "@/lib/api-auth";
import { apiLimiter } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

async function assertLead(prisma: unknown, id: string, orgId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lead = await (prisma as any).lead.findUnique({
    where: { id },
    select: { id: true, organizationId: true },
  });
  return lead && lead.organizationId === orgId ? lead : null;
}

// Adiciona uma tag (por nome) ao lead — cria a tag na org se não existir.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const rl = checkRateLimit(request, apiLimiter);
  if (rl) return rl;
  const { error, session } = await requireAuth();
  if (error) return error;
  const { orgId, error: orgError } = requireOrgId(session);
  if (orgError) return orgError;
  const { id } = await params;

  try {
    const body = await request.json();
    const name = (body.name as string)?.trim();
    if (!name)
      return NextResponse.json({ error: "Informe a tag" }, { status: 400 });

    const { prisma } = await import("@/lib/prisma");
    if (!(await assertLead(prisma, id, orgId)))
      return NextResponse.json(
        { error: "Lead não encontrado" },
        { status: 404 },
      );

    let tag = await prisma.tag.findFirst({
      where: {
        organizationId: orgId,
        name: { equals: name, mode: "insensitive" },
      },
      select: { id: true },
    });
    if (!tag) {
      tag = await prisma.tag.create({
        data: { name, organizationId: orgId },
        select: { id: true },
      });
    }
    await prisma.leadTag.upsert({
      where: { leadId_tagId: { leadId: id, tagId: tag.id } },
      create: { leadId: id, tagId: tag.id },
      update: {},
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("POST /api/leads/[id]/tags error", err);
    return NextResponse.json(
      { error: "Falha ao adicionar tag" },
      { status: 500 },
    );
  }
}

// Remove uma tag do lead (por tagId).
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error, session } = await requireAuth();
  if (error) return error;
  const { orgId, error: orgError } = requireOrgId(session);
  if (orgError) return orgError;
  const { id } = await params;

  try {
    const tagId = new URL(request.url).searchParams.get("tagId");
    if (!tagId)
      return NextResponse.json({ error: "tagId obrigatório" }, { status: 400 });
    const { prisma } = await import("@/lib/prisma");
    if (!(await assertLead(prisma, id, orgId)))
      return NextResponse.json(
        { error: "Lead não encontrado" },
        { status: 404 },
      );
    await prisma.leadTag.deleteMany({ where: { leadId: id, tagId } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("DELETE /api/leads/[id]/tags error", err);
    return NextResponse.json(
      { error: "Falha ao remover tag" },
      { status: 500 },
    );
  }
}
