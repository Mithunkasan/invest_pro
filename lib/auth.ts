import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
)
const JWT_EXPIRES = '7d'

// ── Token Types ───────────────────────────────────────────────────────────────
export interface UserTokenPayload {
  id: string
  email: string
  name: string
  role: 'USER' | 'ADMIN'
  type: 'user' | 'admin'
  memberType?: 'FREE' | 'PREMIUM'
}

// ── JWT Helpers ───────────────────────────────────────────────────────────────
export async function signToken(payload: UserTokenPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES)
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<UserTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as UserTokenPayload
  } catch {
    return null
  }
}

// ── Password Helpers ──────────────────────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

// ── Session Helpers ───────────────────────────────────────────────────────────
export async function getSession(): Promise<UserTokenPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('investpro_token')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function getAdminSession(): Promise<UserTokenPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('investpro_admin_token')?.value
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload || payload.type !== 'admin') return null
  return payload
}

export async function setSession(payload: UserTokenPayload): Promise<void> {
  const token = await signToken(payload)
  const cookieStore = await cookies()
  const cookieName = payload.type === 'admin' ? 'investpro_admin_token' : 'investpro_token'
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function clearSession(type: 'user' | 'admin' = 'user'): Promise<void> {
  const cookieStore = await cookies()
  const cookieName = type === 'admin' ? 'investpro_admin_token' : 'investpro_token'
  cookieStore.set(cookieName, '', { maxAge: 0, path: '/' })
}
