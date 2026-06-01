import { describe, it, expect } from 'vitest'
import { z } from 'zod'

const createCampaignSchema = z.object({
  name: z.string().min(1),
  type: z.string().default('broadcast'),
  channel: z.string().default('whatsapp'),
})

describe('Campaigns API Validation', () => {
  it('rejects empty campaign name', () => {
    expect(createCampaignSchema.safeParse({ name: '' }).success).toBe(false)
  })
  it('accepts valid campaign', () => {
    expect(createCampaignSchema.safeParse({ name: 'Black Friday' }).success).toBe(true)
  })
  it('defaults channel to whatsapp', () => {
    const r = createCampaignSchema.safeParse({ name: 'Test' })
    expect(r.success && r.data.channel).toBe('whatsapp')
  })
  it('defaults type to broadcast', () => {
    const r = createCampaignSchema.safeParse({ name: 'Test' })
    expect(r.success && r.data.type).toBe('broadcast')
  })
})
