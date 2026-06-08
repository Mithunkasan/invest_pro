'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TrendingUp, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { loginAction } from '@/actions/auth'
import { useFormStatus } from 'react-dom'
import type { Metadata } from 'next'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      size="lg"
      className="w-full rounded-full font-extrabold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 transition-all duration-300 shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:shadow-[0_0_35px_rgba(59,130,246,0.65)] border border-white/10 gap-2 cursor-pointer flex items-center justify-center"
      style={{ height: 'clamp(2.75rem,5.5vh,3.5rem)', fontSize: 'clamp(0.85rem,1.3vw,1rem)' }}
      loading={pending}
    >
      {pending ? 'Signing in...' : 'Sign In'}
    </Button>
  )
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  async function handleAction(formData: FormData) {
    setError('')
    const result = await loginAction(formData)
    if (result && !result.success) {
      setError(result.message)
    }
  }

  return (
    <div className="glass-card p-8">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2.5 font-black text-2xl mb-4 group">
          <div className="w-11 h-11 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-115">
            <img src="/logo3.png" className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(59,130,246,0.3)]" alt="VR Galaxy Logo" />
          </div>
          <span className="bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent font-black tracking-wider">
            VR Galaxy
          </span>
        </Link>
        <h1 className="text-2xl font-bold text-white mt-4">Welcome Back</h1>
        <p className="text-white/60 text-sm mt-1">Sign in to your account to continue</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      <form action={handleAction} className="space-y-4">
        {/* Email */}
        <div>
          <label className="text-sm text-white/70 font-medium block mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="arjun@example.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm text-white/70 font-medium">Password</label>
            <Link href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`} className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <SubmitButton />
      </form>

      <p className="text-center text-sm text-white/50 mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline">
          Create Account
        </Link>
      </p>


    </div>
  )
}
