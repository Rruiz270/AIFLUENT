import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, checkRateLimit, getOrgId } from '@/lib/api-auth'
import { apiLimiter } from '@/lib/rate-limit'
import { z } from 'zod'
import { logger } from '@/lib/logger'

export async function GET(request: Request) {
  const rl = checkRateLimit(request, apiLimiter); if (rl) return rl
  const { error, session } = await requireAuth(); if (error) return error
  const orgId = getOrgId(session)
  try {
    const { prisma } = await import('@/lib/prisma')
    const conversations = await prisma.conversation.findMany({
      where: orgId ? { organizationId: orgId } : {},
      orderBy: { lastMessageAt: 'desc' },
      take: 50,
      include: {
        lead: { select: { id: true, firstName: true, lastName: true, phone: true, whatsapp: true } },
        assignee: { select: { id: true, name: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    })
    return NextResponse.json({ conversations })
  } catch {
    return NextResponse.json({ conversations: [] })
  }
}

const sendMessageSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1),
  contentType: z.string().default('text'),
})

export async function POST(request: NextRequest) {
  const rl = checkRateLimit(request, apiLimiter); if (rl) return rl
  const { error, session } = await requireAuth(); if (error) return error
  try {
    const body = await request.json()
    const parsed = sendMessageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados invalidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { prisma } = await import('@/lib/prisma')
    const userId = (session!.user as Record<string, unknown>).id as string

    const message = await prisma.conversationMessage.create({
      data: {
        conversationId: parsed.data.conversationId,
        content: parsed.data.content,
        contentType: parsed.data.contentType,
        direction: 'outbound',
        senderId: userId,
      },
    })

    // Update conversation lastMessageAt
    await prisma.conversation.update({
      where: { id: parsed.data.conversationId },
      data: { lastMessageAt: new Date() },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (err) {
    logger.error('Send message error', err)
    return NextResponse.json({ error: 'Falha ao enviar mensagem' }, { status: 500 })
  }
}
