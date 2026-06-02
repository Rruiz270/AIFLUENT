import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, checkRateLimit, getOrgId } from '@/lib/api-auth'
import { apiLimiter } from '@/lib/rate-limit'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const createDealSchema = z.object({
  title: z.string().min(1),
  value: z.number().optional(),
  probability: z.number().min(0).max(100).default(50),
  status: z.string().default('open'),
  leadId: z.string(),
  stageId: z.string(),
  expectedCloseAt: z.string().optional(),
})

export async function GET(request: Request) {
  const rl = checkRateLimit(request, apiLimiter); if (rl) return rl
  const { error, session } = await requireAuth(); if (error) return error
  const orgId = getOrgId(session)
  try {
    const { prisma } = await import('@/lib/prisma')
    const deals = await prisma.deal.findMany({
      where: orgId ? { lead: { organizationId: orgId } } : {},
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        lead: { select: { id: true, firstName: true, lastName: true, company: true } },
        stage: { select: { id: true, name: true, color: true } },
      },
    })
    return NextResponse.json({ deals })
  } catch {
    return NextResponse.json({ deals: [] })
  }
}

export async function POST(request: NextRequest) {
  const rl = checkRateLimit(request, apiLimiter); if (rl) return rl
  const { error } = await requireAuth(); if (error) return error
  try {
    const body = await request.json()
    const parsed = createDealSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados invalidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { prisma } = await import('@/lib/prisma')
    const deal = await prisma.deal.create({
      data: {
        ...parsed.data,
        expectedCloseAt: parsed.data.expectedCloseAt ? new Date(parsed.data.expectedCloseAt) : undefined,
      },
    })
    return NextResponse.json(deal, { status: 201 })
  } catch (err) {
    logger.error('Create deal error', err)
    return NextResponse.json({ error: 'Falha ao criar negocio' }, { status: 500 })
  }
}
