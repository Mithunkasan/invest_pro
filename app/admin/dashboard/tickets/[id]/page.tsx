import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAdminTicketDetails } from '@/actions/tickets'
import { AdminTicketChatClient } from '@/components/admin/AdminTicketChatClient'
import { ArrowLeft, User, Mail, Phone } from 'lucide-react'
import { format } from 'date-fns'

export const metadata = {
  title: 'Ticket Details - Admin Portal',
}

const priorityColors: Record<string, string> = {
  LOW: 'text-zinc-500',
  MEDIUM: 'text-blue-500',
  HIGH: 'text-orange-500',
  CRITICAL: 'text-red-500 font-bold',
}

export default async function AdminTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ticket = await getAdminTicketDetails(id)

  if (!ticket) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard/tickets" className="p-2 border rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{ticket.subject}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <span className="font-mono bg-accent px-1.5 py-0.5 rounded">{ticket.ticketId}</span>
              <span>•</span>
              <span className="capitalize">{ticket.category.replace('_', ' ')}</span>
              <span>•</span>
              <span className={priorityColors[ticket.priority]}>{ticket.priority} Priority</span>
              <span>•</span>
              <span>{format(new Date(ticket.createdAt), 'MMM d, yyyy h:mm a')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Info */}
        <div className="bg-card border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-sm border-b pb-2">User Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-muted-foreground">
              <User className="w-4 h-4" />
              <span className="text-foreground font-medium">{ticket.user.name}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span className="text-foreground">{ticket.user.email}</span>
            </div>
            {ticket.user.phone && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span className="text-foreground">{ticket.user.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Original Description */}
        <div className="md:col-span-2 bg-accent/30 border rounded-xl p-5 space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider text-xs">Original Request</h3>
          <div className="whitespace-pre-wrap text-sm">{ticket.description}</div>
        </div>
      </div>

      {/* Chat Component */}
      <AdminTicketChatClient 
        ticketId={ticket.id}
        messages={ticket.messages}
        currentStatus={ticket.status}
      />
    </div>
  )
}
