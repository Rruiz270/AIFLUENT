'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, Users, Shield, Save, Check, Plus, Upload,
  Pencil, X, Loader2, UserX, RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PERMISSIONS, type Permission } from '@/lib/rbac'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface UserRow {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  phone?: string | null
  lastLoginAt?: string | null
  createdAt?: string
}

/* ------------------------------------------------------------------ */
/*  Tab definitions                                                    */
/* ------------------------------------------------------------------ */

const tabs = [
  { id: 'empresa', label: 'Empresa', icon: Building2 },
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'permissoes', label: 'Permissoes', icon: Shield },
] as const

type TabId = (typeof tabs)[number]['id']

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const roleLabel: Record<string, string> = {
  admin: 'Admin',
  gestor: 'Gestor',
  operador: 'Operador',
}

const roleBadge: Record<string, string> = {
  admin: 'bg-rose-50 text-rose-700 border-rose-200',
  gestor: 'bg-amber-50 text-amber-700 border-amber-200',
  operador: 'bg-blue-50 text-blue-700 border-blue-200',
}

function formatDate(d?: string | null) {
  if (!d) return '---'
  return new Date(d).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<TabId>('empresa')

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configuracoes</h1>
        <p className="text-gray-500 mt-1">Gerencie sua organizacao, usuarios e permissoes</p>
      </div>

      {/* Tab bar */}
      <div className="relative flex gap-1 border-b border-gray-200 mb-8">
        {tabs.map((tab) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors',
                active ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700',
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {active && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === 'empresa' && <EmpresaTab key="empresa" />}
        {activeTab === 'usuarios' && <UsuariosTab key="usuarios" />}
        {activeTab === 'permissoes' && <PermissoesTab key="permissoes" />}
      </AnimatePresence>
    </div>
  )
}

/* ================================================================== */
/*  Tab 1: Empresa                                                     */
/* ================================================================== */

function EmpresaTab() {
  const [saved, setSaved] = useState(false)
  const [companyName, setCompanyName] = useState('AIFLUENT')
  const [segment, setSegment] = useState('Educacao')
  const [timezone, setTimezone] = useState('America/Sao_Paulo')

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Dados da Empresa</h3>

        {/* Logo */}
        <div>
          <label className="block text-sm text-gray-500 mb-2">Logo da Empresa</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
              <span className="text-xl font-bold text-white">AI</span>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm rounded-xl border border-gray-200 transition-colors">
              <Upload className="w-4 h-4" />
              Alterar Logo
            </button>
          </div>
        </div>

        {/* Company Name */}
        <div>
          <label className="block text-sm text-gray-500 mb-2">Nome da Empresa</label>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-indigo-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Segment */}
        <div>
          <label className="block text-sm text-gray-500 mb-2">Segmento</label>
          <select
            value={segment}
            onChange={(e) => setSegment(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-indigo-500 focus:outline-none transition-colors"
          >
            <option value="Educacao">Educacao</option>
            <option value="Tecnologia">Tecnologia</option>
            <option value="Saude">Saude</option>
            <option value="Financeiro">Financeiro</option>
            <option value="Varejo">Varejo</option>
            <option value="Servicos">Servicos</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm text-gray-500 mb-2">Fuso Horario</label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-indigo-500 focus:outline-none transition-colors"
          >
            <option value="America/Sao_Paulo">Sao Paulo (GMT-3)</option>
            <option value="America/Manaus">Manaus (GMT-4)</option>
            <option value="America/Belem">Belem (GMT-3)</option>
            <option value="America/Fortaleza">Fortaleza (GMT-3)</option>
            <option value="America/Recife">Recife (GMT-3)</option>
            <option value="America/Cuiaba">Cuiaba (GMT-4)</option>
            <option value="America/Rio_Branco">Rio Branco (GMT-5)</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={cn(
            'flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all',
            saved ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white',
          )}
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Salvo!' : 'Salvar'}
        </button>
      </div>
    </motion.div>
  )
}

/* ================================================================== */
/*  Tab 2: Usuarios                                                    */
/* ================================================================== */

function UsuariosTab() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Usuarios da Organizacao</h3>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-xl font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Usuario
        </button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showCreate && (
          <CreateUserForm
            onClose={() => setShowCreate(false)}
            onCreated={() => {
              setShowCreate(false)
              fetchUsers()
            }}
          />
        )}
      </AnimatePresence>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          <span className="ml-2 text-sm text-gray-500">Carregando usuarios...</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && users.length === 0 && (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl">
          <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Nenhum usuario encontrado</p>
        </div>
      )}

      {/* User table */}
      {!loading && users.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cargo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ultimo Acesso</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <UserTableRow
                    key={user.id}
                    user={user}
                    editing={editingId === user.id}
                    onEdit={() => setEditingId(user.id)}
                    onCancel={() => setEditingId(null)}
                    onUpdated={() => {
                      setEditingId(null)
                      fetchUsers()
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  User table row                                                     */
/* ------------------------------------------------------------------ */

function UserTableRow({
  user,
  editing,
  onEdit,
  onCancel,
  onUpdated,
}: {
  user: UserRow
  editing: boolean
  onEdit: () => void
  onCancel: () => void
  onUpdated: () => void
}) {
  const [editName, setEditName] = useState(user.name)
  const [editRole, setEditRole] = useState(user.role)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, role: editRole }),
      })
      if (res.ok) onUpdated()
    } catch {
      /* ignore */
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive() {
    setSaving(true)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      })
      if (res.ok) onUpdated()
    } catch {
      /* ignore */
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <tr className="bg-indigo-50/50">
        <td className="px-4 py-3">
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
          />
        </td>
        <td className="px-4 py-3 text-gray-500">{user.email}</td>
        <td className="px-4 py-3">
          <select
            value={editRole}
            onChange={(e) => setEditRole(e.target.value)}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
          >
            <option value="admin">Admin</option>
            <option value="gestor">Gestor</option>
            <option value="operador">Operador</option>
          </select>
        </td>
        <td className="px-4 py-3">
          <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', user.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-500 border-gray-200')}>
            {user.isActive ? 'Ativo' : 'Inativo'}
          </span>
        </td>
        <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(user.lastLoginAt)}</td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              Salvar
            </button>
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-gray-500 text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-white">
              {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          </div>
          <span className="font-medium text-gray-900">{user.name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-gray-500">{user.email}</td>
      <td className="px-4 py-3">
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', roleBadge[user.role] || roleBadge.operador)}>
          {roleLabel[user.role] || user.role}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', user.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-500 border-gray-200')}>
          {user.isActive ? 'Ativo' : 'Inativo'}
        </span>
      </td>
      <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(user.lastLoginAt)}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={handleToggleActive}
            disabled={saving}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              user.isActive
                ? 'text-gray-400 hover:text-rose-600 hover:bg-rose-50'
                : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50',
            )}
            title={user.isActive ? 'Desativar' : 'Reativar'}
          >
            {user.isActive ? <UserX className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
          </button>
        </div>
      </td>
    </tr>
  )
}

/* ------------------------------------------------------------------ */
/*  Create User Form                                                   */
/* ------------------------------------------------------------------ */

function CreateUserForm({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('operador')
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')
    if (!name || !email || !password) {
      setErrorMsg('Preencha todos os campos obrigatorios')
      return
    }
    if (password.length < 6) {
      setErrorMsg('Senha deve ter no minimo 6 caracteres')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      })
      if (res.ok) {
        onCreated()
      } else {
        const data = await res.json()
        setErrorMsg(data.error || 'Erro ao criar usuario')
      }
    } catch {
      setErrorMsg('Erro de conexao')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-900">Novo Usuario</h4>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-2 rounded-xl">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Nome *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome completo"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@empresa.com"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Senha *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimo 6 caracteres"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Cargo</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-indigo-500 focus:outline-none transition-colors"
            >
              <option value="admin">Admin</option>
              <option value="gestor">Gestor</option>
              <option value="operador">Operador</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Criar Usuario
          </button>
        </div>
      </form>
    </motion.div>
  )
}

/* ================================================================== */
/*  Tab 3: Permissoes (RBAC matrix, read-only)                        */
/* ================================================================== */

function PermissoesTab() {
  const roles = ['admin', 'gestor', 'operador'] as const
  const entries = Object.entries(PERMISSIONS) as [Permission, readonly string[]][]

  // Group permissions by category
  const pagePerms = entries.filter(([k]) => k.startsWith('page:'))
  const actionPerms = entries.filter(([k]) => k.startsWith('action:'))

  function PermTable({ title, perms }: { title: string; perms: [Permission, readonly string[]][] }) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recurso</th>
                {roles.map((r) => (
                  <th key={r} className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {roleLabel[r]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {perms.map(([perm, allowed]) => (
                <tr key={perm} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5 text-gray-700 font-mono text-xs">{perm}</td>
                  {roles.map((r) => (
                    <td key={r} className="text-center px-4 py-2.5">
                      {(allowed as readonly string[]).includes(r) ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 text-emerald-600">
                          <Check className="h-3 w-3" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-50 text-gray-300">
                          <X className="h-3 w-3" />
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Matriz de Permissoes</h3>
        <p className="text-sm text-gray-500 mt-1">Visualize as permissoes de cada cargo no sistema</p>
      </div>
      <PermTable title="Paginas" perms={pagePerms} />
      <PermTable title="Acoes" perms={actionPerms} />
    </motion.div>
  )
}
