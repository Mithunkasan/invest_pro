import { getAllTickets } from '@/actions/tickets'
import { TicketsTable } from '@/components/admin/TicketsTable'
import { prisma } from '@/lib/prisma'

export const metadata = {
  title: 'Ticket Management - Admin Portal',
}

export default async function AdminTicketsPage() {
  const [tickets, pendingCount] = await Promise.all([
    getAllTickets(),
    prisma.ticket.count({ where: { status: 'OPEN' } })
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Ticket Management ({pendingCount})</h1>
        <p className="text-sm text-muted-foreground mt-1">View and respond to user support tickets.</p>
      </div>
      <TicketsTable tickets={tickets as any} />
    </div>
  )
}
