import { PrismaClient } from '@/generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./dev.db'
  const authToken = process.env.TURSO_AUTH_TOKEN

  // PostgreSQL: when DATABASE_URL points to a PostgreSQL instance,
  // switch provider at deploy time:
  //   1. Change prisma/schema.prisma  provider = "postgresql"
  //   2. Set DATABASE_URL=postgresql://...
  //   3. Replace this block with PrismaPg adapter (see POSTGRES_MIGRATION.md)
  //
  // For now, LibSQL/SQLite is the default for local development.

  const adapter = new PrismaLibSql({ url, authToken })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
