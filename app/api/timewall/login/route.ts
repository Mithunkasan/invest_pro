import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { buildTimeWallUrl, getTimeWallConfig } from '@/lib/timewall'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const config = await getTimeWallConfig()
  return NextResponse.redirect(new URL(buildTimeWallUrl(config, session)))
}
