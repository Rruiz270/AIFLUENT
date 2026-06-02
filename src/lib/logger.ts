type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
  userId?: string
  organizationId?: string
}

class Logger {
  private serviceName = 'aifluent-crm'

  private formatEntry(entry: LogEntry): string {
    return JSON.stringify({
      service: this.serviceName,
      ...entry,
    })
  }

  info(message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = { level: 'info', message, timestamp: new Date().toISOString(), context }
    console.log(this.formatEntry(entry))
  }

  warn(message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = { level: 'warn', message, timestamp: new Date().toISOString(), context }
    console.warn(this.formatEntry(entry))
  }

  error(message: string, error?: unknown, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      context: {
        ...context,
        error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error),
      },
    }
    console.error(this.formatEntry(entry))
  }

  debug(message: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== 'production') {
      const entry: LogEntry = { level: 'debug', message, timestamp: new Date().toISOString(), context }
      console.log(this.formatEntry(entry))
    }
  }
}

export const logger = new Logger()
