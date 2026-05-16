import { z } from 'zod'

// ── Auth Schemas ──────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
  referralCode: z.string().optional(),
  terms: z.boolean().refine((val) => val === true, { message: 'You must accept the terms' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const adminLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// ── Deposit Schema ────────────────────────────────────────────────────────────
export const depositSchema = z.object({
  amount: z.number().min(1000, 'Minimum deposit is ₹1,000').max(10000000, 'Maximum deposit is ₹1,00,00,000'),
  method: z.enum(['UPI', 'BANK_TRANSFER', 'QR_CODE']),
  utrNumber: z.string().min(10, 'UTR must be at least 10 characters'),
})

// ── Withdrawal Schema ─────────────────────────────────────────────────────────
export const withdrawalSchema = z.object({
  amount: z.number().min(100, 'Minimum withdrawal is ₹100'),
  walletType: z.enum(['MAIN', 'BONUS', 'REFERRAL']),
  bankName: z.string().min(2, 'Bank name is required'),
  accountNo: z.string().min(9, 'Invalid account number'),
  ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'),
  accountName: z.string().min(2, 'Account holder name is required'),
  upiId: z.string().optional(),
})

// ── Profile Schema ────────────────────────────────────────────────────────────
export const profileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// ── Contact Schema ────────────────────────────────────────────────────────────
export const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
})

// ── Investment Plan Schema (Admin) ────────────────────────────────────────────
export const investmentPlanSchema = z.object({
  name: z.string().min(2, 'Plan name is required'),
  description: z.string().min(10, 'Description is required'),
  minAmount: z.number().min(100, 'Minimum amount must be ₹100'),
  maxAmount: z.number(),
  roiPercent: z.number().min(0.1).max(100, 'ROI cannot exceed 100%'),
  durationDays: z.number().min(1, 'Duration must be at least 1 day'),
  features: z.array(z.string()).min(1, 'At least one feature is required'),
}).refine((data) => data.maxAmount > data.minAmount, {
  message: 'Maximum amount must be greater than minimum',
  path: ['maxAmount'],
})

// Types
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type AdminLoginInput = z.infer<typeof adminLoginSchema>
export type DepositInput = z.infer<typeof depositSchema>
export type WithdrawalInput = z.infer<typeof withdrawalSchema>
export type ContactInput = z.infer<typeof contactSchema>
export type InvestmentPlanInput = z.infer<typeof investmentPlanSchema>
