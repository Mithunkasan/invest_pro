'use client'

import { useState } from 'react'
import { submitContactFormAction } from '@/actions/contact'
import { Button } from '@/components/ui/button'

export default function ContactClient() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setSuccess('')
    setError('')

    const formData = new FormData(e.currentTarget)
    const formEl = e.currentTarget

    try {
      const result = await submitContactFormAction(formData)
      if (result.success) {
        setSuccess(result.message)
        formEl.reset()
      } else {
        setError(result.message)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send your message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="premium-card p-6">
      <h2 className="font-bold text-xl mb-4">Send a Message</h2>
      
      {success && (
        <div className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Full Name</label>
            <input name="name" type="text" required placeholder="Arjun Kumar" className="form-input w-full" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Email</label>
            <input name="email" type="email" required placeholder="arjun@example.com" className="form-input w-full" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Phone Number</label>
            <input name="phone" type="tel" required placeholder="9876543210" className="form-input w-full" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Subject</label>
            <input name="subject" type="text" required placeholder="General inquiry" className="form-input w-full" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">Message</label>
          <textarea name="message" required rows={5} placeholder="Describe your query in detail..." className="form-input resize-none w-full" />
        </div>
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          {loading ? 'Sending Message...' : 'Send Message'}
        </Button>
      </form>
    </div>
  )
}
