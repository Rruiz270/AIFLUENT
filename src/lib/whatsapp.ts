const WHATSAPP_API_URL = 'https://graph.facebook.com/v21.0'

interface WhatsAppConfig {
  phoneNumberId: string
  accessToken: string
  businessAccountId: string
  webhookVerifyToken: string
}

function getConfig(): WhatsAppConfig {
  return {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '',
  }
}

export class WhatsAppService {
  private config: WhatsAppConfig

  constructor() {
    this.config = getConfig()
  }

  get isConfigured(): boolean {
    return !!(this.config.phoneNumberId && this.config.accessToken)
  }

  async sendTextMessage(
    to: string,
    text: string,
  ): Promise<{ messageId: string } | { error: string }> {
    if (!this.isConfigured)
      return { error: 'WhatsApp nao configurado. Configure as variaveis WHATSAPP_*' }
    try {
      const res = await fetch(
        `${WHATSAPP_API_URL}/${this.config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to,
            type: 'text',
            text: { preview_url: false, body: text },
          }),
        },
      )
      const data = await res.json()
      if (data.messages?.[0]?.id) return { messageId: data.messages[0].id }
      return { error: data.error?.message || 'Falha ao enviar' }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Erro de conexao' }
    }
  }

  async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string,
    components?: unknown[],
  ): Promise<{ messageId: string } | { error: string }> {
    if (!this.isConfigured) return { error: 'WhatsApp nao configurado' }
    try {
      const res = await fetch(
        `${WHATSAPP_API_URL}/${this.config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to,
            type: 'template',
            template: {
              name: templateName,
              language: { code: languageCode },
              components,
            },
          }),
        },
      )
      const data = await res.json()
      if (data.messages?.[0]?.id) return { messageId: data.messages[0].id }
      return { error: data.error?.message || 'Falha ao enviar template' }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Erro de conexao' }
    }
  }

  async sendMediaMessage(
    to: string,
    type: 'image' | 'document' | 'audio' | 'video',
    mediaUrl: string,
    caption?: string,
  ): Promise<{ messageId: string } | { error: string }> {
    if (!this.isConfigured) return { error: 'WhatsApp nao configurado' }
    try {
      const body: Record<string, unknown> = {
        messaging_product: 'whatsapp',
        to,
        type,
        [type]: { link: mediaUrl },
      }
      if (caption && (type === 'image' || type === 'document')) {
        ;(body[type] as Record<string, unknown>).caption = caption
      }
      const res = await fetch(
        `${WHATSAPP_API_URL}/${this.config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        },
      )
      const data = await res.json()
      if (data.messages?.[0]?.id) return { messageId: data.messages[0].id }
      return { error: data.error?.message || 'Falha ao enviar midia' }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Erro de conexao' }
    }
  }

  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.config.webhookVerifyToken) {
      return challenge
    }
    return null
  }
}

export const whatsapp = new WhatsAppService()
