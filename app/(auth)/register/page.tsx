'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TrendingUp, Eye, EyeOff, Mail, Lock, User, Phone, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { registerAction } from '@/actions/auth'
import { useFormStatus } from 'react-dom'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

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
      {pending ? 'Creating Account...' : 'Create Account'}
    </Button>
  )
}

function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const searchParams = useSearchParams()
  const refCode = searchParams.get('ref') || ''

  async function handleAction(formData: FormData) {
    setError('')
    setSuccess('')
    const result = await registerAction(formData)
    if (result.success) {
      setSuccess(result.message)
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="glass-card p-8">
      {/* Logo */}
      <div className="text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2.5 font-black text-2xl mb-3 group">
          <div className="w-11 h-11 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-115">
            <img src="/logo3.png" className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(59,130,246,0.3)]" alt="VR Galaxy Networks logo" />
          </div>
          <span className="bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent font-black tracking-wider">
            VR Galaxy Networks
          </span>
        </Link>
        <h1 className="text-2xl font-bold text-white mt-2">Create Account</h1>
        <p className="text-white/60 text-sm mt-1">Start your activation plan journey today</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
          {success}{' '}
          <Link href="/login" className="underline font-medium">Login now</Link>
        </div>
      )}

      <form action={handleAction} className="space-y-3">
        <input type="hidden" name="memberType" value="FREE" />
        {/* Name */}
        <div>
          <label className="text-xs text-white/70 font-medium block mb-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input name="name" type="text" required placeholder="Arjun Kumar" className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 text-sm transition-all" />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="text-xs text-white/70 font-medium block mb-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input name="email" type="email" required placeholder="arjun@example.com" className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 text-sm transition-all" />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="text-xs text-white/70 font-medium block mb-1">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input name="phone" type="tel" required placeholder="9876543210" className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 text-sm transition-all" />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="text-xs text-white/70 font-medium block mb-1">Password</label>
          <p className="text-[11px] text-white/50 mb-1.5 leading-relaxed">
            Use at least 8 characters, including one uppercase letter (A–Z), one lowercase letter (a–z), and one special character (e.g., @, #, $, %).
          </p>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input name="password" type={showPassword ? 'text' : 'password'} required placeholder="Min 8 chars, 1 uppercase, 1 number" className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 text-sm transition-all" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="text-xs text-white/70 font-medium block mb-1">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required placeholder="Re-enter password" className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 text-sm transition-all" />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Referral */}
        <div>
          <label className="text-xs text-white/70 font-medium block mb-1">Referral Code (Optional)</label>
          <div className="relative">
            <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input name="referralCode" type="text" defaultValue={refCode} placeholder="ARJUN001" className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 text-sm transition-all" />
          </div>
        </div>

        {/* Terms */}
        <label className="flex items-start gap-2 cursor-pointer">
          <input name="terms" type="checkbox" required className="mt-0.5 rounded" />
          <span className="text-xs text-white/50">
            I agree to the{' '}
            <Link href="/terms" className="text-indigo-400 hover:text-indigo-300 hover:underline">Terms & Conditions</Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300 hover:underline">Privacy Policy</Link>
          </span>
        </label>

        <SubmitButton />
      </form>

      <p className="text-center text-sm text-white/50 mt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline">Sign In</Link>
      </p>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
