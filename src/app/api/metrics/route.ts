import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, checkRateLimit } from '@/lib/api-auth'
import { apiLimiter } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  const rl = checkRateLimit(request, apiLimiter)
  if (rl) return rl
  const { error } = await requireAuth()
  if (error) return error

  try {
    const { prisma } = await import('@/lib/prisma')
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [stageChanges, dealsWon, dealsLost, notesCreated, tasksCreated, totalActivities] =
      await Promise.all([
        prisma.activity.count({
          where: { type: 'stage_change', createdAt: { gte: today } },
        }),
        prisma.activity.count({
          where: { type: 'deal_won', createdAt: { gte: today } },
        }),
        prisma.activity.count({
          where: { type: 'deal_lost', createdAt: { gte: today } },
        }),
        prisma.activity.count({
          where: { type: 'note', createdAt: { gte: today } },
        }),
        prisma.task.count({
          where: { createdAt: { gte: today } },
        }),
        prisma.activity.count({
          where: { createdAt: { gte: today } },
        }),
      ])

    return NextResponse.json({
      stageChanges,
      dealsWon,
      dealsLost,
      notesCreated,
      tasksCreated,
      totalActivities,
      date: today.toISOString(),
    })
  } catch {
    return NextResponse.json({
      stageChanges: 0,
      dealsWon: 0,
      dealsLost: 0,
      notesCreated: 0,
      tasksCreated: 0,
      totalActivities: 0,
    })
  }
}
