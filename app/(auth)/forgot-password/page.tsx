'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'

function ForgotPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlEmail = searchParams.get('email') || ''

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [email, setEmail] = useState(urlEmail)
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to send OTP')
      } else {
        setSuccess('OTP sent successfully to your email.')
        setStep(2)
      }
    } catch (err) {
      setError('An error occurred. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address')
      return
    }
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/auth/reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to send request')
      } else {
        setSuccess('Password reset request sent to admin. You will be notified once it is processed.')
      }
    } catch (err) {
      setError('An error occurred. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message || 'Invalid OTP')
      } else {
        setSuccess('OTP verified! You can now reset your password.')
        setStep(3)
      }
    } catch (err) {
      setError('An error occurred. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match")
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword, confirmPassword }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to reset password')
      } else {
        setSuccess('Password reset successfully! Redirecting to login...')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (err) {
      setError('An error occurred. Please try again later.')
    } finally {
      setLoading(false)
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
        <h1 className="text-2xl font-bold text-white mt-4">Forgot Password</h1>
        <p className="text-white/60 text-sm mt-1">
          {step === 1 && 'Enter your email to receive an OTP or request a password reset'}
          {step === 2 && 'Enter the 6-digit OTP sent to your email'}
          {step === 3 && 'Create a new password'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">
          {success}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="text-sm text-white/70 font-medium block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="arjun@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all"
              />
            </div>
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full rounded-full font-extrabold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 transition-all duration-300 shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:shadow-[0_0_35px_rgba(59,130,246,0.65)] border border-white/10 gap-2 cursor-pointer flex items-center justify-center"
            style={{ height: 'clamp(2.75rem,5.5vh,3.5rem)', fontSize: 'clamp(0.85rem,1.3vw,1rem)' }}
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </Button>

          <Button
            type="button"
            onClick={handleRequestReset}
            size="lg"
            disabled={loading}
            className="w-full rounded-full font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 gap-2 flex items-center justify-center mt-2"
            style={{ height: 'clamp(2.75rem,5.5vh,3.5rem)', fontSize: 'clamp(0.85rem,1.3vw,1rem)' }}
          >
            {loading ? 'Sending Request...' : 'Admin Request'}
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="text-sm text-white/70 font-medium block mb-1.5">Enter OTP</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 text-center tracking-widest text-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all"
              />
            </div>
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={loading || otp.length !== parseInt(process.env.NEXT_PUBLIC_OTP_LENGTH || '6', 10)}
            className="w-full rounded-full font-extrabold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 transition-all duration-300 shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:shadow-[0_0_35px_rgba(59,130,246,0.65)] border border-white/10 gap-2 cursor-pointer flex items-center justify-center"
            style={{ height: 'clamp(2.75rem,5.5vh,3.5rem)', fontSize: 'clamp(0.85rem,1.3vw,1rem)' }}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Button>
          <div className="text-center mt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs text-white/50 hover:text-white"
            >
              Change Email
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="text-sm text-white/70 font-medium block mb-1.5">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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

          <div>
            <label className="text-sm text-white/70 font-medium block mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all"
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full rounded-full font-extrabold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 transition-all duration-300 shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:shadow-[0_0_35px_rgba(59,130,246,0.65)] border border-white/10 gap-2 cursor-pointer flex items-center justify-center"
            style={{ height: 'clamp(2.75rem,5.5vh,3.5rem)', fontSize: 'clamp(0.85rem,1.3vw,1rem)' }}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-white/50 mt-6">
        Remember your password?{' '}
        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline">
          Back to Login
        </Link>
      </p>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="glass-card p-8 text-white text-center">Loading...</div>}>
      <ForgotPasswordForm />
    </Suspense>
  )
}
