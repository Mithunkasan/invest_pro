/**
 * Utility functions for formatting and validation
 */

// ── Currency ──────────────────────────────────────────────────────────────────
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num)
}

// ── Date ──────────────────────────────────────────────────────────────────────
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const target = new Date(date)
  const diffMs = now.getTime() - target.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 7) return formatDate(date)
  if (diffDays > 0) return `${diffDays}d ago`
  if (diffHours > 0) return `${diffHours}h ago`
  if (diffMins > 0) return `${diffMins}m ago`
  return 'just now'
}

// ── Progress ──────────────────────────────────────────────────────────────────
export function calculateProgress(startDate: Date | string, endDate: Date | string): number {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  const now = Date.now()

  if (now >= end) return 100
  if (now <= start) return 0

  return Math.round(((now - start) / (end - start)) * 100)
}

export function getDaysRemaining(endDate: Date | string): number {
  const end = new Date(endDate).getTime()
  const now = Date.now()
  const diff = end - now
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

// ── Masking ───────────────────────────────────────────────────────────────────
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  const masked = local.charAt(0) + '*'.repeat(local.length - 2) + local.charAt(local.length - 1)
  return `${masked}@${domain}`
}

export function maskPhone(phone: string): string {
  return phone.replace(/(\d{2})\d{6}(\d{2})/, '$1******$2')
}

// ── Status Colors ─────────────────────────────────────────────────────────────
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ACTIVE: 'text-green-500 bg-green-500/10',
    APPROVED: 'text-green-500 bg-green-500/10',
    COMPLETED: 'text-blue-500 bg-blue-500/10',
    PENDING: 'text-yellow-500 bg-yellow-500/10',
    PROCESSING: 'text-blue-500 bg-blue-500/10',
    REJECTED: 'text-red-500 bg-red-500/10',
    FAILED: 'text-red-500 bg-red-500/10',
    CANCELLED: 'text-gray-500 bg-gray-500/10',
    SUSPENDED: 'text-red-500 bg-red-500/10',
    INACTIVE: 'text-gray-500 bg-gray-500/10',
  }
  return colors[status] || 'text-gray-500 bg-gray-500/10'
}

// ── Referral ──────────────────────────────────────────────────────────────────
export function generateReferralLink(code: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/register?ref=${code}`
}

// ── Truncate ──────────────────────────────────────────────────────────────────
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

// ── Percentage ────────────────────────────────────────────────────────────────
export function calculateROI(amount: number, roiPercent: number, days: number): number {
  return amount * (roiPercent / 100) * days
}
