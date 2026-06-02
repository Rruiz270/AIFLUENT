import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, checkRateLimit, getOrgId } from '@/lib/api-auth'
import { apiLimiter } from '@/lib/rate-limit'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const createTaskSchema = z.object({
  title: z.string().min(1),
  type: z.string().default('task'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
  description: z.string().optional(),
})

export async function GET(request: Request) {
  const rl = checkRateLimit(request, apiLimiter); if (rl) return rl
  const { error, session } = await requireAuth(); if (error) return error
  const orgId = getOrgId(session)
  try {
    const { prisma } = await import('@/lib/prisma')
    const tasks = await prisma.task.findMany({
      where: orgId ? { organizationId: orgId } : {},
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        assignee: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } },
      },
    })
    return NextResponse.json({ tasks })
  } catch {
    return NextResponse.json({ tasks: [] })
  }
}

export async function POST(request: NextRequest) {
  const rl = checkRateLimit(request, apiLimiter); if (rl) return rl
  const { error, session } = await requireAuth(); if (error) return error
  try {
    const body = await request.json()
    const parsed = createTaskSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados invalidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { prisma } = await import('@/lib/prisma')
    const userId = (session!.user as Record<string, unknown>).id as string
    const taskOrgId = getOrgId(session)

    let resolvedOrgId = taskOrgId
    if (!resolvedOrgId) {
      const org = await prisma.organization.findFirst()
      if (org) { resolvedOrgId = org.id } else {
        const newOrg = await prisma.organization.create({ data: { name: 'AIFLUENT', slug: 'aifluent' } })
        resolvedOrgId = newOrg.id
      }
    }

    const task = await prisma.task.create({
      data: {
        ...parsed.data,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
        creatorId: userId,
        organizationId: resolvedOrgId,
      },
    })
    return NextResponse.json(task, { status: 201 })
  } catch (err) {
    logger.error('Create task error', err)
    return NextResponse.json({ error: 'Falha ao criar tarefa' }, { status: 500 })
  }
}
