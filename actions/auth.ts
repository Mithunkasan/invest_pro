'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { hashPassword, comparePassword, setSession, clearSession } from '@/lib/auth'
import { loginSchema, registerSchema, adminLoginSchema } from '@/utils/validators'
import type { ApiResponse } from '@/types'

// ── User Login ────────────────────────────────────────────────────────────────
export async function loginAction(
  formData: FormData
): Promise<ApiResponse> {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, message: 'Validation failed', errors: parsed.error.flatten().fieldErrors as Record<string, string> }
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (!user) {
    return { success: false, message: 'Invalid email or password' }
  }

  const valid = await comparePassword(parsed.data.password, user.passwordHash)
  if (!valid) {
    return { success: false, message: 'Invalid email or password' }
  }

  if (user.status === 'SUSPENDED') {
    return { success: false, message: 'Your account has been suspended. Please contact support.' }
  }

  await setSession({ id: user.id, email: user.email, name: user.name, role: 'USER', type: 'user' })
  redirect('/dashboard')
}

// ── User Register ─────────────────────────────────────────────────────────────
export async function registerAction(
  formData: FormData
): Promise<ApiResponse> {
  const raw = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
    referralCode: formData.get('referralCode') as string || undefined,
    terms: formData.get('terms') === 'on' ? true : undefined,
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, message: 'Validation failed', errors: parsed.error.flatten().fieldErrors as Record<string, string> }
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: parsed.data.email }, { phone: parsed.data.phone }] },
  })

  if (existing) {
    return { success: false, message: 'Email or phone already registered' }
  }

  let referredById: string | undefined
  if (parsed.data.referralCode) {
    const referrer = await prisma.user.findUnique({
      where: { referralCode: parsed.data.referralCode },
    })
    if (referrer) referredById = referrer.id
  }

  const passwordHash = await hashPassword(parsed.data.password)

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      passwordHash,
      referredById,
    },
  })

  // Create wallet for new user
  await prisma.wallet.create({
    data: { userId: user.id },
  })

  // Create referral record if applicable
  if (referredById) {
    await prisma.referral.create({
      data: {
        referrerId: referredById,
        referredId: user.id,
        commission: 0,
        level: 1,
      },
    })
  }

  // Welcome notification
  await prisma.notification.create({
    data: {
      userId: user.id,
      title: 'Welcome to InvestPro! 🎉',
      message: 'Your account has been created. Complete your KYC to start investing.',
      type: 'SUCCESS',
    },
  })

  return { success: true, message: 'Account created successfully! Please login.' }
}

// ── Admin Login ───────────────────────────────────────────────────────────────
export async function adminLoginAction(
  formData: FormData
): Promise<ApiResponse> {
  const raw = {
    username: formData.get('username') as string,
    password: formData.get('password') as string,
  }

  const parsed = adminLoginSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, message: 'Validation failed' }
  }

  const admin = await prisma.admin.findUnique({ where: { username: parsed.data.username } })
  if (!admin) {
    return { success: false, message: 'Invalid credentials' }
  }

  const valid = await comparePassword(parsed.data.password, admin.passwordHash)
  if (!valid) {
    return { success: false, message: 'Invalid credentials' }
  }

  await setSession({ id: admin.id, email: admin.email, name: admin.username, role: 'ADMIN', type: 'admin' })
  redirect('/admin/dashboard')
}

// ── Logout ────────────────────────────────────────────────────────────────────
export async function logoutAction() {
  await clearSession('user')
  redirect('/login')
}

export async function adminLogoutAction() {
  await clearSession('admin')
  redirect('/admin')
}
