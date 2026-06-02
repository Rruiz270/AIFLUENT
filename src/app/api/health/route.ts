import { NextResponse } from 'next/server'

export async function GET() {
  const checks: Record<string, boolean> = { api: true, database: false }

  try {
    const { prisma } = await import('@/lib/prisma')
    await prisma.organization.count()
    checks.database = true
  } catch {
    // database unreachable
  }

  const healthy = Object.values(checks).every(Boolean)
  return NextResponse.json(
    { status: healthy ? 'healthy' : 'degraded', checks, timestamp: new Date().toISOString() },
    { status: healthy ? 200 : 503 },
  )
}
