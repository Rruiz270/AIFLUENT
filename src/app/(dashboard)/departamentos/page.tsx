'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, Plus, Pencil, Trash2, Users, FileText, MessageCircle,
  Loader2, X, Check, AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ── Types ───────────────────────────────────────────────────────────────────

interface Department {
  id: string
  name: string
  type: string
  color: string
  description?: string | null
  isDefault: boolean
  _count?: {
    members?: number
    leads?: number
    conversations?: number
  }
}

type DepartmentType = 'commercial' | 'sdr' | 'support' | 'cs' | 'finance' | 'marketing' | 'ops'

const DEPARTMENT_TYPES: { value: DepartmentType; label: string }[] = [
  { value: 'commercial', label: 'Comercial' },
  { value: 'sdr', label: 'Pre-vendas (SDR)' },
  { value: 'support', label: 'Suporte' },
  { value: 'cs', label: 'Customer Success' },
  { value: 'finance', label: 'Financeiro' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'ops', label: 'Operacoes' },
]

const PRESET_COLORS = [
  '#22c55e', // green
  '#3b82f6', // blue
  '#a855f7', // purple
  '#eab308', // yellow
  '#ef4444', // red
  '#f97316', // orange
  '#06b6d4', // cyan
  '#ec4899', // pink
]

const TYPE_LABELS: Record<string, string> = {
  commercial: 'Comercial',
  sdr: 'Pre-vendas (SDR)',
  support: 'Suporte',
  cs: 'Customer Success',
  finance: 'Financeiro',
  marketing: 'Marketing',
  ops: 'Operacoes',
}

// ── Form Component ──────────────────────────────────────────────────────────

function DepartmentForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  initial?: Department | null
  onSubmit: (data: { name: string; type: string; color: string; description: string; isDefault: boolean }) => void
  onCancel: () => void
  submitting: boolean
}) {
  const [name, setName] = useState(initial?.name || '')
  const [type, setType] = useState(initial?.type || 'commercial')
  const [color, setColor] = useState(initial?.color || PRESET_COLORS[0])
  const [description, setDescription] = useState(initial?.description || '')
  const [isDefault, setIsDefault] = useState(initial?.isDefault || false)

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-xl border border-sky-200 bg-sky-50/50 p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          {initial ? 'Editar Departamento' : 'Novo Departamento'}
        </h3>
        <button
          onClick={onCancel}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Nome */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Nome *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Comercial"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-sky-400 focus:outline-none transition-colors"
          />
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-sky-400 focus:outline-none transition-colors"
          >
            {DEPARTMENT_TYPES.map((dt) => (
              <option key={dt.value} value={dt.value}>
                {dt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cor */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Cor</label>
        <div className="flex items-center gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={cn(
                'h-7 w-7 rounded-full border-2 transition-all',
                color === c ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'
              )}
              style={{ backgroundColor: c }}
              aria-label={`Cor ${c}`}
            />
          ))}
        </div>
      </div>

      {/* Descricao */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Descricao</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descricao do departamento (opcional)"
          rows={2}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-sky-400 focus:outline-none transition-colors resize-none"
        />
      </div>

      {/* Departamento padrao */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsDefault(!isDefault)}
          className={cn(
            'relative h-5 w-9 rounded-full transition-colors',
            isDefault ? 'bg-sky-500' : 'bg-gray-200'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
              isDefault ? 'translate-x-4' : 'translate-x-0.5'
            )}
          />
        </button>
        <span className="text-xs text-gray-700">Departamento padrao</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onSubmit({ name, type, color, description, isDefault })}
          disabled={submitting || !name.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-600 disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          {initial ? 'Salvar' : 'Criar'}
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </motion.div>
  )
}

// ── Department Card ─────────────────────────────────────────────────────────

function DepartmentCard({
  department,
  onEdit,
  onDelete,
  deleting,
}: {
  department: Department
  onEdit: () => void
  onDelete: () => void
  deleting: boolean
}) {
  const memberCount = department._count?.members ?? 0
  const leadCount = department._count?.leads ?? 0
  const conversationCount = department._count?.conversations ?? 0
  const isEmpty = memberCount === 0 && leadCount === 0 && conversationCount === 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="rounded-xl border border-gray-200 bg-white p-4 space-y-3 hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="h-3 w-3 rounded-full shrink-0"
            style={{ backgroundColor: department.color }}
          />
          <h3 className="text-sm font-semibold text-gray-900 truncate">{department.name}</h3>
          {department.isDefault && (
            <span className="shrink-0 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-600">
              Padrao
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            title="Editar"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          {isEmpty && (
            <button
              onClick={onDelete}
              disabled={deleting}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-colors disabled:opacity-50"
              title="Excluir"
            >
              {deleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Type badge */}
      <div>
        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600">
          {TYPE_LABELS[department.type] || department.type}
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {memberCount} membros
        </span>
        <span className="flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" />
          {leadCount} leads
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="h-3.5 w-3.5" />
          {conversationCount} conversas
        </span>
      </div>

      {/* Description */}
      {department.description && (
        <p className="text-xs text-gray-400 truncate">{department.description}</p>
      )}
    </motion.div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function DepartamentosPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch('/api/departments')
      if (res.ok) {
        const data = await res.json()
        setDepartments(Array.isArray(data) ? data : data.departments || [])
      }
    } catch {
      // API unavailable
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  async function handleCreate(data: { name: string; type: string; color: string; description: string; isDefault: boolean }) {
    if (!data.name.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast.success('Departamento criado com sucesso')
        setFormOpen(false)
        await fetchDepartments()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || 'Erro ao criar departamento')
      }
    } catch {
      toast.error('Erro de conexao')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdate(data: { name: string; type: string; color: string; description: string; isDefault: boolean }) {
    if (!editingDept || !data.name.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/departments/${editingDept.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast.success('Departamento atualizado')
        setEditingDept(null)
        await fetchDepartments()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || 'Erro ao atualizar departamento')
      }
    } catch {
      toast.error('Erro de conexao')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Departamento excluido')
        await fetchDepartments()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || 'Erro ao excluir departamento')
      }
    } catch {
      toast.error('Erro de conexao')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Departamentos</h1>
          <p className="text-gray-500 mt-1">
            {departments.length} departamento{departments.length !== 1 ? 's' : ''} cadastrado{departments.length !== 1 ? 's' : ''}
          </p>
        </div>
        {!formOpen && !editingDept && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFormOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-sky-500/20 transition-colors hover:bg-sky-600"
          >
            <Plus className="h-4 w-4" />
            Novo Departamento
          </motion.button>
        )}
      </div>

      {/* Create / Edit form */}
      <AnimatePresence>
        {formOpen && (
          <DepartmentForm
            onSubmit={handleCreate}
            onCancel={() => setFormOpen(false)}
            submitting={submitting}
          />
        )}
        {editingDept && (
          <DepartmentForm
            initial={editingDept}
            onSubmit={handleUpdate}
            onCancel={() => setEditingDept(null)}
            submitting={submitting}
          />
        )}
      </AnimatePresence>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      )}

      {/* Empty state */}
      {!loading && departments.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/50 py-16 text-center"
        >
          <Building2 className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Nenhum departamento</h3>
          <p className="text-xs text-gray-500 max-w-xs mb-4">
            Crie departamentos para organizar sua equipe e distribuir leads automaticamente.
          </p>
          {!formOpen && (
            <button
              onClick={() => setFormOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-600"
            >
              <Plus className="h-4 w-4" />
              Criar primeiro departamento
            </button>
          )}
        </motion.div>
      )}

      {/* Department grid */}
      {!loading && departments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {departments.map((dept) => (
              <DepartmentCard
                key={dept.id}
                department={dept}
                onEdit={() => {
                  setFormOpen(false)
                  setEditingDept(dept)
                }}
                onDelete={() => handleDelete(dept.id)}
                deleting={deletingId === dept.id}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
