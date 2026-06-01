import { describe, it, expect } from 'vitest'
import { z } from 'zod'

const moveLeadSchema = z.object({
  leadId: z.string().min(1),
  stageId: z.string().min(1),
  newOrder: z.number().int().nonnegative().optional().default(0),
})

describe('Pipeline API Validation', () => {
  it('rejects empty leadId', () => {
    expect(moveLeadSchema.safeParse({ leadId: '', stageId: 'abc' }).success).toBe(false)
  })
  it('rejects empty stageId', () => {
    expect(moveLeadSchema.safeParse({ leadId: 'abc', stageId: '' }).success).toBe(false)
  })
  it('accepts valid move', () => {
    const r = moveLeadSchema.safeParse({ leadId: 'l1', stageId: 's1', newOrder: 2 })
    expect(r.success).toBe(true)
  })
  it('defaults newOrder to 0', () => {
    const r = moveLeadSchema.safeParse({ leadId: 'l1', stageId: 's1' })
    expect(r.success && r.data.newOrder).toBe(0)
  })
  it('rejects negative newOrder', () => {
    expect(moveLeadSchema.safeParse({ leadId: 'l1', stageId: 's1', newOrder: -1 }).success).toBe(false)
  })
})
