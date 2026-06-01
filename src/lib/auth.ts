import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export type UserRole = 'admin' | 'gestor' | 'operador'

export function canAccess(userRole: UserRole, requiredRole: UserRole): boolean {
  const hierarchy: Record<UserRole, number> = { admin: 3, gestor: 2, operador: 1 }
  return hierarchy[userRole] >= hierarchy[requiredRole]
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        // For now, accept any valid-looking credentials (demo mode)
        // In production, validate against DB with hashed passwords
        if (credentials?.email && credentials?.password) {
          return {
            id: 'admin-1',
            name: 'AIFLUENT',
            email: credentials.email as string,
            role: 'admin',
          }
        }
        return null
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
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
})
