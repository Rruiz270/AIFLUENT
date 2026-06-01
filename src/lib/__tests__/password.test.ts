import { describe, it, expect } from 'vitest'
import bcrypt from 'bcryptjs'

describe('Password Hashing', () => {
  it('hashes password correctly', async () => {
    const hash = await bcrypt.hash('Admin@2026', 10)
    expect(hash).toBeTruthy()
    expect(hash).not.toBe('Admin@2026')
    expect(hash.startsWith('$2')).toBe(true)
  })

  it('verifies correct password', async () => {
    const hash = await bcrypt.hash('Test@123', 10)
    expect(await bcrypt.compare('Test@123', hash)).toBe(true)
  })

  it('rejects wrong password', async () => {
    const hash = await bcrypt.hash('Test@123', 10)
    expect(await bcrypt.compare('Wrong@123', hash)).toBe(false)
  })

  it('different hashes for same password', async () => {
    const h1 = await bcrypt.hash('Same@123', 10)
    const h2 = await bcrypt.hash('Same@123', 10)
    expect(h1).not.toBe(h2) // salt makes them different
    expect(await bcrypt.compare('Same@123', h1)).toBe(true)
    expect(await bcrypt.compare('Same@123', h2)).toBe(true)
  })
})
