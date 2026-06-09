import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireOrgId } from "@/lib/api-auth";
import { whatsapp } from "@/lib/whatsapp";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

// Define a foto do perfil business do WhatsApp (somente admin).
export async function POST(request: NextRequest) {
  const { error, session } = await requireAuth("admin");
  if (error) return error;
  const { error: orgError } = requireOrgId(session);
  if (orgError) return orgError;

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Arquivo obrigatorio" },
        { status: 400 },
      );
    }
    const bytes = await file.arrayBuffer();
    const result = await whatsapp.setProfilePicture(
      bytes,
      file.type || "image/jpeg",
    );
    if ("error" in result) {
      logger.error("Falha ao definir foto do perfil WhatsApp", {
        error: result.error,
      });
      return NextResponse.json({ ok: false, error: result.error });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("POST /api/whatsapp/profile-picture error", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Falha" },
      { status: 500 },
    );
  }
}
