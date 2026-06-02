import { describe, it, expect } from 'vitest'
import { z } from 'zod'

const updateLeadSchema = z.object({
  stageId: z.string().optional(),
  status: z
    .enum(['new', 'contacted', 'qualified', 'negotiating', 'converted', 'lost'])
    .optional(),
  temperature: z.enum(['cold', 'warm', 'hot']).optional(),
  consultantId: z.string().optional(),
})

describe('Leads CRUD Validation', () => {
  it('accepts valid stage update', () => {
    expect(updateLeadSchema.safeParse({ stageId: 's-prop' }).success).toBe(true)
  })
  it('accepts valid status update', () => {
    expect(
      updateLeadSchema.safeParse({ status: 'converted' }).success,
    ).toBe(true)
  })
  it('rejects invalid status', () => {
    expect(
      updateLeadSchema.safeParse({ status: 'invalid' }).success,
    ).toBe(false)
  })
  it('rejects invalid temperature', () => {
    expect(
      updateLeadSchema.safeParse({ temperature: 'boiling' }).success,
    ).toBe(false)
  })
  it('accepts empty update', () => {
    expect(updateLeadSchema.safeParse({}).success).toBe(true)
  })
  it('accepts multiple fields', () => {
    expect(
      updateLeadSchema.safeParse({
        stageId: 's-1',
        status: 'qualified',
        temperature: 'hot',
      }).success,
    ).toBe(true)
  })
})
