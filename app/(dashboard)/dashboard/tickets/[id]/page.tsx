import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTicketDetails } from '@/actions/tickets'
import { TicketChatClient } from '@/components/dashboard/TicketChatClient'
import { ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'

export const metadata = {
  title: 'Ticket Details - VR Galaxy Networks',
}

const statusColors: Record<string, string> = {
  OPEN: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  IN_PROGRESS: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  RESOLVED: 'bg-green-500/10 text-green-500 border-green-500/20',
  CLOSED: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
}

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ticket = await getTicketDetails(id)

  if (!ticket) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tickets" className="p-2 border rounded-lg hover:bg-accent transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-3">
            {ticket.subject}
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusColors[ticket.status]}`}>
              {ticket.status.replace('_', ' ')}
            </span>
          </h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <span className="font-mono">{ticket.ticketId}</span>
            <span>•</span>
            <span>{format(new Date(ticket.createdAt), 'MMM d, yyyy h:mm a')}</span>
            <span>•</span>
            <span className="capitalize">{ticket.category.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      <div className="bg-accent/30 p-4 rounded-xl border text-sm">
        <h4 className="font-semibold mb-2 text-xs uppercase tracking-wider text-muted-foreground">Original Issue Description</h4>
        <div className="whitespace-pre-wrap">{ticket.description}</div>
      </div>

      <div>
        <TicketChatClient 
          ticketId={ticket.id} 
          messages={ticket.messages} 
          status={ticket.status} 
        />
      </div>
    </div>
  )
}
