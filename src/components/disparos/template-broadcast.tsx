"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Loader2, FileText } from "lucide-react";

interface TemplateComponent {
  type: string;
  text?: string;
}
interface Template {
  name: string;
  language: string;
  category: string;
  status: string;
  components: TemplateComponent[];
}

function bodyText(t: Template): string {
  return (
    t.components?.find((c) => (c.type || "").toUpperCase() === "BODY")?.text ||
    ""
  );
}
function countParams(text: string): number {
  const m = text.match(/\{\{\s*\d+\s*\}\}/g);
  return m ? new Set(m).size : 0;
}

interface TemplateBroadcastProps {
  open: boolean;
  onClose: () => void;
}

export function TemplateBroadcast({ open, onClose }: TemplateBroadcastProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Template | null>(null);
  const [params, setParams] = useState<string[]>([]);
  const [audience, setAudience] = useState<"todos" | "tag">("todos");
  const [tag, setTag] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect -- carregamento ao abrir */
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    setSelected(null);
    setResult(null);
    fetch("/api/whatsapp/templates")
      .then((r) => r.json())
      .then((d) => {
        setTemplates(d.templates || []);
        if (d.error) setError(d.error);
      })
      .catch(() => setError("Falha ao carregar templates"))
      .finally(() => setLoading(false));
  }, [open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function pick(t: Template) {
    setSelected(t);
    setParams(Array(countParams(bodyText(t))).fill(""));
  }

  async function broadcast() {
    if (!selected || sending) return;
    if (audience === "tag" && !tag.trim()) {
      setError("Informe a tag da audiência");
      return;
    }
    setSending(true);
    setError(null);
    setResult(null);
    let preview = bodyText(selected);
    params.forEach((p, i) => {
      preview = preview.replace(
        new RegExp(`\\{\\{\\s*${i + 1}\\s*\\}\\}`, "g"),
        p || `{{${i + 1}}}`,
      );
    });
    try {
      const res = await fetch("/api/whatsapp/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateName: selected.name,
          languageCode: selected.language,
          params,
          tag: audience === "tag" ? tag.trim() : null,
          preview,
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error || "Falha no disparo");
      } else {
        setResult(
          `Disparo concluído: ${d.sent} enviados, ${d.failed} falharam (de ${d.total} contatos).`,
        );
      }
    } catch {
      setError("Falha no disparo");
    } finally {
      setSending(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <FileText className="h-4 w-4 text-emerald-600" /> Disparo em
                massa por template
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex justify-center py-10 text-gray-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : result ? (
                <div className="space-y-4 text-center">
                  <p className="text-sm font-medium text-emerald-700">
                    {result}
                  </p>
                  <button
                    onClick={onClose}
                    className="rounded-lg bg-gray-100 px-4 py-2 text-sm"
                  >
                    Fechar
                  </button>
                </div>
              ) : !selected ? (
                <div className="space-y-2">
                  {error && <p className="text-sm text-rose-600">{error}</p>}
                  {templates.length === 0 && !error ? (
                    <p className="text-sm text-gray-500">
                      Nenhum template aprovado.
                    </p>
                  ) : (
                    templates.map((t) => (
                      <button
                        key={`${t.name}-${t.language}`}
                        onClick={() => pick(t)}
                        className="w-full rounded-xl border border-gray-200 p-3 text-left hover:border-emerald-300 hover:bg-emerald-50"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-900">
                            {t.name}
                          </span>
                          <span className="text-[10px] uppercase text-gray-400">
                            {t.category} · {t.language}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                          {bodyText(t)}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => setSelected(null)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    ← Voltar
                  </button>
                  <div className="whitespace-pre-wrap rounded-xl bg-[#d9fdd3] p-3 text-sm text-gray-900">
                    {bodyText(selected)}
                  </div>
                  {params.map((p, i) => (
                    <div key={i}>
                      <label className="text-xs text-gray-500">{`Variável {{${i + 1}}}`}</label>
                      <input
                        value={p}
                        onChange={(e) =>
                          setParams((prev) =>
                            prev.map((x, j) => (j === i ? e.target.value : x)),
                          )
                        }
                        placeholder={`Valor para {{${i + 1}}}`}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                      />
                    </div>
                  ))}
                  <div className="rounded-xl border border-gray-200 p-3">
                    <p className="mb-2 text-xs font-semibold text-gray-700">
                      Audiência
                    </p>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="radio"
                        checked={audience === "todos"}
                        onChange={() => setAudience("todos")}
                      />
                      Todos os leads com WhatsApp
                    </label>
                    <label className="mt-1 flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="radio"
                        checked={audience === "tag"}
                        onChange={() => setAudience("tag")}
                      />
                      Por tag:
                      <input
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                        onFocus={() => setAudience("tag")}
                        placeholder="ex.: meta_ads"
                        className="flex-1 rounded-lg border border-gray-200 px-2 py-1 text-xs focus:border-emerald-400 focus:outline-none"
                      />
                    </label>
                  </div>
                  {error && <p className="text-sm text-rose-600">{error}</p>}
                  <p className="text-[11px] text-gray-400">
                    Máx. 200 contatos por disparo. Templates podem ser enviados
                    mesmo fora da janela de 24h.
                  </p>
                  <button
                    onClick={broadcast}
                    disabled={sending || params.some((p) => !p.trim())}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25d366] py-2.5 text-sm font-medium text-white hover:bg-[#20bd5a] disabled:opacity-50"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {sending ? "Disparando..." : "Disparar agora"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
