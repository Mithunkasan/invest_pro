import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { buildTimeWallUrl, getTimeWallConfig } from '@/lib/timewall'
import { Timer } from 'lucide-react'

export default async function TimeWallPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const config = await getTimeWallConfig()
  const timeWallUrl = buildTimeWallUrl(config, session)

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      {/* Title block */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
          <Timer className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">TimeWall Tasks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Complete tasks, surveys, and clicks to earn rewards that will be credited directly to your Task Wallet after verification.
          </p>
        </div>
      </div>

      {/* Embedded Iframe */}
      <div className="premium-card p-1 rounded-3xl border border-border/50 bg-gradient-to-br from-card/90 via-card/75 to-card/50 shadow-2xl relative overflow-hidden flex-1 min-h-[1000px]">
        <iframe
          title="TimeWall"
          src={timeWallUrl}
          frameBorder="0"
          width="100%"
          height="1000"
          scrolling="auto"
          className="w-full h-[1000px] rounded-2xl border-none bg-black/20"
          allow="clipboard-write"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-downloads"
        />
      </div>
    </div>
  )
}
