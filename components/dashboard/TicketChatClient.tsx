'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { replyToTicketUserAction } from '@/actions/tickets'
import { Send, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface Message {
  id: string
  senderRole: string
  message: string
  createdAt: Date
}

interface TicketChatClientProps {
  ticketId: string
  messages: Message[]
  status: string
}

export function TicketChatClient({ ticketId, messages, status }: TicketChatClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'CLOSED') return

    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const message = formData.get('message')?.toString() || ''

    const res = await replyToTicketUserAction(ticketId, message)
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

  return (
    <div className="flex flex-col h-[600px] border rounded-xl bg-card overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.senderRole === 'USER'
          return (
            <div key={msg.id} className={`flex flex-col max-w-[80%] ${isUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">{isUser ? 'You' : 'Admin'}</span>
                <span className="text-[10px] text-muted-foreground">{format(new Date(msg.createdAt), 'h:mm a, MMM d')}</span>
              </div>
              <div className={`px-4 py-2 rounded-2xl text-sm ${isUser ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-accent text-accent-foreground rounded-tl-sm'}`}>
                {msg.message.split('\n').map((line, i) => (
                  <p key={i} className="min-h-[1rem]">{line}</p>
                ))}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {status !== 'CLOSED' ? (
        <div className="p-3 border-t bg-card/50">
          <form onSubmit={onSubmit} className="flex items-end gap-2">
            <textarea
              name="message"
              required
              rows={2}
              className="flex-1 px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
              placeholder="Type your reply here..."
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
              className="p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      ) : (
        <div className="p-4 border-t bg-accent/50 text-center">
          <p className="text-sm text-muted-foreground">This ticket is closed. You can no longer reply.</p>
        </div>
      )}
    </div>
  )
}
