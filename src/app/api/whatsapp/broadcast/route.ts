import { NextRequest, NextResponse } from "next/server";
import { requireAuth, checkRateLimit, requireOrgId } from "@/lib/api-auth";
import { apiLimiter } from "@/lib/rate-limit";
import { whatsapp } from "@/lib/whatsapp";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_RECIPIENTS = 200; // teto por disparo (evita timeout/rate-limit)

// Disparo em massa de um TEMPLATE aprovado para uma audiência (por tag ou todos).
// Para cada lead: garante a conversa, envia o template e persiste a mensagem.
export async function POST(request: NextRequest) {
  const rl = checkRateLimit(request, apiLimiter);
  if (rl) return rl;
  const { error, session } = await requireAuth("gestor");
  if (error) return error;
  const { orgId, error: orgError } = requireOrgId(session);
  if (orgError) return orgError;

  if (!whatsapp.isConfigured) {
    return NextResponse.json(
      { error: "WhatsApp nao configurado" },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();
    const templateName = (body.templateName as string)?.trim();
    const languageCode = (body.languageCode as string)?.trim() || "pt_BR";
    const tag = (body.tag as string)?.trim() || null;
    const paramsByLead = body.params as string[] | undefined; // params iguais p/ todos
    const preview = (body.preview as string) || `[template] ${templateName}`;
    if (!templateName) {
      return NextResponse.json(
        { error: "templateName obrigatorio" },
        { status: 400 },
      );
    }

    const { prisma } = await import("@/lib/prisma");
    const leads = await prisma.lead.findMany({
      where: {
        organizationId: orgId,
        whatsapp: { not: null },
        ...(tag ? { tags: { some: { tag: { name: tag } } } } : {}),
      },
      select: { id: true, whatsapp: true, phone: true },
      take: MAX_RECIPIENTS,
    });

    const senderId = (session!.user as Record<string, unknown>).id as string;
    const components = paramsByLead?.length
      ? [
          {
            type: "body",
            parameters: paramsByLead.map((t) => ({ type: "text", text: t })),
          },
        ]
      : undefined;

    let sent = 0;
    let failed = 0;
    for (const lead of leads) {
      const to = lead.whatsapp || lead.phone;
      if (!to) {
        failed++;
        continue;
      }
      try {
        let conv = await prisma.conversation.findFirst({
          where: {
            organizationId: orgId,
            leadId: lead.id,
            channel: "whatsapp",
          },
          select: { id: true },
        });
        if (!conv) {
          conv = await prisma.conversation.create({
            data: {
              organizationId: orgId,
              leadId: lead.id,
              channel: "whatsapp",
              status: "open",
              lastMessageAt: new Date(),
            },
            select: { id: true },
          });
        }
        const res = await whatsapp.sendTemplateMessage(
          to,
          templateName,
          languageCode,
          components,
        );
        const ok = "messageId" in res;
        await prisma.conversationMessage.create({
          data: {
            conversationId: conv.id,
            direction: "outbound",
            content: preview,
            contentType: "text",
            status: ok ? "sent" : "failed",
            externalId: ok ? res.messageId : undefined,
            metadata: JSON.stringify({
              template: templateName,
              broadcast: true,
            }),
            senderId,
          },
        });
        await prisma.conversation.update({
          where: { id: conv.id },
          data: { lastMessageAt: new Date() },
        });
        if (ok) sent++;
        else failed++;
      } catch (e) {
        failed++;
        logger.warn("broadcast lead falhou", {
          leadId: lead.id,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }

    logger.info("Broadcast template", { orgId, templateName, sent, failed });
    return NextResponse.json({ total: leads.length, sent, failed });
  } catch (err) {
    logger.error("POST /api/whatsapp/broadcast error", err);
    return NextResponse.json({ error: "Falha no disparo" }, { status: 500 });
  }
}
