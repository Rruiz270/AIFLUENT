import { NextRequest, NextResponse } from "next/server";
import { requireAuth, checkRateLimit, requireOrgId } from "@/lib/api-auth";
import { apiLimiter } from "@/lib/rate-limit";
import { whatsapp } from "@/lib/whatsapp";
import { logger } from "@/lib/logger";

// Lista os templates de WhatsApp aprovados (da conta WABA na Meta).
export async function GET(request: NextRequest) {
  const rl = checkRateLimit(request, apiLimiter);
  if (rl) return rl;
  const { error, session } = await requireAuth();
  if (error) return error;
  const { error: orgError } = requireOrgId(session);
  if (orgError) return orgError;

  if (!whatsapp.isConfigured) {
    return NextResponse.json({ templates: [], configured: false });
  }
  try {
    const result = await whatsapp.listTemplates();
    if ("error" in result) {
      logger.warn("Falha ao listar templates", { error: result.error });
      return NextResponse.json(
        { templates: [], error: result.error },
        { status: 200 },
      );
    }
    // Só os aprovados/ativos interessam para envio
    const approved = result.templates.filter(
      (t) => (t.status || "").toUpperCase() === "APPROVED",
    );
    return NextResponse.json({ templates: approved, configured: true });
  } catch (err) {
    logger.error("GET /api/whatsapp/templates error", err);
    return NextResponse.json(
      { templates: [], error: "Falha ao buscar templates" },
      { status: 500 },
    );
  }
}
