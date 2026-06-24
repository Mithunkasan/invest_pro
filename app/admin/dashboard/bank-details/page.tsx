import type { Metadata } from 'next'
import { getSystemSettings } from '@/actions/admin'
import { BankDetailsClient } from '@/components/admin/BankDetailsClient'

export const metadata: Metadata = {
  title: 'Bank Details — VR Galaxy Networks Admin',
}

export default async function AdminBankDetailsPage() {
  const settings = await getSystemSettings()

  if (!settings) {
    return (
      <div className="premium-card p-6 text-center text-muted-foreground text-sm">
        Failed to load system settings. Please try again.
      </div>
    )
  }

  return <BankDetailsClient settings={JSON.parse(JSON.stringify(settings))} />
}
