import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTimeWallConfig, TIMEWALL_REFERENCE_PREFIX } from '@/lib/timewall'
import { syncWalletMainBalance } from '@/actions/walletUtils'
import { promises as fs } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

function firstValue(params: URLSearchParams, keys: string[]) {
  for (const key of keys) {
    const value = params.get(key)
    if (value) return value
  }
  return ''
}

async function parseParams(request: NextRequest) {
  const params = new URL(request.url).searchParams

  if (request.method === 'POST') {
    const contentType = request.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const body = await request.json().catch(() => null)
      if (body && typeof body === 'object') {
        for (const [key, value] of Object.entries(body)) {
          if (value !== undefined && value !== null) params.set(key, String(value))
        }
      }
    } else {
      const form = await request.formData().catch(() => null)
      form?.forEach((value, key) => params.set(key, String(value)))
    }
  }

  return params
}

async function handlePostback(request: NextRequest) {
  const params = await parseParams(request)
  const config = await getTimeWallConfig()

  // Log request details to timewall_postback.log in the workspace root
  try {
    const logData = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
      params: Object.fromEntries(params.entries()),
    }
    const logPath = path.join(process.cwd(), 'timewall_postback.log')
    await fs.appendFile(logPath, JSON.stringify(logData, null, 2) + '\n\n', 'utf8')
  } catch (err) {
    console.error('Failed to log TimeWall postback request:', err)
  }

  const providedSecret = firstValue(params, ['secret', 'key', 'api_key', 'token'])
  if (config.postbackSecret && providedSecret !== config.postbackSecret) {
    return new Response('Invalid postback secret', { status: 401 })
  }

  const userId = firstValue(params, [
    'user_id',
    'userid',
    'userId',
    'external_user_id',
    'externalUserId',
    'externaluserid',
    'sub_id',
    'subid',
    'subId',
    's1',
    'uid',
    'custom',
    'user'
  ])
  
  // Extract TimeWall points specifically. We must NOT calculate the reward using the USD payout.
  let rawPoints = params.get('points') || 
                  params.get('currency_amount') || 
                  params.get('currencyAmount') ||
                  params.get('currencyamount') ||
                  params.get('placement_currency_amount') ||
                  params.get('placementCurrencyAmount') ||
                  params.get('placementcurrencyamount') ||
                  params.get('rate_points') ||
                  params.get('ratePoints') ||
                  params.get('ratepoints')

  if (!rawPoints && params.get('amount')) {
    const amountVal = Number(params.get('amount'))
    const payoutVal = params.get('payout') ? Number(params.get('payout')) : null
    if (payoutVal !== null && amountVal !== payoutVal) {
      rawPoints = params.get('amount')
    } else if (amountVal >= 1) {
      rawPoints = params.get('amount')
    }
  }
  if (!rawPoints && params.get('reward')) {
    const rewardVal = Number(params.get('reward'))
    const payoutVal = params.get('payout') ? Number(params.get('payout')) : null
    if (payoutVal !== null && rewardVal !== payoutVal) {
      rawPoints = params.get('reward')
    } else if (rewardVal >= 1) {
      rawPoints = params.get('reward')
    }
  }

  const points = Number(rawPoints)
  const externalTransactionId = firstValue(params, [
    'transaction_id',
    'transactionId',
    'txid',
    'tx_id',
    'id',
    'withdraw_id',
    'withdrawId',
    'withdrawid'
  ])

  if (!userId || !Number.isFinite(points) || points <= 0) {
    return new Response('Invalid user or points', { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      membershipPlanId: true,
      membershipPlan: {
        select: {
          price: true,
          timeWallPercent: true,
        }
      }
    },
  })
  if (!user) {
    return new Response('User not found', { status: 404 })
  }

  const referenceId = externalTransactionId || `${userId}:${points}:${Date.now()}`
  const reference = `${TIMEWALL_REFERENCE_PREFIX}${referenceId}`
  const existing = await prisma.transaction.findFirst({ where: { reference } })
  if (existing) {
    return new Response('1', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    })
  }

  const systemSettings = await prisma.systemSettings.findUnique({
    where: { id: 'default' },
    select: { timeWallPercentFree: true }
  })
  const timeWallPercentFree = systemSettings?.timeWallPercentFree ?? 0.005

  const isFree = !user.membershipPlan || user.membershipPlan.price === 0
  const configuredMultiplier = isFree
    ? timeWallPercentFree
    : (user.membershipPlan?.timeWallPercent ?? 0.005)

  // Exact calculated value (no rounding to integer)
  const userAmount = points * configuredMultiplier

  await prisma.$transaction(async (tx) => {
    await tx.transaction.create({
      data: {
        userId,
        type: 'BONUS',
        amount: userAmount,
        status: 'PENDING',
        walletType: 'TASK',
        reference,
        description: `TimeWall Reward: ₹${userAmount.toFixed(2)}`,
      },
    })

    await tx.notification.create({
      data: {
        userId,
        title: 'TimeWall Reward',
        message: `TimeWall reward: ₹${userAmount.toFixed(2)}`,
        type: 'INFO',
        link: '/dashboard/wallet',
      },
    })
  })

  return new Response('1', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  })
}

export async function GET(request: NextRequest) {
  return handlePostback(request)
}

export async function POST(request: NextRequest) {
  return handlePostback(request)
}
