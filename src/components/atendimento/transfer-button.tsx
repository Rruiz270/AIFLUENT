'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRightLeft, ChevronDown, Loader2, Check, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

// ── Types ───────────────────────────────────────────────────────────────────

interface Department {
  id: string
  name: string
  color: string
  type: string
}

interface Transfer {
  id: string
  fromTeam?: { id: string; name: string } | null
  toTeam?: { id: string; name: string } | null
  reason?: string | null
  createdBy?: { id: string; name: string } | null
  createdAt: string
}

interface TransferButtonProps {
  entityType: 'lead' | 'conversation'
  entityId: string
  currentTeamId?: string | null
  onTransferred?: () => void
  className?: string
}

// ── Component ───────────────────────────────────────────────────────────────

export function TransferButton({
  entityType,
  entityId,
  currentTeamId,
  onTransferred,
  className,
}: TransferButtonProps) {
  const [open, setOpen] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [loadingDepts, setLoadingDepts] = useState(false)
  const [selectedDept, setSelectedDept] = useState<Department | null>(null)
  const [reason, setReason] = useState('')
  const [transferring, setTransferring] = useState(false)
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch departments on open
  const fetchDepartments = useCallback(async () => {
    setLoadingDepts(true)
    try {
      const res = await fetch('/api/departments')
      if (res.ok) {
        const data = await res.json()
        const all: Department[] = Array.isArray(data) ? data : data.departments || []
        // Exclude current department
        setDepartments(currentTeamId ? all.filter((d) => d.id !== currentTeamId) : all)
      }
    } catch {
      // silently fail
    } finally {
      setLoadingDepts(false)
    }
  }, [currentTeamId])

  // Fetch transfer history
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true)
    try {
      const res = await fetch(`/api/transfers?entityType=${entityType}&entityId=${entityId}`)
      if (res.ok) {
        const data = await res.json()
        setTransfers(Array.isArray(data) ? data : data.transfers || [])
      }
    } catch {
      // silently fail
    } finally {
      setLoadingHistory(false)
    }
  }, [entityType, entityId])

  useEffect(() => {
    if (entityId) {
      fetchHistory()
    }
  }, [entityId, fetchHistory])

  useEffect(() => {
    if (open) {
      fetchDepartments()
    }
  }, [open, fetchDepartments])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSelectedDept(null)
        setReason('')
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  async function handleTransfer() {
    if (!selectedDept) return
    setTransferring(true)
    try {
      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          entityId,
          toTeamId: selectedDept.id,
          reason: reason.trim() || undefined,
        }),
      })
      if (res.ok) {
        toast.success(`Transferido para ${selectedDept.name}`)
        setOpen(false)
        setSelectedDept(null)
        setReason('')
        await fetchHistory()
        onTransferred?.()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || 'Erro ao transferir')
      }
    } catch {
      toast.error('Erro de conexao')
    } finally {
      setTransferring(false)
    }
  }

  return (
    <div className={cn('space-y-2', className)} ref={dropdownRef}>
      {/* Transfer trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
          open
            ? 'border-sky-300 bg-sky-50 text-sky-700'
            : 'border-gray-200 bg-white text-gray-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600'
        )}
      >
        <span className="flex items-center gap-1.5">
          <ArrowRightLeft className="h-3.5 w-3.5" />
          Transferir para...
        </span>
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-lg border border-sky-200 bg-white p-3 space-y-3 shadow-sm">
              {/* Department list */}
              {loadingDepts ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
                </div>
              ) : departments.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-2">Nenhum departamento disponivel</p>
              ) : (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {departments.map((dept) => (
                    <button
                      key={dept.id}
                      onClick={() => setSelectedDept(dept)}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors text-left',
                        selectedDept?.id === dept.id
                          ? 'bg-sky-100 text-sky-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      <div
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: dept.color }}
                      />
                      <span className="truncate">{dept.name}</span>
                      {selectedDept?.id === dept.id && (
                        <Check className="h-3.5 w-3.5 ml-auto shrink-0 text-sky-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Reason */}
              {selectedDept && (
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-1">
                    Motivo (opcional)
                  </label>
                  <input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Motivo da transferencia..."
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:border-sky-400 focus:outline-none transition-colors"
                  />
                </div>
              )}

              {/* Confirm button */}
              {selectedDept && (
                <button
                  onClick={handleTransfer}
                  disabled={transferring}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-sky-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-sky-600 disabled:opacity-50"
                >
                  {transferring ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                  )}
                  Confirmar transferencia
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transfer history */}
      {!loadingHistory && transfers.length > 0 && (
        <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Historico de transferencias
          </p>
          <div className="space-y-1.5">
            {transfers.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <span className="font-medium text-gray-700">
                  {t.fromTeam?.name || 'Entrada'}
                </span>
                <ArrowRight className="h-3 w-3 text-gray-400 shrink-0" />
                <span className="font-medium text-gray-700">
                  {t.toTeam?.name || '—'}
                </span>
                <span className="text-gray-400 ml-auto shrink-0">
                  ({t.createdBy?.name || 'Sistema'},{' '}
                  {formatDistanceToNow(new Date(t.createdAt), { addSuffix: false, locale: ptBR })})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
