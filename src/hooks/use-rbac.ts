'use client'
import { useSession } from 'next-auth/react'
import { hasPermission, type Permission } from '@/lib/rbac'
import type { UserRole } from '@/lib/auth'

export function useRBAC() {
  const { data: session } = useSession()
  const role = (session?.user as Record<string, unknown>)?.role as UserRole | undefined

  function can(permission: Permission): boolean {
    if (!role) return false
    return hasPermission(role, permission)
  }

  return { role, can, isAdmin: role === 'admin', isGestor: role === 'gestor', isOperador: role === 'operador' }
}
