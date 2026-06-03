'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRightLeft, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Department {
  id: string
  name: string
  color: string
  type: string
}

interface ConversationTransferButtonProps {
  conversationId: string
  currentTeamId?: string | null
  onTransferred?: () => void
}

export function ConversationTransferButton({
  conversationId,
  currentTeamId,
  onTransferred,
}: ConversationTransferButtonProps) {
  const [open, setOpen] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [loadingDepts, setLoadingDepts] = useState(false)
  const [selectedDept, setSelectedDept] = useState<Department | null>(null)
  const [reason, setReason] = useState('')
  const [transferring, setTransferring] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchDepartments = useCallback(async () => {
    setLoadingDepts(true)
    try {
      const res = await fetch('/api/departments')
      if (res.ok) {
        const data = await res.json()
        const all: Department[] = Array.isArray(data) ? data : data.departments || []
        setDepartments(currentTeamId ? all.filter((d) => d.id !== currentTeamId) : all)
      }
    } catch {
      // silently fail
    } finally {
      setLoadingDepts(false)
    }
  }, [currentTeamId])

  useEffect(() => {
    if (open) {
      fetchDepartments()
    }
  }, [open, fetchDepartments])

  // Close on outside click
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
          entityType: 'conversation',
          entityId: conversationId,
          toTeamId: selectedDept.id,
          reason: reason.trim() || undefined,
        }),
      })
      if (res.ok) {
        toast.success(`Conversa transferida para ${selectedDept.name}`)
        setOpen(false)
        setSelectedDept(null)
        setReason('')
        onTransferred?.()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || 'Erro ao transferir conversa')
      }
    } catch {
      toast.error('Erro de conexao')
    } finally {
      setTransferring(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Icon button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'p-2 rounded-lg transition-colors',
          open
            ? 'text-sky-500 bg-sky-50'
            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
        )}
        title="Transferir conversa"
      >
        <ArrowRightLeft className="h-4 w-4" />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-lg space-y-3"
          >
            <p className="text-xs font-semibold text-gray-900">Transferir conversa</p>

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
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Motivo (opcional)"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:border-sky-400 focus:outline-none transition-colors"
              />
            )}

            {/* Confirm */}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
