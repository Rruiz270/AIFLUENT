"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Loader2,
  Filter,
  UserCheck,
  Building2,
  Check,
} from "lucide-react";

interface Tag {
  id: string;
  name: string;
}
interface Funnel {
  id: string;
  name: string;
  groupName: string | null;
}
interface NamedId {
  id: string;
  name: string;
}

const SOURCES = [
  { v: "", l: "Qualquer origem" },
  { v: "whatsapp", l: "WhatsApp" },
  { v: "meta_ads", l: "Meta Ads" },
  { v: "manual", l: "Manual" },
  { v: "clint", l: "Clint (migrados)" },
  { v: "api", l: "API" },
];

export function DistributeLeads() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [stages, setStages] = useState<NamedId[]>([]);
  const [consultants, setConsultants] = useState<NamedId[]>([]);
  const [departments, setDepartments] = useState<NamedId[]>([]);

  const [selTags, setSelTags] = useState<string[]>([]);
  const [funnelId, setFunnelId] = useState("");
  const [stageId, setStageId] = useState("");
  const [source, setSource] = useState("");
  const [createdAfter, setCreatedAfter] = useState("");

  const [targetConsultant, setTargetConsultant] = useState("");
  const [targetTeam, setTargetTeam] = useState("");

  const [preview, setPreview] = useState<number | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect -- carregamento inicial */
  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((d) => setTags(d.tags || d || []));
    fetch("/api/pipelines")
      .then((r) => r.json())
      .then((d) => setFunnels(d.pipelines || []));
    fetch("/api/users")
      .then((r) => r.json())
      .then((d) =>
        setConsultants(
          (d.users || d || []).map((u: NamedId) => ({
            id: u.id,
            name: u.name,
          })),
        ),
      );
    fetch("/api/departments")
      .then((r) => r.json())
      .then((d) =>
        setDepartments(
          (d.departments || d.teams || d || []).map((t: NamedId) => ({
            id: t.id,
            name: t.name,
          })),
        ),
      );
  }, []);

  useEffect(() => {
    if (!funnelId) {
      setStages([]);
      setStageId("");
      return;
    }
    fetch(`/api/pipeline?pipelineId=${funnelId}`)
      .then((r) => r.json())
      .then((d) =>
        setStages(
          (d?.stages || []).map((s: NamedId) => ({ id: s.id, name: s.name })),
        ),
      );
  }, [funnelId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const segment = useCallback(() => {
    const seg: Record<string, unknown> = {};
    if (selTags.length) seg.tags = selTags;
    if (stageId) seg.stageIds = [stageId];
    else if (funnelId) seg.pipelineId = funnelId;
    if (source) seg.source = source;
    if (createdAfter) seg.createdAfter = createdAfter;
    return seg;
  }, [selTags, stageId, funnelId, source, createdAfter]);

  useEffect(() => {
    setPreviewing(true); // eslint-disable-line react-hooks/set-state-in-effect
    const t = setTimeout(() => {
      fetch("/api/leads/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segment: segment(), preview: true }),
      })
        .then((r) => r.json())
        .then((d) => setPreview(d.count ?? 0))
        .catch(() => setPreview(null))
        .finally(() => setPreviewing(false));
    }, 400);
    return () => clearTimeout(t);
  }, [segment]);

  function toggleTag(name: string) {
    setSelTags((p) =>
      p.includes(name) ? p.filter((t) => t !== name) : [...p, name],
    );
  }

  async function assign() {
    if (!preview || (!targetConsultant && !targetTeam)) return;
    if (
      !confirm(
        `Atribuir ${preview.toLocaleString("pt-BR")} leads ${
          targetConsultant ? "ao consultor selecionado" : ""
        }${targetConsultant && targetTeam ? " e " : ""}${
          targetTeam ? "ao time selecionado" : ""
        }?`,
      )
    )
      return;
    setAssigning(true);
    setResult(null);
    try {
      const res = await fetch("/api/leads/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segment: segment(),
          consultantId: targetConsultant || undefined,
          teamId: targetTeam || undefined,
        }),
      });
      const d = await res.json();
      setResult(
        res.ok ? `✅ ${d.assigned} leads distribuídos!` : d.error || "Falha",
      );
    } catch {
      setResult("Falha ao distribuir");
    } finally {
      setAssigning(false);
    }
  }

  const groups: { name: string; items: Funnel[] }[] = [];
  for (const f of funnels) {
    const g = f.groupName || "Sem grupo";
    let b = groups.find((x) => x.name === g);
    if (!b) {
      b = { name: g, items: [] };
      groups.push(b);
    }
    b.items.push(f);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Distribuir leads</h1>
        <p className="text-gray-500">
          Atribua leads em massa a um consultor e/ou time — por segmentação. É o
          que faz vendedores e gestores enxergarem os leads no Atendimento.
        </p>
      </div>

      {/* Segmentação */}
      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
          <Filter className="h-4 w-4" /> 1. Quais leads
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-gray-500">Funil</label>
            <select
              value={funnelId}
              onChange={(e) => setFunnelId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-2 text-sm"
            >
              <option value="">Qualquer funil</option>
              {groups.map((g) =>
                g.items.map((f) => (
                  <option key={f.id} value={f.id}>
                    {g.name} · {f.name}
                  </option>
                )),
              )}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Etapa</label>
            <select
              value={stageId}
              onChange={(e) => setStageId(e.target.value)}
              disabled={!funnelId}
              className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-2 text-sm disabled:bg-gray-50"
            >
              <option value="">Todas as etapas</option>
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Origem</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-2 text-sm"
            >
              {SOURCES.map((s) => (
                <option key={s.v} value={s.v}>
                  {s.l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Criados a partir de</label>
            <input
              type="date"
              value={createdAfter}
              onChange={(e) => setCreatedAfter(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500">Tags (qualquer uma)</label>
          <div className="mt-1 flex max-h-24 flex-wrap gap-1.5 overflow-y-auto rounded-lg border border-gray-100 p-2">
            {tags.slice(0, 50).map((t) => (
              <button
                key={t.id}
                onClick={() => toggleTag(t.name)}
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${selTags.includes(t.name) ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
          <Users className="h-4 w-4" />
          {previewing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span>
              <b>{(preview ?? 0).toLocaleString("pt-BR")}</b> leads nesta
              seleção
            </span>
          )}
        </div>
      </div>

      {/* Destino */}
      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
          <UserCheck className="h-4 w-4" /> 2. Atribuir a
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="flex items-center gap-1 text-xs text-gray-500">
              <UserCheck className="h-3 w-3" /> Consultor (responsável)
            </label>
            <select
              value={targetConsultant}
              onChange={(e) => setTargetConsultant(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-2 text-sm"
            >
              <option value="">— não alterar —</option>
              {consultants.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center gap-1 text-xs text-gray-500">
              <Building2 className="h-3 w-3" /> Time / departamento
            </label>
            <select
              value={targetTeam}
              onChange={(e) => setTargetTeam(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-2 text-sm"
            >
              <option value="">— não alterar —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={assign}
          disabled={assigning || !preview || (!targetConsultant && !targetTeam)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {assigning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Distribuir {(preview ?? 0).toLocaleString("pt-BR")} leads
        </button>
        {result && (
          <p className="text-center text-sm font-medium text-gray-700">
            {result}
          </p>
        )}
      </div>
    </div>
  );
}
