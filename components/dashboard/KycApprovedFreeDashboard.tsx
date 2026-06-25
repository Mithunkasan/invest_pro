'use client'

import { motion } from 'framer-motion'
import { Crown, Wallet, ShieldCheck, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/utils/formatters'

interface KycApprovedFreeDashboardProps {
  userName: string
  mainBalance: number
  depositBalance: number
}

export function KycApprovedFreeDashboard({ userName, mainBalance, depositBalance }: KycApprovedFreeDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Welcome heading */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-1"
      >
        <h1 className="text-2xl font-bold flex flex-wrap items-center gap-2">
          Welcome, <span className="text-primary">{userName.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-muted-foreground text-sm">Here&apos;s your account overview</p>
      </motion.div>

      {/* Free Membership Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="premium-card p-5 relative overflow-hidden bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-slate-700/50 shadow-xl rounded-2xl"
      >
        {/* Crown watermark */}
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Crown className="w-24 h-24 text-slate-400" />
        </div>

        <div className="flex items-center gap-4 relative z-10">
          {/* Icon */}
          <div className="p-3 rounded-xl bg-slate-500/10 text-slate-400 border border-slate-500/20 shrink-0">
            <Crown className="w-6 h-6" />
          </div>

          {/* Status text */}
          <div>
            <h3 className="font-bold text-lg text-white flex items-center gap-2 flex-wrap">
              Standard Membership
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-300 border border-slate-500/30">
                Active
              </span>
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Your KYC is verified. Activate a membership plan to unlock all features.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Wallet Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Main Wallet Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="premium-card p-6 rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/50 shadow-lg"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Main Wallet</p>
                <p className="text-3xl font-black text-white mt-1 tracking-tight">
                  {formatCurrency(mainBalance)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Available balance for withdrawal</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Deposit Wallet Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="premium-card p-6 rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/50 shadow-lg"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Deposit Wallet</p>
                <p className="text-3xl font-black text-white mt-1 tracking-tight">
                  {formatCurrency(depositBalance)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Balance for activating plans</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Profile Verified notice */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20"
      >
        <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
        <p className="text-sm text-emerald-400 font-medium flex-1">
          Profile Verified — Your profile has been successfully verified.
        </p>
      </motion.div>
    </div>
  )
}
