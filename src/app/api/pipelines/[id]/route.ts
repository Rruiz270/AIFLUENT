import { NextRequest, NextResponse } from "next/server";
import { requireAuth, checkRateLimit, requireOrgId } from "@/lib/api-auth";
import { apiLimiter } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

// Renomeia / arquiva / oculta um funil. (admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const rl = checkRateLimit(request, apiLimiter);
  if (rl) return rl;
  const { error, session } = await requireAuth("admin");
  if (error) return error;
  const { orgId, error: orgError } = requireOrgId(session);
  if (orgError) return orgError;
  const { id } = await params;

  try {
    const { prisma } = await import("@/lib/prisma");
    const existing = await prisma.pipeline.findUnique({
      where: { id },
      select: { organizationId: true },
    });
    if (!existing || existing.organizationId !== orgId) {
      return NextResponse.json(
        { error: "Funil nao encontrado" },
        { status: 404 },
      );
    }
    const body = await request.json();
    const data: Record<string, unknown> = {};
    if (typeof body.name === "string" && body.name.trim())
      data.name = body.name.trim();
    if (typeof body.groupName === "string")
      data.groupName = body.groupName.trim() || null;
    if (typeof body.archived === "boolean") data.archived = body.archived;
    if (typeof body.hidden === "boolean") data.hidden = body.hidden;
    const pipeline = await prisma.pipeline.update({ where: { id }, data });
    return NextResponse.json({ pipeline });
  } catch (err) {
    logger.error("PATCH /api/pipelines/[id] error", err);
    return NextResponse.json({ error: "Falha ao atualizar" }, { status: 500 });
  }
}

// Exclui um funil (desvincula os leads das etapas dele antes). (admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error, session } = await requireAuth("admin");
  if (error) return error;
  const { orgId, error: orgError } = requireOrgId(session);
  if (orgError) return orgError;
  const { id } = await params;

  try {
    const { prisma } = await import("@/lib/prisma");
    const existing = await prisma.pipeline.findUnique({
      where: { id },
      select: { organizationId: true, isDefault: true },
    });
    if (!existing || existing.organizationId !== orgId) {
      return NextResponse.json(
        { error: "Funil nao encontrado" },
        { status: 404 },
      );
    }
    if (existing.isDefault) {
      return NextResponse.json(
        { error: "Não é possível excluir o funil padrão" },
        { status: 400 },
      );
    }
    // Desvincula leads das etapas deste funil (não apaga os leads)
    const stages = await prisma.pipelineStage.findMany({
      where: { pipelineId: id },
      select: { id: true },
    });
    const stageIds = stages.map((s) => s.id);
    if (stageIds.length) {
      await prisma.lead.updateMany({
        where: { stageId: { in: stageIds } },
        data: { stageId: null },
      });
    }
    await prisma.pipeline.delete({ where: { id } }); // stages caem em cascade
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("DELETE /api/pipelines/[id] error", err);
    return NextResponse.json({ error: "Falha ao excluir" }, { status: 500 });
  }
}
