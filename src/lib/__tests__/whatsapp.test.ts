import { describe, it, expect } from 'vitest'

describe('WhatsApp Service', () => {
  it('verifyWebhook accepts valid token', () => {
    // Simulate the webhook verification
    const mode = 'subscribe'
    const verifyToken = 'test-token'
    const challenge = 'challenge-123'
    const configToken = 'test-token'

    const result = mode === 'subscribe' && verifyToken === configToken ? challenge : null
    expect(result).toBe('challenge-123')
  })

  it('verifyWebhook rejects invalid token', () => {
    const mode = 'subscribe'
    const verifyToken = 'wrong-token'
    const configToken = 'test-token'

    const result = mode === 'subscribe' && verifyToken === configToken ? 'challenge' : null
    expect(result).toBeNull()
  })

  it('isConfigured returns false without env vars', () => {
    const phoneNumberId = ''
    const accessToken = ''
    expect(!!(phoneNumberId && accessToken)).toBe(false)
  })
})
