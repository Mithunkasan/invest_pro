'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TrendingUp, Lock, Shield, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { adminLoginAction } from '@/actions/auth'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-primary to-blue-600" loading={pending}>
      {pending ? 'Signing in...' : 'Admin Sign In'}
    </Button>
  )
}

export default function AdminLoginPage() {
  const [error, setError] = useState('')

  async function handleAction(formData: FormData) {
    setError('')
    const result = await adminLoginAction(formData)
    if (result && !result.success) {
      setError(result.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mb-4">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
            <p className="text-white/60 text-sm mt-1">Restricted access — administrators only</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form action={handleAction} className="space-y-4">
            <div>
              <label className="text-sm text-white/70 font-medium block mb-1.5">Email Address</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  name="username"
                  type="text"
                  required
                  defaultValue="admin@vrgalaxy.com"
                  placeholder="admin@vrgalaxy.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-white/70 font-medium block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  name="password"
                  type="password"
                  required
                  defaultValue="Vrgalaxy@4321admin"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>

            <SubmitButton />
          </form>

          <div className="mt-6 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-xs text-yellow-400 text-center">
              🔒 Default credentials: admin@vrgalaxy.com / Vrgalaxy@4321admin
            </p>
          </div>

          <div className="text-center mt-4">
            <Link href="/" className="text-xs text-white/30 hover:text-white/60 transition-colors flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Back to VR Galaxy Network
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
