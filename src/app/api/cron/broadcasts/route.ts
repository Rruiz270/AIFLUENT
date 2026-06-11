import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 60;

// Cron de segurança: reanima disparos 'running' com pendentes (caso o
// auto-encadeamento tenha parado por redeploy/falha). Autenticado por CRON_SECRET.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authz = request.headers.get("authorization");
  if (!secret || authz !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "";

    // jobs em andamento que ainda têm pendentes
    const running = await prisma.broadcastJob.findMany({
      where: { status: "running" },
      select: { id: true },
      take: 20,
    });

    let kicked = 0;
    for (const job of running) {
      const pending = await prisma.broadcastRecipient.count({
        where: { jobId: job.id, status: { in: ["pending", "processing"] } },
      });
      if (pending === 0) {
        await prisma.broadcastJob.update({
          where: { id: job.id },
          data: { status: "completed", completedAt: new Date() },
        });
        continue;
      }
      if (base && secret) {
        // dispara um lote (que se auto-encadeia)
        await fetch(`${base}/api/broadcasts/${job.id}/process`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${secret}`,
            "Content-Type": "application/json",
          },
          body: "{}",
        }).catch(() => {});
        kicked++;
      }
    }

    return NextResponse.json({ ok: true, running: running.length, kicked });
  } catch (err) {
    logger.error("GET /api/cron/broadcasts error", err);
    return NextResponse.json({ error: "falha" }, { status: 500 });
  }
}
