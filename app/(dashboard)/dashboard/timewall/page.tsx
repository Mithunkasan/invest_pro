import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { buildTimeWallUrl, getTimeWallConfig } from '@/lib/timewall'

export default async function TimeWallRedirectPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const config = await getTimeWallConfig()
  redirect(buildTimeWallUrl(config, session))
}
