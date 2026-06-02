'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Sparkles, ArrowRight, Clock, Snowflake, Flame, Zap, Loader2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AICopilotProps {
  temperature?: string | null
  score?: number | null
  stageName?: string | null
  lastContactAt?: string | null
  leadId: string
  className?: string
}

interface Suggestion {
  id: string
  message: string
  icon: React.ElementType
  type: 'move' | 'followup' | 'reactivate' | 'info' | 'risk' | 'api'
  primaryAction?: string
  secondaryAction?: string
  color: string
}

function buildLocalFallback(temperature?: string | null, score?: number | null, lastContactAt?: string | null): Suggestion[] {
  const newSuggestions: Suggestion[] = []
  let daysSinceContact = 0
  if (lastContactAt) {
    daysSinceContact = Math.floor((Date.now() - new Date(lastContactAt).getTime()) / (1000 * 60 * 60 * 24))
  }

  if (temperature === 'hot' && (score ?? 0) > 70) {
    newSuggestions.push({
      id: 'move-proposta',
      message: 'Lead quente! Mover para Proposta?',
      icon: Flame,
      type: 'move',
      primaryAction: 'Sim',
      secondaryAction: 'Nao',
      color: 'border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50',
    })
  }

  if (temperature === 'warm' && daysSinceContact >= 3) {
    newSuggestions.push({
      id: 'create-followup',
      message: `Sem contato ha ${daysSinceContact} dias. Criar follow-up?`,
      icon: Clock,
      type: 'followup',
      primaryAction: 'Criar',
      secondaryAction: 'Ignorar',
      color: 'border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50',
    })
  }

  if (temperature === 'cold') {
    newSuggestions.push({
      id: 'reactivate',
      message: 'Lead frio. Sugerir reativacao?',
      icon: Snowflake,
      type: 'reactivate',
      primaryAction: 'Reativar',
      secondaryAction: 'Ignorar',
      color: 'border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50',
    })
  }

  if (score !== null && score !== undefined) {
    const scoreLevel = score >= 70 ? 'alto' : score >= 40 ? 'medio' : 'baixo'
    newSuggestions.push({
      id: 'score-info',
      message: `Score de conversao: ${score}% (${scoreLevel})`,
      icon: Zap,
      type: 'info',
      color: score >= 70 ? 'border-emerald-200 bg-emerald-50' : score >= 40 ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-gray-50',
    })
  }

  if (newSuggestions.length === 0) {
    newSuggestions.push({
      id: 'general-tip',
      message: 'IA analisando dados do lead...',
      icon: Sparkles,
      type: 'info',
      color: 'border-gray-200 bg-gray-50',
    })
  }

  return newSuggestions
}

export function AICopilot({ temperature, score, stageName, lastContactAt, leadId, className }: AICopilotProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [apiLoading, setApiLoading] = useState(false)

  const fetchAISuggestions = useCallback(async () => {
    setApiLoading(true)
    try {
      const [nextStepRes, riskRes, probRes] = await Promise.all([
        fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'suggest-next-step', context: { leadId } }),
        }),
        fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'detect-risk', context: { leadId } }),
        }),
        fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'estimate-probability', context: { leadId } }),
        }),
      ])

      const apiSuggestions: Suggestion[] = []

      if (nextStepRes.ok) {
        const data = await nextStepRes.json()
        if (data.suggestion) {
          const actionIcon = data.action === 'move_stage' ? Flame : data.action === 'create_followup' ? Clock : data.action === 'reactivate_or_remove' ? Snowflake : Sparkles
          const actionColor = data.action === 'move_stage' ? 'border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50'
            : data.action === 'create_followup' ? 'border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50'
            : data.action === 'reactivate_or_remove' ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50'
            : 'border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50'
          apiSuggestions.push({
            id: 'api-next-step',
            message: data.suggestion,
            icon: actionIcon,
            type: 'api',
            primaryAction: data.action === 'monitor' ? undefined : 'Executar',
            secondaryAction: 'Ignorar',
            color: actionColor,
          })
        }
      }

      if (riskRes.ok) {
        const data = await riskRes.json()
        if (data.risks && data.risks.length > 0 && data.level !== 'none') {
          const highRisk = data.risks.find((r: { severity: string }) => r.severity === 'high')
          const riskMessage = highRisk ? highRisk.signal : data.risks[0].signal
          apiSuggestions.push({
            id: 'api-risk',
            message: `Risco: ${riskMessage}`,
            icon: AlertTriangle,
            type: 'risk',
            color: data.level === 'high' ? 'border-rose-200 bg-gradient-to-r from-rose-50 to-red-50' : 'border-amber-200 bg-amber-50',
          })
        }
      }

      if (probRes.ok) {
        const data = await probRes.json()
        if (data.probability !== undefined) {
          apiSuggestions.push({
            id: 'api-probability',
            message: `Probabilidade de conversao: ${data.probability}% — ${data.recommendation}`,
            icon: Zap,
            type: 'info',
            color: data.probability >= 70 ? 'border-emerald-200 bg-emerald-50' : data.probability >= 40 ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-gray-50',
          })
        }
      }

      if (apiSuggestions.length > 0) {
        setSuggestions(apiSuggestions)
      } else {
        // Fallback to local rules
        setSuggestions(buildLocalFallback(temperature, score, lastContactAt))
      }
    } catch {
      // Fallback to local rules on API failure
      setSuggestions(buildLocalFallback(temperature, score, lastContactAt))
    } finally {
      setApiLoading(false)
    }
  }, [leadId, temperature, score, lastContactAt])

  useEffect(() => {
    // Show local fallback immediately, then fetch from API
    setSuggestions(buildLocalFallback(temperature, score, lastContactAt))
    if (leadId) {
      fetchAISuggestions()
    }
  }, [temperature, score, stageName, lastContactAt, leadId, fetchAISuggestions])

  function handleDismiss(id: string) {
    setDismissed((prev) => new Set(prev).add(id))
  }

  async function handlePrimary(suggestion: Suggestion) {
    if (suggestion.type === 'move') {
      // Try to call AI API for next step
      try {
        await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'suggest-follow-up',
            context: { leadId, temperature, score },
          }),
        })
      } catch {
        // silently fail
      }
    }
    handleDismiss(suggestion.id)
  }

  const visible = suggestions.filter((s) => !dismissed.has(s.id))

  if (visible.length === 0 && !apiLoading) return null

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-1.5 px-1">
        <Bot className="h-3.5 w-3.5 text-violet-500" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-500">Copiloto IA</span>
        {apiLoading && <Loader2 className="h-3 w-3 animate-spin text-violet-400" />}
      </div>

      <AnimatePresence mode="popLayout">
        {visible.map((suggestion) => (
          <motion.div
            key={suggestion.id}
            layout
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'rounded-xl border p-3',
              suggestion.color
            )}
          >
            <div className="flex items-start gap-2">
              <suggestion.icon className="h-4 w-4 shrink-0 mt-0.5 text-gray-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 leading-snug">{suggestion.message}</p>
                {(suggestion.primaryAction || suggestion.secondaryAction) && (
                  <div className="flex items-center gap-2 mt-2">
                    {suggestion.primaryAction && (
                      <button
                        onClick={() => handlePrimary(suggestion)}
                        className="rounded-lg bg-white/80 border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-white shadow-sm"
                      >
                        {suggestion.primaryAction}
                      </button>
                    )}
                    {suggestion.secondaryAction && (
                      <button
                        onClick={() => handleDismiss(suggestion.id)}
                        className="px-2 py-1 text-xs text-gray-500 transition-colors hover:text-gray-700"
                      >
                        {suggestion.secondaryAction}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
