import type { Metadata } from 'next'
import { getDailyTaskSettingsAction } from '@/actions/dailyTask'
import { DailyTaskSettingsForm } from '@/components/admin/DailyTaskSettingsForm'

export const metadata: Metadata = {
  title: 'Daily Task Settings — VR Galaxy Networks Admin',
}

export default async function AdminDailyTaskPage() {
  const settings = await getDailyTaskSettingsAction()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Daily Task Configuration</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Set up daily video watch tasks or image views that users must complete to qualify for their daily yield rewards.
        </p>
      </div>

      <DailyTaskSettingsForm initialSettings={settings} />
    </div>
  )
}
