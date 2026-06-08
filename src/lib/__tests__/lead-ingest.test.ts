import { describe, it, expect, vi } from "vitest";
import { ingestLead } from "../lead-ingest";

function mkPrisma() {
  return {
    lead: { findFirst: vi.fn(), create: vi.fn() },
    activity: { create: vi.fn().mockResolvedValue({}) },
    tag: { findFirst: vi.fn(), create: vi.fn() },
    leadTag: { findFirst: vi.fn(), create: vi.fn().mockResolvedValue({}) },
    auditLog: { create: vi.fn().mockResolvedValue({}) },
  };
}

describe("ingestLead — funil único de captura de leads", () => {
  it("cria lead novo, aplica tag pela origem e registra auditoria + origem", async () => {
    const prisma = mkPrisma();
    prisma.lead.findFirst.mockResolvedValue(null);
    prisma.lead.create.mockResolvedValue({ id: "lead1" });
    prisma.tag.findFirst.mockResolvedValue(null);
    prisma.tag.create.mockResolvedValue({ id: "tag1" });
    prisma.leadTag.findFirst.mockResolvedValue(null);

    const r = await ingestLead(prisma, {
      organizationId: "org1",
      source: "whatsapp",
      firstName: "Maria",
      phone: "+55 11 99999-8888",
    });

    expect(r.deduped).toBe(false);
    expect(r.lead.id).toBe("lead1");
    // org sempre da chamada
    expect(prisma.lead.create.mock.calls[0][0].data.organizationId).toBe(
      "org1",
    );
    // tag obrigatória = origem
    expect(prisma.tag.findFirst).toHaveBeenCalledWith({
      where: { name: "whatsapp", organizationId: "org1" },
    });
    expect(prisma.leadTag.create).toHaveBeenCalledWith({
      data: { leadId: "lead1", tagId: "tag1" },
    });
    // auditoria + histórico de origem
    expect(prisma.auditLog.create.mock.calls[0][0].data.action).toBe(
      "lead_ingested",
    );
    expect(prisma.activity.create).toHaveBeenCalled();
  });

  it("deduplica quando já existe lead com mesmo contato na empresa", async () => {
    const prisma = mkPrisma();
    prisma.lead.findFirst.mockResolvedValue({ id: "existing1" });
    prisma.tag.findFirst.mockResolvedValue({ id: "tagX" });
    prisma.leadTag.findFirst.mockResolvedValue({ id: "rel" }); // relação já existe

    const r = await ingestLead(prisma, {
      organizationId: "org1",
      source: "meta_ads",
      firstName: "Joao",
      whatsapp: "+55 11 99999-8888",
      tags: ["vip"],
    });

    expect(r.deduped).toBe(true);
    expect(r.lead.id).toBe("existing1");
    expect(prisma.lead.create).not.toHaveBeenCalled();
    // não duplica a relação de tag existente
    expect(prisma.leadTag.create).not.toHaveBeenCalled();
    // auditoria marca dedup
    expect(prisma.auditLog.create.mock.calls[0][0].data.action).toBe(
      "lead_ingest_dedup",
    );
  });

  it("exige organizationId", async () => {
    const prisma = mkPrisma();
    await expect(
      // @ts-expect-error organizationId ausente de propósito
      ingestLead(prisma, { source: "api", firstName: "X" }),
    ).rejects.toThrow();
  });
});
