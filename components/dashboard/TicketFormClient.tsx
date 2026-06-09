'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTicketAction } from '@/actions/tickets'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export function TicketFormClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const res = await createTicketAction(formData)

      if (res.success) {
        toast.success(res.message)
        router.push('/dashboard/tickets')
        router.refresh()
      } else {
        toast.error(res.message)
      }
    } catch (err) {
      toast.error('An error occurred while submitting your ticket.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-2xl bg-card border rounded-xl p-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium mb-1.5">Subject</label>
          <input
            id="subject"
            name="subject"
            required
            type="text"
            className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            placeholder="Brief summary of your issue"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1.5">Category</label>
            <select
              id="category"
              name="category"
              required
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            >
              <option value="TECHNICAL_ISSUE">Technical Issue</option>
              <option value="PAYMENT_ISSUE">Payment Issue</option>
              <option value="FEATURE_REQUEST">Feature Request</option>
              <option value="COMPLAINT">Complaint</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium mb-1.5">Priority</label>
            <select
              id="priority"
              name="priority"
              required
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1.5">Description</label>
          <textarea
            id="description"
            name="description"
            required
            rows={6}
            className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-y"
            placeholder="Please describe your issue in detail..."
          ></textarea>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-accent transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Ticket'
          )}
        </button>
      </div>
    </form>
  )
}
