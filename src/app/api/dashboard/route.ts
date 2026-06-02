import { NextResponse } from 'next/server'
import { requireAuth, checkRateLimit } from '@/lib/api-auth'
import { apiLimiter } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export async function GET(request: Request) {
  const rateLimited = checkRateLimit(request, apiLimiter)
  if (rateLimited) return rateLimited
  const { error, session } = await requireAuth()
  if (error) return error

  try {
    const { prisma } = await import('@/lib/prisma')
    const orgId = (session!.user as Record<string, unknown>).organizationId as string | undefined
    const where = orgId ? { organizationId: orgId } : {}

    const [totalLeads, newToday, activeDeals, totalRevenue, campaignsSent] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.count({ where: { ...where, createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
      prisma.deal.count({ where: { status: 'open', ...(orgId ? { lead: { organizationId: orgId } } : {}) } }),
      prisma.deal.aggregate({ _sum: { value: true }, where: { status: 'won', ...(orgId ? { lead: { organizationId: orgId } } : {}) } }),
      prisma.campaign.count({ where }),
    ])

    return NextResponse.json({
      totalLeads,
      newLeadsToday: newToday,
      conversionRate: totalLeads > 0 ? Math.round((activeDeals / totalLeads) * 1000) / 10 : 0,
      activeDeals,
      totalRevenue: totalRevenue._sum.value || 0,
      campaignsSent,
      responseRate: 0,
      avgResponseTime: 0,
    })
  } catch (err) {
    logger.error('Dashboard API error', err)
    return NextResponse.json({
      totalLeads: 0, newLeadsToday: 0, conversionRate: 0, activeDeals: 0,
      totalRevenue: 0, campaignsSent: 0, responseRate: 0, avgResponseTime: 0,
    })
  }
}
