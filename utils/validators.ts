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
  memberType: z.enum(['FREE', 'PREMIUM']).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const giftSchema = z.object({
  fullName: z.string().min(2, 'Full Name must be at least 2 characters'),
  age: z.coerce.number().min(18, 'Age must be 18 or above').max(120, 'Invalid age'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number (10 digits)'),
  email: z.string().email('Invalid email address'),
  houseNo: z.string().min(1, 'House/Flat/Office number is required'),
  area: z.string().min(2, 'Area/Street/Locality is required'),
  state: z.string().min(1, 'State is required'),
  district: z.string().min(1, 'District is required'),
  city: z.string().min(1, 'City is required'),
  pinCode: z.string().regex(/^\d{6}$/, 'PIN Code must be exactly 6 digits'),
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


// Types
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type AdminLoginInput = z.infer<typeof adminLoginSchema>
export type DepositInput = z.infer<typeof depositSchema>
export type WithdrawalInput = z.infer<typeof withdrawalSchema>
export type ContactInput = z.infer<typeof contactSchema>
export type GiftInput = z.infer<typeof giftSchema>
