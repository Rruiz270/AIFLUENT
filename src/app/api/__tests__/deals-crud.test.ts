import { describe, it, expect } from 'vitest'
import { z } from 'zod'

const updateDealSchema = z.object({
  status: z.enum(['open', 'won', 'lost']).optional(),
  value: z.number().optional(),
  probability: z.number().min(0).max(100).optional(),
})

describe('Deals CRUD Validation', () => {
  it('accepts valid won status', () => {
    expect(updateDealSchema.safeParse({ status: 'won' }).success).toBe(true)
  })
  it('accepts valid lost status', () => {
    expect(updateDealSchema.safeParse({ status: 'lost' }).success).toBe(true)
  })
  it('rejects invalid status', () => {
    expect(updateDealSchema.safeParse({ status: 'maybe' }).success).toBe(false)
  })
  it('rejects probability > 100', () => {
    expect(
      updateDealSchema.safeParse({ probability: 150 }).success,
    ).toBe(false)
  })
  it('accepts value update', () => {
    expect(updateDealSchema.safeParse({ value: 5000 }).success).toBe(true)
  })
})
