import { TicketFormClient } from '@/components/dashboard/TicketFormClient'

export const metadata = {
  title: 'Raise Ticket - VR Galaxy',
}

export default function NewTicketPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Raise a Ticket</h1>
        <p className="text-sm text-muted-foreground">Fill out the form below to submit a new support request.</p>
      </div>
      <TicketFormClient />
    </div>
  )
}
