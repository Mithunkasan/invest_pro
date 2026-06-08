'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { resolvePasswordResetRequestAction } from '@/actions/adminPasswordReset'
import { CheckCircle2, Clock } from 'lucide-react'

export default function PasswordResetClient({ initialRequests }: { initialRequests: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [passwords, setPasswords] = useState<Record<string, string>>({})

  const handleResolve = async (id: string) => {
    const newPassword = passwords[id]
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoadingId(id)
    setError('')
    setSuccess('')

    const res = await resolvePasswordResetRequestAction(id, newPassword)
    if (!res.success) {
      setError(res.message)
    } else {
      setSuccess(res.message)
      setPasswords(prev => ({...prev, [id]: ''}))
      
      // Update UI state locally to avoid needing a full page reload if preferred, 
      // but revalidatePath will handle the server-side refresh.
    }
    setLoadingId(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Password Reset Requests</h1>
        <p className="text-muted-foreground text-sm">Manage user password reset requests.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
          {success}
        </div>
      )}

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 border-b border-white/10 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {initialRequests.map(req => (
                <tr key={req.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium">{req.email}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(req.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    {req.status === 'PENDING' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                        <Clock className="w-3.5 h-3.5" /> Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {req.status === 'PENDING' && (
                      <div className="flex items-center justify-end gap-2">
                        <input
                          type="text"
                          placeholder="New Password"
                          value={passwords[req.id] || ''}
                          onChange={e => setPasswords(prev => ({...prev, [req.id]: e.target.value}))}
                          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:ring-1 focus:ring-primary w-32"
                        />
                        <Button 
                          size="sm" 
                          onClick={() => handleResolve(req.id)}
                          disabled={loadingId === req.id}
                        >
                          {loadingId === req.id ? 'Saving...' : 'Reset'}
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {initialRequests.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    No password reset requests found.
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
