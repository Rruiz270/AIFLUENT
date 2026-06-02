import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth, checkRateLimit } from '@/lib/api-auth'
import { aiLimiter } from '@/lib/rate-limit'

const aiRequestSchema = z.object({
  action: z.enum([
    'generate-campaign-message', 'score-lead', 'suggest-follow-up',
    'suggest-next-step', 'summarize-conversation', 'estimate-probability',
    'detect-risk', 'generate-response',
  ], {
    message: 'action invalida',
  }),
  channel: z.string().optional(),
  context: z.record(z.string(), z.unknown()).optional(),
})

const campaignTemplates: Record<string, string[]> = {
  whatsapp: [
    'Olá {{nome}}! 👋 Aqui é a equipe AIFLUENT. Temos uma oportunidade incrível para você iniciar seus estudos de {{curso}}. Quer saber mais?',
    '🎓 {{nome}}, que tal dar o próximo passo na sua carreira? Nosso curso de {{curso}} está com condições especiais! Posso te contar mais?',
    'Oi {{nome}}! Vi que você tem interesse em {{curso}}. Temos vagas limitadas com desconto exclusivo. Vamos conversar? 🚀',
    '{{nome}}, sua jornada bilíngue começa aqui! 🌎 Curso de {{curso}} com metodologia exclusiva. Quer agendar uma aula experimental gratuita?',
  ],
  email: [
    'Assunto: {{nome}}, sua oportunidade de aprender {{curso}} chegou!\n\nOlá {{nome}},\n\nSabemos que aprender um novo idioma é um dos melhores investimentos. Por isso, preparamos uma condição especial para você.\n\nNosso curso de {{curso}} oferece:\n✅ Aulas ao vivo com professores nativos\n✅ Material didático incluso\n✅ Certificado internacional\n\nAgende sua aula experimental gratuita!\n\nAtenciosamente,\nEquipe AIFLUENT',
  ],
  sms: [
    'AIFLUENT: {{nome}}, vagas limitadas para {{curso}}! Desconto de 30% na matrícula. Responda SIM para saber mais.',
    'AIFLUENT: Oi {{nome}}! Sua aula experimental de {{curso}} está disponível. Agende grátis: link',
  ],
}

export async function POST(request: NextRequest) {
  const rateLimited = checkRateLimit(request, aiLimiter)
  if (rateLimited) return rateLimited

  const { error: authError } = await requireAuth()
  if (authError) return authError

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalido' }, { status: 400 })
  }

  const parsed = aiRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados invalidos', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { action, channel } = parsed.data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const context = parsed.data.context as Record<string, any> | undefined

  if (action === 'generate-campaign-message') {
    const templates = campaignTemplates[channel || 'whatsapp'] || campaignTemplates.whatsapp
    const template = templates[Math.floor(Math.random() * templates.length)]
    const message = template
      .replace(/\{\{nome\}\}/g, context?.name || '{{nome}}')
      .replace(/\{\{curso\}\}/g, context?.course || '{{curso}}')

    return NextResponse.json({
      message,
      suggestions: [
        'Adicionar emoji de urgência',
        'Incluir link de agendamento',
        'Personalizar com nome do consultor',
        'Adicionar oferta com prazo',
      ],
    })
  }

  if (action === 'score-lead') {
    const factors = {
      sourceScore: { instagram: 7, facebook: 6, google: 8, whatsapp: 9, referral: 9, website: 5, event: 7, manual: 3, import: 2 },
      temperatureScore: { hot: 9, warm: 6, cold: 2 },
      activityBonus: Math.min((context?.activityCount || 0) * 0.5, 3),
      recencyBonus: context?.daysSinceLastContact ? Math.max(0, 3 - context.daysSinceLastContact * 0.1) : 0,
    }

    const base = (factors.sourceScore[context?.source as keyof typeof factors.sourceScore] || 5)
    const temp = (factors.temperatureScore[context?.temperature as keyof typeof factors.temperatureScore] || 5)
    const score = Math.min(10, (base + temp + factors.activityBonus + factors.recencyBonus) / 3)

    return NextResponse.json({
      score: Math.round(score * 10) / 10,
      factors: {
        source: `Origem ${context?.source}: ${base}/10`,
        temperature: `Temperatura ${context?.temperature}: ${temp}/10`,
        activity: `Engajamento: +${factors.activityBonus.toFixed(1)}`,
        recency: `Recência: +${factors.recencyBonus.toFixed(1)}`,
      },
      recommendation: score >= 7 ? 'Lead quente — priorizar contato imediato' :
                       score >= 4 ? 'Lead morno — manter na sequência de follow-up' :
                       'Lead frio — incluir em campanha de reativação',
    })
  }

  if (action === 'suggest-follow-up') {
    const suggestions = [
      { time: '2h', message: 'Enviar mensagem de agradecimento pelo interesse' },
      { time: '24h', message: 'Compartilhar material sobre o curso de interesse' },
      { time: '3d', message: 'Oferecer aula experimental gratuita' },
      { time: '7d', message: 'Enviar depoimento de aluno com perfil similar' },
      { time: '14d', message: 'Apresentar condição especial com prazo' },
    ]

    return NextResponse.json({ suggestions })
  }

  // ── Contextual AI actions (rule-based, using real lead data) ──────────────

  if (action === 'suggest-next-step') {
    const { prisma } = await import('@/lib/prisma')
    const lead = await prisma.lead.findUnique({
      where: { id: context?.leadId as string },
      include: { stage: true, deals: true, activities: { take: 5, orderBy: { createdAt: 'desc' } } },
    })
    if (!lead) return NextResponse.json({ suggestion: 'Lead nao encontrado' })

    const daysSinceContact = lead.lastContactAt
      ? Math.floor((Date.now() - new Date(lead.lastContactAt).getTime()) / 86400000)
      : 999
    const hasDeals = lead.deals.length > 0

    let suggestion = ''
    let nextAction = ''

    if (lead.temperature === 'hot' && (lead.aiScore ?? 0) > 70) {
      suggestion = `${lead.firstName} tem score ${lead.aiScore}% e temperatura quente. Recomendo mover para a proxima etapa e enviar proposta comercial.`
      nextAction = 'move_stage'
    } else if (daysSinceContact > 3 && lead.temperature !== 'cold') {
      suggestion = `${lead.firstName} esta sem contato ha ${daysSinceContact} dias. Recomendo criar um follow-up urgente.`
      nextAction = 'create_followup'
    } else if (lead.temperature === 'cold' && daysSinceContact > 7) {
      suggestion = `${lead.firstName} esta frio e sem contato ha ${daysSinceContact} dias. Considere uma campanha de reativacao ou remover do pipeline.`
      nextAction = 'reactivate_or_remove'
    } else if (!hasDeals && lead.temperature !== 'cold') {
      suggestion = `${lead.firstName} ainda nao tem negocio vinculado. Recomendo criar um negocio para acompanhar o valor.`
      nextAction = 'create_deal'
    } else {
      suggestion = `${lead.firstName} esta no estagio ${lead.stage?.name || 'indefinido'}. Acompanhe normalmente.`
      nextAction = 'monitor'
    }

    return NextResponse.json({
      suggestion,
      action: nextAction,
      leadData: { score: lead.aiScore, temperature: lead.temperature, daysSinceContact, stage: lead.stage?.name },
    })
  }

  if (action === 'summarize-conversation') {
    const { prisma } = await import('@/lib/prisma')
    const lead = await prisma.lead.findUnique({
      where: { id: context?.leadId as string },
      include: { stage: true, activities: { take: 10, orderBy: { createdAt: 'desc' } } },
    })
    if (!lead) return NextResponse.json({ summary: 'Lead nao encontrado' })

    const noteCount = lead.activities.filter(a => a.type === 'note').length
    const callCount = lead.activities.filter(a => a.type === 'call').length
    const totalActivities = lead.activities.length

    let summary = `${lead.firstName}`
    if (lead.stage) summary += ` esta em ${lead.stage.name}`
    summary += `, temp. ${lead.temperature || 'indefinida'}`
    if (lead.aiScore) summary += `, score ${lead.aiScore}%`
    summary += `. ${totalActivities} atividades recentes`
    if (noteCount > 0) summary += ` (${noteCount} notas)`
    if (callCount > 0) summary += ` (${callCount} ligacoes)`
    summary += '.'

    return NextResponse.json({ summary, details: { noteCount, callCount, totalActivities, stage: lead.stage?.name, temperature: lead.temperature } })
  }

  if (action === 'estimate-probability') {
    const { prisma } = await import('@/lib/prisma')
    const lead = await prisma.lead.findUnique({
      where: { id: context?.leadId as string },
      include: { stage: true, deals: true, activities: { take: 20, orderBy: { createdAt: 'desc' } } },
    })
    if (!lead) return NextResponse.json({ probability: 0, factors: {} })

    let probability = 30 // base
    const factors: Record<string, string> = {}

    // Temperature factor
    if (lead.temperature === 'hot') { probability += 25; factors.temperature = 'Quente: +25%' }
    else if (lead.temperature === 'warm') { probability += 10; factors.temperature = 'Morno: +10%' }
    else { probability -= 10; factors.temperature = 'Frio: -10%' }

    // Score factor
    if (lead.aiScore && lead.aiScore > 70) { probability += 15; factors.score = `Score ${lead.aiScore}%: +15%` }
    else if (lead.aiScore && lead.aiScore > 40) { probability += 5; factors.score = `Score ${lead.aiScore}%: +5%` }
    else { factors.score = `Score ${lead.aiScore ?? 0}%: +0%` }

    // Activity factor
    const actCount = lead.activities.length
    if (actCount >= 10) { probability += 10; factors.engagement = `${actCount} atividades: +10%` }
    else if (actCount >= 5) { probability += 5; factors.engagement = `${actCount} atividades: +5%` }
    else { factors.engagement = `${actCount} atividades: +0%` }

    // Stage position factor
    const stageNames = ['Base', 'Prospeccao', 'Conexao', 'Proposta', 'Negociacao', 'Fechamento']
    const stageIdx = stageNames.findIndex(s => lead.stage?.name?.toLowerCase().includes(s.toLowerCase()))
    if (stageIdx >= 3) { probability += 15; factors.stage = `${lead.stage?.name}: +15%` }
    else if (stageIdx >= 1) { probability += 5; factors.stage = `${lead.stage?.name}: +5%` }
    else { factors.stage = `${lead.stage?.name || 'Inicio'}: +0%` }

    // Deal factor
    if (lead.deals.some(d => d.status === 'open')) { probability += 5; factors.deal = 'Negocio aberto: +5%' }

    probability = Math.max(0, Math.min(100, probability))

    return NextResponse.json({ probability, factors, recommendation: probability >= 70 ? 'Alta chance — priorizar' : probability >= 40 ? 'Chance moderada — nutrir' : 'Baixa chance — reavaliar' })
  }

  if (action === 'detect-risk') {
    const { prisma } = await import('@/lib/prisma')
    const lead = await prisma.lead.findUnique({
      where: { id: context?.leadId as string },
      include: { stage: true, deals: true, activities: { take: 5, orderBy: { createdAt: 'desc' } } },
    })
    if (!lead) return NextResponse.json({ risks: [], level: 'unknown' })

    const risks: Array<{ signal: string; severity: 'low' | 'medium' | 'high' }> = []
    const daysSinceContact = lead.lastContactAt
      ? Math.floor((Date.now() - new Date(lead.lastContactAt).getTime()) / 86400000)
      : 999

    if (lead.temperature === 'cold') risks.push({ signal: 'Temperatura fria — lead pode estar desinteressado', severity: 'high' })
    if (daysSinceContact > 7) risks.push({ signal: `Sem contato ha ${daysSinceContact} dias`, severity: daysSinceContact > 14 ? 'high' : 'medium' })
    if (lead.deals.some(d => d.status === 'lost')) risks.push({ signal: 'Negocio anterior perdido', severity: 'medium' })
    if ((lead.aiScore ?? 0) < 30) risks.push({ signal: `Score muito baixo (${lead.aiScore ?? 0}%)`, severity: 'medium' })
    if (lead.activities.length === 0) risks.push({ signal: 'Nenhuma atividade recente registrada', severity: 'low' })
    if (lead.lostReason) risks.push({ signal: `Motivo de perda anterior: ${lead.lostReason}`, severity: 'high' })

    const level = risks.some(r => r.severity === 'high') ? 'high' : risks.some(r => r.severity === 'medium') ? 'medium' : risks.length > 0 ? 'low' : 'none'

    return NextResponse.json({ risks, level, totalRisks: risks.length })
  }

  if (action === 'generate-response') {
    const { prisma } = await import('@/lib/prisma')
    const lead = await prisma.lead.findUnique({
      where: { id: context?.leadId as string },
      include: { stage: true },
    })
    if (!lead) return NextResponse.json({ response: 'Lead nao encontrado' })

    const name = lead.firstName
    const course = lead.courseInterest || 'nossos cursos'
    let response = ''

    if (lead.temperature === 'hot') {
      response = `Oi ${name}! Tudo bem? Vi que voce tem bastante interesse em ${course}. Que tal agendarmos uma conversa para eu te apresentar as melhores opcoes? Tenho horarios disponiveis essa semana!`
    } else if (lead.temperature === 'warm') {
      response = `Ola ${name}! Espero que esteja bem. Queria te contar sobre as novidades em ${course}. Temos condicoes especiais esse mes. Posso te enviar mais detalhes?`
    } else {
      response = `Oi ${name}! Ha quanto tempo! Passando pra te contar que temos novidades incriveis em ${course}. Se ainda tiver interesse, adoraria bater um papo rapido. O que acha?`
    }

    return NextResponse.json({ response, context: { temperature: lead.temperature, course, stage: lead.stage?.name } })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
