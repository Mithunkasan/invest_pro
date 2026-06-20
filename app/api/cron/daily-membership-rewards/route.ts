import { creditAllDueMembershipYields } from '@/lib/depositYield'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const result = await creditAllDueMembershipYields()
  return Response.json({ success: result.failed === 0, ...result })
}
