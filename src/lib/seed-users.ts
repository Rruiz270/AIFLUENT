import bcrypt from 'bcryptjs'

export const SEED_USERS = [
  {
    name: 'AIFLUENT Admin',
    email: 'admin@aifluent.com',
    password: 'Admin@2026',
    role: 'admin',
  },
  {
    name: 'Gestor AIFLUENT',
    email: 'gestor@aifluent.com',
    password: 'Gestor@2026',
    role: 'gestor',
  },
  {
    name: 'Operador AIFLUENT',
    email: 'operador@aifluent.com',
    password: 'Operador@2026',
    role: 'operador',
  },
]

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
