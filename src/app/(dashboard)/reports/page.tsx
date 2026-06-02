'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, Users, Target, MessageSquare,
  Download, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { cn } from '@/lib/utils'

// TODO: Connect to /api/reports when backend is ready
const monthlyData: { month: string; leads: number; conversoes: number; receita: number }[] = []

const sourceData: { name: string; value: number; color: string }[] = []

const consultantData: { name: string; leads: number; conversoes: number; taxa: number }[] = []

const campaignData: { name: string; enviados: number; abertos: number; respondidos: number; convertidos: number }[] = [
]

// TODO: Connect to /api/reports when backend is ready
const kpis = [
  { title: 'Total de Leads', value: '0', change: 0, icon: Users, positive: true },
  { title: 'Taxa de Conversao', value: '0%', change: 0, icon: Target, positive: true },
  { title: 'Receita Gerada', value: 'R$ 0', change: 0, icon: TrendingUp, positive: true },
  { title: 'Campanhas Enviadas', value: '0', change: 0, icon: MessageSquare, positive: false },
]

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload) return null
  return (
    <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 shadow-xl">
      <p className="text-gray-700 text-xs mb-2">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' && entry.name === 'receita'
            ? `R$ ${entry.value.toLocaleString('pt-BR')}`
            : entry.value.toLocaleString('pt-BR')}
        </p>
      ))}
    </div>
  )
}

export default function ReportsPage() {
  const [period, setPeriod] = useState('6m')

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-500 mt-1">Análise completa de performance comercial</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
            {['7d', '30d', '3m', '6m', '1a'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-md transition-colors',
                  period === p ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-white'
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl border border-gray-200 transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-gray-200 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <kpi.icon className="w-5 h-5 text-indigo-400" />
              </div>
              <div className={cn('flex items-center gap-1 text-sm', kpi.positive ? 'text-emerald-400' : 'text-rose-400')}>
                {kpi.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(kpi.change)}%
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            <p className="text-sm text-gray-500 mt-1">{kpi.title}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leads & Conversões</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="leads" stroke="#6366f1" fill="url(#leadGradient)" strokeWidth={2} name="Leads" />
              <Area type="monotone" dataKey="conversoes" stroke="#22c55e" fill="transparent" strokeWidth={2} name="Conversões" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leads por Origem</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
              >
                {sourceData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {sourceData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                {s.name} ({s.value}%)
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance por Consultor</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={consultantData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="leads" fill="#6366f1" radius={[4, 4, 0, 0]} name="Leads" />
              <Bar dataKey="conversoes" fill="#22c55e" radius={[4, 4, 0, 0]} name="Conversões" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance de Campanhas</h3>
          <div className="space-y-4">
            {campaignData.map((c) => (
              <div key={c.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-900 font-medium">{c.name}</span>
                  <span className="text-xs text-gray-500">{((c.convertidos / c.enviados) * 100).toFixed(1)}% conv.</span>
                </div>
                <div className="flex gap-1 h-2">
                  <div className="bg-indigo-500 rounded-l" style={{ width: `${(c.abertos / c.enviados) * 100}%` }} />
                  <div className="bg-violet-500" style={{ width: `${(c.respondidos / c.enviados) * 100}%` }} />
                  <div className="bg-emerald-500 rounded-r" style={{ width: `${(c.convertidos / c.enviados) * 100}%` }} />
                  <div className="flex-1 bg-gray-100 rounded-r" />
                </div>
                <div className="flex gap-4 text-xs text-gray-400">
                  <span>Enviados: {c.enviados.toLocaleString()}</span>
                  <span>Abertos: {c.abertos.toLocaleString()}</span>
                  <span>Respondidos: {c.respondidos.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
