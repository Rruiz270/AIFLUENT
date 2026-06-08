import { describe, it, expect, vi } from 'vitest'
import crypto from 'crypto'
import { parseWebhook, verifySignature } from '../whatsapp-webhook'
import {
  persistInboundMessage,
  resolveOrgForPhoneNumber,
} from '../whatsapp-inbound'

describe('parseWebhook', () => {
  it('faz parse de texto + imagem + status', () => {
    const body = {
      object: 'whatsapp_business_account',
      entry: [
        {
          changes: [
            {
              value: {
                metadata: { phone_number_id: 'PN1' },
                contacts: [{ profile: { name: 'Maria' } }],
                messages: [
                  { id: 'wamid.1', from: '5511999', timestamp: '1', type: 'text', text: { body: 'oi' } },
                  { id: 'wamid.2', from: '5511999', timestamp: '2', type: 'image', image: { id: 'media1', mime_type: 'image/jpeg', caption: 'foto' } },
                ],
                statuses: [{ id: 'wamid.0', status: 'delivered', recipient_id: '5511999' }],
              },
            },
          ],
        },
      ],
    }
    const r = parseWebhook(body)
    expect(r.phoneNumberId).toBe('PN1')
    expect(r.contactName).toBe('Maria')
    expect(r.messages).toHaveLength(2)
    expect(r.messages[0]).toMatchObject({ content: 'oi', contentType: 'text' })
    expect(r.messages[1]).toMatchObject({ contentType: 'image', mediaId: 'media1', mediaType: 'image/jpeg' })
    expect(r.statuses[0]).toMatchObject({ externalId: 'wamid.0', status: 'delivered' })
  })
})

describe('verifySignature', () => {
  it('valida HMAC correto e rejeita os demais', () => {
    const sk = 'sek'
    const raw = '{"a":1}'
    const sig = 'sha256=' + crypto.createHmac('sha256', sk).update(raw, 'utf8').digest('hex')
    expect(verifySignature(raw, sig, sk)).toBe(true)
    expect(verifySignature(raw, 'sha256=00', sk)).toBe(false)
    expect(verifySignature(raw, null, sk)).toBe(false)
    expect(verifySignature(raw, sig, '')).toBe(false)
  })
})

function mkPrisma() {
  return {
    conversationMessage: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({}),
      updateMany: vi.fn().mockResolvedValue({}),
    },
    lead: { findFirst: vi.fn().mockResolvedValue(null), create: vi.fn().mockResolvedValue({ id: 'lead1' }) },
    activity: { create: vi.fn().mockResolvedValue({}) },
    tag: { findFirst: vi.fn().mockResolvedValue(null), create: vi.fn().mockResolvedValue({ id: 't1' }) },
    leadTag: { findFirst: vi.fn().mockResolvedValue(null), create: vi.fn().mockResolvedValue({}) },
    auditLog: { create: vi.fn().mockResolvedValue({}) },
    conversation: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 'conv1' }),
      update: vi.fn().mockResolvedValue({}),
    },
    organization: { count: vi.fn().mockResolvedValue(1), findFirst: vi.fn().mockResolvedValue({ id: 'org1' }) },
    integration: { findFirst: vi.fn().mockResolvedValue(null) },
  }
}

const inbound = {
  externalId: 'wamid.1',
  from: '5511999',
  timestamp: '1',
  type: 'text',
  content: 'oi',
  contentType: 'text',
}

describe('persistInboundMessage', () => {
  it('cria lead via funil + conversa + mensagem e atualiza historico', async () => {
    const prisma = mkPrisma()
    const r = await persistInboundMessage(prisma, 'org1', inbound, 'Maria')
    expect(r.deduped).toBe(false)
    expect(prisma.lead.create).toHaveBeenCalled()
    expect(prisma.conversation.create).toHaveBeenCalled()
    expect(prisma.conversationMessage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ direction: 'inbound', externalId: 'wamid.1' }),
      }),
    )
    expect(prisma.conversation.update).toHaveBeenCalled()
  })

  it('e idempotente quando a mensagem ja existe (mesmo wamid)', async () => {
    const prisma = mkPrisma()
    prisma.conversationMessage.findFirst.mockResolvedValue({ id: 'm1' })
    const r = await persistInboundMessage(prisma, 'org1', inbound, 'Maria')
    expect(r.deduped).toBe(true)
    expect(prisma.lead.create).not.toHaveBeenCalled()
    expect(prisma.conversationMessage.create).not.toHaveBeenCalled()
  })
})

describe('resolveOrgForPhoneNumber', () => {
  it('usa a unica organizacao no fallback single-tenant', async () => {
    const prisma = mkPrisma()
    delete process.env.WHATSAPP_ORG_ID
    expect(await resolveOrgForPhoneNumber(prisma, 'PN1')).toBe('org1')
  })
})
