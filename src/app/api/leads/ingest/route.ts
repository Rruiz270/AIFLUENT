import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, checkRateLimit, requireOrgId } from "@/lib/api-auth";
import { ingestLead } from "@/lib/lead-ingest";
import { logger } from "@/lib/logger";

/**
 * Endpoint ÚNICO de entrada de leads.
 * Todos os canais (manual, importação, WhatsApp, Meta Ads, formulários, APIs
 * externas) devem entrar por aqui. Garante org, tag obrigatória, deduplicação,
 * auditoria e histórico de origem (ver src/lib/lead-ingest.ts).
 */
const ingestSchema = z.object({
  firstName: z.string().min(1, "Nome obrigatorio"),
  lastName: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  source: z.string().default("api"),
  sourceDetail: z.string().optional(),
  channel: z.string().optional(),
  temperature: z.enum(["cold", "warm", "hot"]).optional(),
  courseInterest: z.string().optional(),
  languageLevel: z.string().optional(),
  notes: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  stageId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metaAdId: z.string().optional(),
  fbLeadId: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const rl = checkRateLimit(request);
  if (rl) return rl;
  const { error, session } = await requireAuth("gestor");
  if (error) return error;
  const { orgId, error: orgError } = requireOrgId(session);
  if (orgError) return orgError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalido" }, { status: 400 });
  }

  const parsed = ingestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados invalidos", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const createdById = (session!.user as Record<string, unknown>).id as string;
    const result = await ingestLead(prisma, {
      ...parsed.data,
      email: parsed.data.email || undefined,
      organizationId: orgId,
      createdById,
    });
    return NextResponse.json(result, { status: result.deduped ? 200 : 201 });
  } catch (err) {
    logger.error("POST /api/leads/ingest error", err);
    return NextResponse.json(
      { error: "Falha ao capturar lead" },
      { status: 500 },
    );
  }
}
