import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTimeWallConfig, TIMEWALL_REFERENCE_PREFIX } from '@/lib/timewall'
import { syncWalletMainBalance } from '@/actions/walletUtils'

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

  const providedSecret = firstValue(params, ['secret', 'key', 'api_key', 'token'])
  if (config.postbackSecret && providedSecret !== config.postbackSecret) {
    return Response.json({ success: false, message: 'Invalid postback secret' }, { status: 401 })
  }

  const userId = firstValue(params, ['user_id', 'userid', 'userId', 'sub_id', 'subid', 'subId', 's1'])
  const rawAmount = firstValue(params, ['amount', 'reward', 'payout', 'currency_amount', 'currencyAmount'])
  const externalTransactionId = firstValue(params, ['transaction_id', 'transactionId', 'txid', 'tx_id', 'id'])

  const amount = Number(rawAmount)
  if (!userId || !Number.isFinite(amount) || amount <= 0) {
    return Response.json({ success: false, message: 'Invalid user or amount' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  })
  if (!user) {
    return Response.json({ success: false, message: 'User not found' }, { status: 404 })
  }

  const referenceId = externalTransactionId || `${userId}:${amount}:${Date.now()}`
  const reference = `${TIMEWALL_REFERENCE_PREFIX}${referenceId}`
  const existing = await prisma.transaction.findFirst({ where: { reference } })
  if (existing) {
    return Response.json({ success: true, message: 'Duplicate postback ignored' })
  }

  const commissionPercent = Math.min(100, Math.max(0, config.commissionPercent))
  const adminCommission = Number(((amount * commissionPercent) / 100).toFixed(2))
  const userAmount = Number((amount - adminCommission).toFixed(2))

  await prisma.$transaction(async (tx) => {
    await tx.transaction.create({
      data: {
        userId,
        type: 'BONUS',
        amount: userAmount,
        status: 'PENDING',
        walletType: 'BONUS',
        reference,
        description: `TimeWall task reward pending admin verification. Gross: Rs ${amount}, Admin commission: Rs ${adminCommission} (${commissionPercent}%).`,
      },
    })

    await tx.notification.create({
      data: {
        userId,
        title: 'TimeWall Reward Pending ⏳',
        message: `Your TimeWall reward of Rs ${userAmount.toLocaleString('en-IN')} has been detected and is pending admin verification.`,
        type: 'INFO',
        link: '/dashboard/wallet',
      },
    })
  })

  return Response.json({
    success: true,
    grossAmount: amount,
    adminCommission,
    userAmount,
    commissionPercent,
  })
}

export async function GET(request: NextRequest) {
  return handlePostback(request)
}

export async function POST(request: NextRequest) {
  return handlePostback(request)
}
