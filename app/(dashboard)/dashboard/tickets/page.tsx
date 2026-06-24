import Link from 'next/link'
import { PlusCircle, MessageSquare } from 'lucide-react'
import { getUserTickets } from '@/actions/tickets'
import { format } from 'date-fns'

export const metadata = {
  title: 'Support Tickets - VR Galaxy Networks',
}

const statusColors: Record<string, string> = {
  OPEN: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  IN_PROGRESS: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  RESOLVED: 'bg-green-500/10 text-green-500 border-green-500/20',
  CLOSED: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
}

const priorityColors: Record<string, string> = {
  LOW: 'text-zinc-400',
  MEDIUM: 'text-blue-400',
  HIGH: 'text-orange-400',
  CRITICAL: 'text-red-500 font-bold',
}

export default async function TicketsPage() {
  const tickets = await getUserTickets()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-sm text-muted-foreground">Manage your complaints and requests.</p>
        </div>
        <Link 
          href="/dashboard/tickets/new" 
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm font-medium transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Raise Ticket
        </Link>
      </div>

      <div className="grid gap-4">
        {tickets.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-xl bg-card">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No tickets found</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">You haven't raised any support tickets yet.</p>
            <Link 
              href="/dashboard/tickets/new" 
              className="text-primary text-sm hover:underline"
            >
              Raise a new ticket
            </Link>
          </div>
        ) : (
          tickets.map((ticket) => (
            <Link 
              href={`/dashboard/tickets/${ticket.id}`} 
              key={ticket.id}
              className="block bg-card hover:bg-accent/50 border rounded-xl p-5 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{ticket.ticketId}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusColors[ticket.status]}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="capitalize">{ticket.category.replace('_', ' ')}</span>
                    <span>•</span>
                    <span className={priorityColors[ticket.priority]}>
                      {ticket.priority} Priority
                    </span>
                    <span>•</span>
                    <span>{format(new Date(ticket.createdAt), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
