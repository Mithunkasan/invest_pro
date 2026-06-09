'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Eye, Search, Filter } from 'lucide-react'

interface TicketWithUser {
  id: string
  ticketId: string
  subject: string
  category: string
  priority: string
  status: string
  createdAt: Date
  user: {
    name: string
    email: string
  }
}

export function TicketsTable({ tickets }: { tickets: TicketWithUser[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tickets by ID, subject, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold border-b">
              <tr>
                <th className="px-6 py-4">Ticket ID</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Status & Priority</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-accent/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">{ticket.ticketId}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{ticket.user.name}</div>
                    <div className="text-xs text-muted-foreground">{ticket.user.email}</div>
                  </td>
                  <td className="px-6 py-4 max-w-[200px] truncate" title={ticket.subject}>
                    {ticket.subject}
                    <div className="text-[10px] text-muted-foreground uppercase">{ticket.category.replace('_', ' ')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${ticket.status === 'OPEN' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : ticket.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : ticket.status === 'RESOLVED' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className={`text-[10px] font-semibold ${ticket.priority === 'CRITICAL' ? 'text-red-500' : ticket.priority === 'HIGH' ? 'text-orange-500' : ticket.priority === 'MEDIUM' ? 'text-blue-500' : 'text-zinc-500'}`}>
                        {ticket.priority}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/admin/dashboard/tickets/${ticket.id}`}
                      className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No tickets found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
