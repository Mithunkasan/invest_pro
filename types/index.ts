/**
 * Global TypeScript types for the InvestPro platform
 */

// ── Enums ─────────────────────────────────────────────────────────────────────
export type Role = 'USER' | 'ADMIN'
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING'
export type PlanStatus = 'ACTIVE' | 'INACTIVE'
export type InvestmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'INVESTMENT' | 'PROFIT' | 'REFERRAL_BONUS' | 'BONUS' | 'LEVEL_INCOME' | 'REWARD' | 'SHARE_BONUS'
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
export type WalletType = 'MAIN' | 'BONUS' | 'REFERRAL' | 'LEVEL' | 'REWARD' | 'SHARE'
export type DepositMethod = 'UPI' | 'BANK_TRANSFER' | 'QR_CODE'
export type DepositStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type WithdrawalStatus = 'PENDING' | 'PROCESSING' | 'APPROVED' | 'REJECTED'
export type KYCStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'

// ── Models ────────────────────────────────────────────────────────────────────
export interface User {
  id: string
  name: string
  email: string
  phone?: string | null
  role: Role
  status: UserStatus
  referralCode: string
  referredById?: string | null
  starPerformer?: boolean
  tlRank?: boolean
  tlRankEarnedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface InvestmentPlan {
  id: string
  name: string
  description: string
  minAmount: number
  maxAmount: number
  roiPercent: number
  durationDays: number
  status: PlanStatus
  features: string[]
  color: string
  createdAt: Date
  updatedAt: Date
}

export interface Investment {
  id: string
  userId: string
  planId: string
  amount: number
  status: InvestmentStatus
  profit: number
  startDate: Date
  endDate: Date
  createdAt: Date
  plan?: InvestmentPlan
}

export interface Wallet {
  id: string
  userId: string
  mainBalance: number
  bonusBalance: number
  referralBalance: number
  rewardBalance: number
  levelBalance: number
  shareBalance: number
  updatedAt: Date
}

export interface Transaction {
  id: string
  userId: string
  type: TransactionType
  amount: number
  status: TransactionStatus
  reference?: string | null
  description?: string | null
  walletType: WalletType
  createdAt: Date
}

export interface Deposit {
  id: string
  userId: string
  amount: number
  method: DepositMethod
  proofUrl?: string | null
  utrNumber?: string | null
  status: DepositStatus
  remarks?: string | null
  approvedById?: string | null
  createdAt: Date
  user?: User
}

export interface Withdrawal {
  id: string
  userId: string
  amount: number
  walletType: WalletType
  status: WithdrawalStatus
  bankDetails: BankDetails
  upiId?: string | null
  remarks?: string | null
  approvedById?: string | null
  processedAt?: Date | null
  createdAt: Date
  user?: User
}

export interface BankDetails {
  bankName: string
  accountNo: string
  ifsc: string
  accountName: string
}

export interface Referral {
  id: string
  referrerId: string
  referredId: string
  commission: number
  level: number
  createdAt: Date
  referred?: User
}

export interface KYC {
  id: string
  userId: string
  aadhaarUrl?: string | null
  aadhaarNo?: string | null
  panUrl?: string | null
  panNo?: string | null
  selfieUrl?: string | null
  status: KYCStatus
  remarks?: string | null
  reviewedAt?: Date | null
  createdAt: Date
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  link?: string | null
  createdAt: Date
}

export interface Admin {
  id: string
  username: string
  email: string
  role: string
  createdAt: Date
}

export interface SystemSettings {
  id: string
  referralPercent: number
  level1Percent: number
  level2Percent: number
  level3Percent: number
  levelIncomeEnabled: boolean
  starPerformerThreshold: number
  starPerformerEnabled: boolean
  tlRankRequiredReferrals: number
  tlRankMaxUsers: number
  tlRankEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

// ── API Response Types ────────────────────────────────────────────────────────
export interface ApiResponse<T = null> {
  success: boolean
  message: string
  data?: T
  errors?: Record<string, string>
}

// ── Dashboard Types ───────────────────────────────────────────────────────────
export interface DashboardStats {
  totalInvestment: number
  currentBalance: number
  totalProfit: number
  referralIncome: number
  activePlans: number
  totalDeposited: number
  totalWithdrawn: number
}

export interface AdminStats {
  totalUsers: number
  totalInvestments: number
  totalDeposits: number
  pendingWithdrawals: number
  totalRevenue: number
  activeUsers: number
  pendingKYC: number
  pendingDeposits: number
}

// ── Chart Data Types ──────────────────────────────────────────────────────────
export interface ChartDataPoint {
  name: string
  value: number
  [key: string]: string | number
}

// ── Pagination ────────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
