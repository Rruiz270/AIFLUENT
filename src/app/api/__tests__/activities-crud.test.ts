import { describe, it, expect } from 'vitest'
import { z } from 'zod'

const createActivitySchema = z.object({
  type: z.enum([
    'note',
    'call',
    'email',
    'meeting',
    'task',
    'stage_change',
    'deal_won',
    'deal_lost',
    'deal_updated',
    'custom',
  ]),
  title: z.string().min(1),
  description: z.string().optional(),
  leadId: z.string().min(1),
})

describe('Activities CRUD Validation', () => {
  it('accepts valid note', () => {
    expect(
      createActivitySchema.safeParse({ type: 'note', title: 'Test', leadId: 'l1' }).success,
    ).toBe(true)
  })
  it('rejects empty title', () => {
    expect(
      createActivitySchema.safeParse({ type: 'note', title: '', leadId: 'l1' }).success,
    ).toBe(false)
  })
  it('rejects missing leadId', () => {
    expect(
      createActivitySchema.safeParse({ type: 'note', title: 'Test' }).success,
    ).toBe(false)
  })
  it('rejects invalid type', () => {
    expect(
      createActivitySchema.safeParse({ type: 'unknown', title: 'Test', leadId: 'l1' }).success,
    ).toBe(false)
  })
  it('accepts all valid types', () => {
    for (const type of [
      'note',
      'call',
      'email',
      'meeting',
      'stage_change',
      'deal_won',
      'deal_lost',
    ]) {
      expect(
        createActivitySchema.safeParse({ type, title: 'T', leadId: 'l1' }).success,
      ).toBe(true)
    }
  })
})
