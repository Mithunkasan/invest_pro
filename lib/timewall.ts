import { promises as fs } from 'fs'
import path from 'path'
import type { Prisma, PrismaClient } from '@prisma/client'

export const TIMEWALL_REFERENCE_PREFIX = 'TIMEWALL:'

export interface TimeWallConfig {
  username: string
  password: string
  placementId: string
  offerwallUrl: string
  commissionPercent: number
  postbackSecret: string
}

const configPath = path.join(process.cwd(), '.timewall-settings.json')

const defaultConfig: TimeWallConfig = {
  username: process.env.TIMEWALL_USERNAME || 'vrgalaxynetworksceo@gmail.com',
  password: process.env.TIMEWALL_PASSWORD || 'Abcd@1234',
  placementId: process.env.TIMEWALL_PLACEMENT_ID || '',
  offerwallUrl: process.env.TIMEWALL_OFFERWALL_URL || 'https://timewall.io/users/login',
  commissionPercent: Number(process.env.TIMEWALL_COMMISSION_PERCENT ?? 20),
  postbackSecret: process.env.TIMEWALL_POSTBACK_SECRET || '',
}

function normalizeOfferwallUrl(value: string) {
  const trimmed = value.trim()
  return trimmed === 'https://timewall.io/tasks' ? 'https://timewall.io/users/login' : trimmed
}

function normalizePercent(value: unknown, fallback = 20) {
  const percent = Number(value)
  if (!Number.isFinite(percent)) return fallback
  return Math.min(100, Math.max(0, percent))
}

export async function getTimeWallConfig(): Promise<TimeWallConfig> {
  try {
    const raw = await fs.readFile(configPath, 'utf8')
    const parsed = JSON.parse(raw) as Partial<TimeWallConfig>
    return {
      ...defaultConfig,
      ...parsed,
      commissionPercent: normalizePercent(parsed.commissionPercent, defaultConfig.commissionPercent),
    }
  } catch {
    return {
      ...defaultConfig,
      commissionPercent: normalizePercent(defaultConfig.commissionPercent, 20),
    }
  }
}

export async function updateTimeWallConfig(data: Partial<TimeWallConfig>) {
  const current = await getTimeWallConfig()
  const next: TimeWallConfig = {
    username: String(data.username ?? current.username).trim(),
    password: String(data.password ?? current.password),
    placementId: String(data.placementId ?? current.placementId).trim(),
    offerwallUrl: normalizeOfferwallUrl(String(data.offerwallUrl ?? current.offerwallUrl)),
    commissionPercent: normalizePercent(data.commissionPercent, current.commissionPercent),
    postbackSecret: String(data.postbackSecret ?? current.postbackSecret).trim(),
  }

  await fs.writeFile(configPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8')
  return next
}

export function buildTimeWallUrl(config: TimeWallConfig, user: { id: string; email: string; name: string }) {
  const encodedUserId = encodeURIComponent(user.id)
  const encodedEmail = encodeURIComponent(user.email)
  const encodedName = encodeURIComponent(user.name)

  const withPlaceholders = normalizeOfferwallUrl(config.offerwallUrl)
    .replaceAll('{userId}', encodedUserId)
    .replaceAll('{user_id}', encodedUserId)
    .replaceAll('{subId}', encodedUserId)
    .replaceAll('{sub_id}', encodedUserId)
    .replaceAll('{email}', encodedEmail)
    .replaceAll('{name}', encodedName)
    .replaceAll('{placementId}', encodeURIComponent(config.placementId))
    .replaceAll('{placement_id}', encodeURIComponent(config.placementId))

  const url = new URL(withPlaceholders)
  if (config.placementId) {
    url.searchParams.set('oid', config.placementId)
  }
  url.searchParams.set('uid', user.id)

  if (config.placementId && !url.searchParams.has('placement_id')) {
    url.searchParams.set('placement_id', config.placementId)
  }
  if (!url.searchParams.has('user_id')) url.searchParams.set('user_id', user.id)
  if (!url.searchParams.has('sub_id')) url.searchParams.set('sub_id', user.id)
  if (!url.searchParams.has('s1')) url.searchParams.set('s1', user.id)
  if (!url.searchParams.has('email')) url.searchParams.set('email', user.email)
  return url.toString()
}

type TransactionAggregateClient = Pick<PrismaClient, 'transaction'> | {
  transaction: {
    aggregate: Prisma.TransactionDelegate['aggregate']
  }
}

export async function getTaskWalletBalance(userId: string, prismaClient: TransactionAggregateClient) {
  const result = await prismaClient.transaction.aggregate({
    where: {
      userId,
      status: 'COMPLETED',
      reference: {
        startsWith: TIMEWALL_REFERENCE_PREFIX,
      },
    },
    _sum: {
      amount: true,
    },
  })

  return result._sum.amount || 0
}
