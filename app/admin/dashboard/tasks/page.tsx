import { assignOfflineTaskAction } from '@/actions/admin'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import { formatDateTime } from '@/utils/formatters'

export default async function AdminTasksPage() {
  async function assignTask(formData: FormData) {
    'use server'
    await assignOfflineTaskAction(formData)
  }

  const [users, tasks] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, name: true, email: true, memberType: true },
      orderBy: { name: 'asc' },
    }),
    prisma.offlineTask.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Offline Task Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Assign offline tasks to members and monitor completion within the specified time.</p>
      </div>

      <div className="premium-card p-6">
        <form action={assignTask} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Member</label>
            <select name="userId" required className="form-input">
              <option value="">Select member</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email}) - {user.memberType}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Due Date & Time</label>
            <input name="dueAt" type="datetime-local" required className="form-input" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium">Task Title</label>
            <input name="title" type="text" required className="form-input" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium">Task Details</label>
            <textarea name="description" required rows={4} className="form-input resize-none" />
          </div>
          <div className="md:col-span-2">
            <Button type="submit">
              Assign Task
            </Button>
          </div>
        </form>
      </div>

      <div className="premium-card p-6 overflow-x-auto">
        <h2 className="font-semibold mb-4">Assigned Tasks</h2>
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground uppercase border-b border-border">
            <tr>
              <th className="py-3 text-left">Member</th>
              <th className="py-3 text-left">Task</th>
              <th className="py-3 text-left">Due</th>
              <th className="py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {tasks.map((task) => (
              <tr key={task.id}>
                <td className="py-3">
                  <p className="font-medium">{task.user.name}</p>
                  <p className="text-xs text-muted-foreground">{task.user.email}</p>
                </td>
                <td className="py-3">
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground max-w-xl">{task.description}</p>
                </td>
                <td className="py-3 text-xs text-muted-foreground">{formatDateTime(task.dueAt)}</td>
                <td className="py-3">
                  <span className="status-badge bg-primary/10 text-primary">{task.status}</span>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-muted-foreground">No tasks assigned yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
