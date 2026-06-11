import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const GRAPH = "https://graph.facebook.com/v21.0";

// Saúde/limites reais do número WhatsApp na Meta (tier, qualidade, throughput).
// Admin-only. Usa o token do servidor (não exposto ao cliente).
export async function GET() {
  const { error, session } = await requireAuth("admin");
  if (error) return error;
  void session;

  const pnId = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
  const waba = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "";
  const token = process.env.WHATSAPP_ACCESS_TOKEN || "";
  if (!pnId || !token) {
    return NextResponse.json(
      { configured: false, error: "WhatsApp não configurado no servidor" },
      { status: 200 },
    );
  }

  async function g(url: string) {
    try {
      const r = await fetch(url);
      return await r.json();
    } catch (e) {
      return { _err: e instanceof Error ? e.message : String(e) };
    }
  }

  try {
    const numberFields =
      "display_phone_number,verified_name,quality_rating,messaging_limit_tier,throughput,status,name_status,code_verification_status";
    const number = await g(
      `${GRAPH}/${pnId}?fields=${numberFields}&access_token=${token}`,
    );

    let phoneList: unknown = null;
    if (waba) {
      const list = await g(
        `${GRAPH}/${waba}/phone_numbers?fields=${numberFields}&access_token=${token}`,
      );
      phoneList = list?.data ?? list;
    }

    return NextResponse.json({ configured: true, number, phones: phoneList });
  } catch (err) {
    logger.error("GET /api/whatsapp/health error", err);
    return NextResponse.json(
      { error: "Falha ao consultar a Meta" },
      { status: 500 },
    );
  }
}
