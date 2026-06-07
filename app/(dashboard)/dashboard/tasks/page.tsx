import { redirect } from 'next/navigation'
import { completeOfflineTaskAction } from '@/actions/user'
import { Button } from '@/components/ui/button'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDateTime } from '@/utils/formatters'

export default async function MemberTasksPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const tasks = await prisma.offlineTask.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Assigned Offline Tasks</h1>
        <p className="text-sm text-muted-foreground mt-1">Complete assigned tasks before the specified time.</p>
      </div>

      <div className="grid gap-4">
        {tasks.map((task) => {
          const isExpired = task.status === 'ASSIGNED' && task.dueAt < new Date()
          const canComplete = task.status === 'ASSIGNED' && !isExpired

          return (
            <div key={task.id} className="premium-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-white">{task.title}</h2>
                  <span className="status-badge bg-primary/10 text-primary">{isExpired ? 'EXPIRED' : task.status}</span>
                </div>
                <p className="text-sm text-muted-foreground">{task.description}</p>
                <p className="text-xs text-muted-foreground">Due: {formatDateTime(task.dueAt)}</p>
              </div>
              {canComplete && (
                <form action={async () => {
                  'use server'
                  await completeOfflineTaskAction(task.id)
                }}>
                  <Button type="submit" className="whitespace-nowrap">
                    Mark Complete
                  </Button>
                </form>
              )}
            </div>
          )
        })}
        {tasks.length === 0 && (
          <div className="premium-card p-8 text-center text-muted-foreground">
            No offline tasks assigned yet.
          </div>
        )}
      </div>
    </div>
  )
}
