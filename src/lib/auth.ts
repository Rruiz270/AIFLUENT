import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

export type UserRole = 'admin' | 'gestor' | 'operador'

const roleHierarchy: Record<UserRole, number> = { admin: 3, gestor: 2, operador: 1 }

export function canAccess(userRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

// Seed users for first-time setup. These plaintext passwords are ONLY used once
// during initial DB seeding — they are immediately hashed with bcrypt and the
// plaintext is never stored. After first login, users should change their passwords.
const SEED_USERS = [
  { name: 'AIFLUENT Admin', email: 'admin@aifluent.com', password: 'Admin@2026', role: 'admin' as UserRole },
  { name: 'Gestor AIFLUENT', email: 'gestor@aifluent.com', password: 'Gestor@2026', role: 'gestor' as UserRole },
  { name: 'Operador AIFLUENT', email: 'operador@aifluent.com', password: 'Operador@2026', role: 'operador' as UserRole },
]

async function authenticateWithDB(email: string, password: string) {
  try {
    const { prisma } = await import('@/lib/prisma')

    // First-time setup: seed default users if DB is empty
    const count = await prisma.user.count()
    if (count === 0) {
      let org = await prisma.organization.findFirst()
      if (!org) org = await prisma.organization.create({ data: { name: 'AIFLUENT', slug: 'aifluent' } })
      for (const u of SEED_USERS) {
        await prisma.user.create({
          data: { name: u.name, email: u.email, passwordHash: await bcrypt.hash(u.password, 10), role: u.role, organizationId: org.id },
        })
      }
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (!user || !user.isActive) return null

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return null

    try { await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }) } catch {}

    return { id: user.id, name: user.name, email: user.email, role: user.role as UserRole, organizationId: user.organizationId }
  } catch {
    return null
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        return authenticateWithDB(email, password)
      },
    }),
  ],
  pages: { signIn: '/login' },
  callbacks: {
    authorized({ auth: session, request }) {
      const isLoggedIn = !!session?.user
      const isOnLogin = request.nextUrl.pathname.startsWith('/login')
      if (isOnLogin) return true
      return isLoggedIn
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as unknown as { role: string }).role
        token.id = (user as unknown as { id: string }).id
        token.organizationId = (user as unknown as { organizationId: string }).organizationId
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        const u = session.user as unknown as Record<string, unknown>
        u.role = token.role
        u.id = token.id
        u.organizationId = token.organizationId
      }
      return session
    },
  },
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
})
