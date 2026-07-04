import type { Metadata } from 'next'
import { getSystemSettings } from '@/actions/admin'
import { SettingsForm } from '@/components/admin/SettingsForm'
import { getTimeWallSettingsAction } from '@/actions/timewall'
import { TimeWallSettingsForm } from '@/components/admin/TimeWallSettingsForm'

export const metadata: Metadata = {
  title: 'System Settings — VR Galaxy Networks Admin',
}

export default async function AdminSettingsPage() {
  const [settings, timeWallSettings] = await Promise.all([
    getSystemSettings(),
    getTimeWallSettingsAction(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure dynamic referral commissions, levels income, Star Performer targets, and TL Rank automations.
        </p>
      </div>

      {settings ? (
        <SettingsForm initialSettings={JSON.parse(JSON.stringify(settings))} />
      ) : (
        <div className="premium-card p-6 text-center text-muted-foreground text-sm">
          Failed to load system settings. Please try again.
        </div>
      )}

      {timeWallSettings && (
        <TimeWallSettingsForm initialSettings={timeWallSettings} />
      )}
    </div>
  )
}
