import { NextRequest, NextResponse } from "next/server";
import { requireAuth, checkRateLimit, requireOrgId } from "@/lib/api-auth";
import { apiLimiter } from "@/lib/rate-limit";
import { ingestLead } from "@/lib/lead-ingest";
import { logger } from "@/lib/logger";

// Cria (ou reutiliza) um lead + conversa de WhatsApp a partir do Atendimento,
// para iniciar um disparo manual. O 1º envio a um lead novo exige template
// (regra das 24h) — o seletor de Modelos resolve isso.
export async function POST(request: NextRequest) {
  const rl = checkRateLimit(request, apiLimiter);
  if (rl) return rl;
  const { error, session } = await requireAuth();
  if (error) return error;
  const { orgId, error: orgError } = requireOrgId(session);
  if (orgError) return orgError;

  try {
    const body = await request.json();
    const firstName = (body.firstName as string)?.trim();
    const phoneRaw = (body.phone as string)?.trim();
    const phone = phoneRaw?.replace(/\D/g, "");
    if (!firstName || !phone || phone.length < 10) {
      return NextResponse.json(
        { error: "Nome e telefone (com DDD/país) são obrigatórios" },
        { status: 400 },
      );
    }

    const { prisma } = await import("@/lib/prisma");

    // 1. cria/reutiliza o lead pelo funil (tag + dedup + etapa padrão)
    const result = await ingestLead(prisma, {
      organizationId: orgId,
      firstName,
      phone,
      whatsapp: phone,
      source: "manual",
      channel: "whatsapp",
      tags: ["atendimento"],
    });
    const leadId = result.lead.id;

    // 2. cria/reutiliza a conversa de WhatsApp
    let conversation = await prisma.conversation.findFirst({
      where: { organizationId: orgId, leadId, channel: "whatsapp" },
      select: { id: true },
    });
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          organizationId: orgId,
          leadId,
          channel: "whatsapp",
          status: "open",
          lastMessageAt: new Date(),
        },
        select: { id: true },
      });
    }

    return NextResponse.json({ conversationId: conversation.id, leadId });
  } catch (err) {
    logger.error("POST /api/conversations/start error", err);
    return NextResponse.json(
      { error: "Falha ao iniciar conversa" },
      { status: 500 },
    );
  }
}
