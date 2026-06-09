'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { replyToTicketAdminAction, updateTicketStatusAction } from '@/actions/tickets'
import { Send, Loader2, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface Message {
  id: string
  senderRole: string
  message: string
  createdAt: Date
}

interface AdminTicketChatClientProps {
  ticketId: string
  messages: Message[]
  currentStatus: string
}

export function AdminTicketChatClient({ ticketId, messages, currentStatus }: AdminTicketChatClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [status, setStatus] = useState(currentStatus)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function onReply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const message = formData.get('message')?.toString() || ''

    const res = await replyToTicketAdminAction(ticketId, message)
    if (res.success) {
      toast.success(res.message)
      const form = e.target as HTMLFormElement
      form.reset()
      router.refresh()
    } else {
      toast.error(res.message)
    }
    setLoading(false)
  }

  async function onUpdateStatus() {
    if (status === currentStatus) return
    setStatusLoading(true)
    const res = await updateTicketStatusAction(ticketId, status)
    if (res.success) {
      toast.success(res.message)
      router.refresh()
    } else {
      toast.error(res.message)
    }
    setStatusLoading(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Chat Area */}
      <div className="lg:col-span-3 flex flex-col h-[600px] border rounded-xl bg-card overflow-hidden">
        <div className="bg-muted/30 px-4 py-3 border-b text-sm font-semibold flex justify-between items-center">
          Conversation History
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isAdmin = msg.senderRole === 'ADMIN'
            return (
              <div key={msg.id} className={`flex flex-col max-w-[80%] ${isAdmin ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-semibold uppercase ${isAdmin ? 'text-blue-500' : 'text-muted-foreground'}`}>
                    {isAdmin ? 'Admin (You)' : 'User'}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{format(new Date(msg.createdAt), 'h:mm a, MMM d')}</span>
                </div>
                <div className={`px-4 py-2 rounded-2xl text-sm ${isAdmin ? 'bg-blue-500 text-white rounded-tr-sm' : 'bg-accent text-accent-foreground rounded-tl-sm'}`}>
                  {msg.message.split('\n').map((line, i) => (
                    <p key={i} className="min-h-[1rem]">{line}</p>
                  ))}
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 border-t bg-card/50">
          <form onSubmit={onReply} className="flex items-end gap-2">
            <textarea
              name="message"
              required
              rows={3}
              className="flex-1 px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm resize-none"
              placeholder="Type your reply to the user..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  e.currentTarget.form?.requestSubmit()
                }
              }}
            />
            <button
              type="submit"
              disabled={loading}
              className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>

      {/* Sidebar Controls */}
      <div className="space-y-4">
        <div className="bg-card border rounded-xl p-4 space-y-4">
          <h3 className="font-semibold text-sm">Ticket Controls</h3>
          
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Update Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
            <button
              onClick={onUpdateStatus}
              disabled={status === currentStatus || statusLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50 text-sm font-medium mt-2"
            >
              {statusLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Status
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
