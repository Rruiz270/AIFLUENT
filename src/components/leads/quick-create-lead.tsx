'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Zap, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface QuickCreateLeadProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}

export function QuickCreateLead({ open, onOpenChange, onCreated }: QuickCreateLeadProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: name.trim(),
          phone: phone.trim() || undefined,
          source: 'manual',
          temperature: 'warm',
        }),
      })

      if (res.ok) {
        toast.success('Lead criado com sucesso!')
        setName('')
        setPhone('')
        onOpenChange(false)
        onCreated?.()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Erro ao criar lead')
      }
    } catch {
      toast.error('Erro de conexao. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Criar Lead Rapido
          </DialogTitle>
          <DialogDescription>
            Cadastre um novo lead em segundos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="quick-name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <input
              id="quick-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do lead"
              required
              autoFocus
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="quick-phone" className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <input
              id="quick-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-500/20 transition-colors hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {loading ? 'Criando...' : 'Criar Lead'}
          </button>

          <div className="text-center">
            <Link
              href="/leads?new=1"
              onClick={() => onOpenChange(false)}
              className="text-xs text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Formulario completo
            </Link>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
