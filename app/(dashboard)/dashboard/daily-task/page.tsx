import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { checkUserDailyTaskEligibilityAction } from '@/actions/dailyTask'
import { DailyTaskViewer } from '@/components/dashboard/DailyTaskViewer'
import { CheckCircle2, Info } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Daily Task — VR Galaxy Networks',
}

export default async function UserDailyTaskPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const { eligible, hasDueYield, settings } = await checkUserDailyTaskEligibilityAction()

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Daily Task</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Qualify for your membership yield rewards by completing your daily watch/view task.
        </p>
      </div>

      {!settings || !settings.dailyTaskEnabled ? (
        <div className="premium-card p-6 flex flex-col items-center text-center space-y-3">
          <Info className="w-12 h-12 text-blue-500" />
          <h2 className="text-lg font-bold text-white">Daily Task Disabled</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            The Daily Task requirement is currently disabled by the administrator. Your daily yields are credited automatically on dashboard load.
          </p>
        </div>
      ) : !hasDueYield ? (
        <div className="premium-card p-6 flex flex-col items-center text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-green-500 animate-bounce" />
          <h2 className="text-lg font-bold text-white">All Caught Up!</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            You have no pending tasks or due yields for today. Your rewards have already been credited. Come back tomorrow!
          </p>
        </div>
      ) : (
        <div className="premium-card p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Complete Today's Task</h2>
          <DailyTaskViewer userId={session.id} settings={settings} />
        </div>
      )}
    </div>
  )
}
