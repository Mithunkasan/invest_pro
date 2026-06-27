'use client'

import { useTransition, useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DataTable } from '@/components/dashboard/DataTable'
import { formatDate, formatCurrency, getStatusColor } from '@/utils/formatters'
import { Button } from '@/components/ui/button'
import { assignUserReferrerAction, toggleUserStatus, toggleUserRankAction, updateUserAction, impersonateUserAction, deleteUserAction } from '@/actions/admin'
import { toast } from '@/hooks/use-toast'
import { Search, X, Pencil, Crown, UserPlus, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ModalPortal } from '@/components/common/ModalPortal'
import { getMembershipEndDate } from '@/utils/membershipDates'
import { getMembershipDisplayName } from '@/utils/membershipDisplay'

interface UsersTableProps {
  users: any[]
  plans?: any[]
}

interface ReferralAssignableUser {
  id: string
  name: string
  email: string
  referralCode?: string | null
  referredById?: string | null
}

interface DeletableUser {
  id: string
  name: string
  email: string
}

// ── Helper: derive highest rank label + badge key for a user ──────────────────
type RankKey =
  | 'directorRank'
  | 'tlRank'
  | 'elitePerformer'
  | 'doubleStarPerformer'
  | 'starPerformer'
  | 'none'

interface RankInfo {
  key: RankKey
  label: string
  icon: string
  color: string // tailwind text/bg/border classes
}

const RANK_MAP: Record<RankKey, RankInfo> = {
  directorRank: {
    key: 'directorRank',
    label: 'Director',
    icon: '👑',
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  },
  tlRank: {
    key: 'tlRank',
    label: 'Team Leader',
    icon: '🏆',
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
  elitePerformer: {
    key: 'elitePerformer',
    label: 'Elite Performer',
    icon: '💎',
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },
  doubleStarPerformer: {
    key: 'doubleStarPerformer',
    label: 'Double Star',
    icon: '⭐⭐',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  starPerformer: {
    key: 'starPerformer',
    label: 'Star Performer',
    icon: '⭐',
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  },
  none: {
    key: 'none',
    label: 'No Rank',
    icon: '—',
    color: 'text-muted-foreground bg-muted/20 border-border/40',
  },
}

/** Returns the highest active rank for a user row */
function getUserRank(row: any): RankInfo {
  if (row.directorRank) return RANK_MAP.directorRank
  if (row.tlRank) return RANK_MAP.tlRank
  if (row.elitePerformer) return RANK_MAP.elitePerformer
  if (row.doubleStarPerformer) return RANK_MAP.doubleStarPerformer
  if (row.starPerformer) return RANK_MAP.starPerformer
  return RANK_MAP.none
}

const ALL_RANK_OPTIONS: { value: RankKey | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Ranks' },
  { value: 'directorRank', label: '👑 Director' },
  { value: 'tlRank', label: '🏆 Team Leader' },
  { value: 'elitePerformer', label: '💎 Elite Performer' },
  { value: 'doubleStarPerformer', label: '⭐⭐ Double Star' },
  { value: 'starPerformer', label: '⭐ Star Performer' },
  { value: 'none', label: '— No Rank' },
]

// ── EditUserModal ─────────────────────────────────────────────────────────────
interface EditUserModalProps {
  user: any
  plans: any[]
  onClose: () => void
}

function EditUserModal({ user, plans, onClose }: EditUserModalProps) {
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<'personal' | 'account' | 'membership'>('personal')

  // Find user's current database membership plan to synchronize details
  const initialPlan = plans.find(p => p.id === user.membershipPlanId)

  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    profilePictureUrl: user.profilePictureUrl || '',
    hasSeenProfilePicturePopup: !!user.hasSeenProfilePicturePopup,
    dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    addressLine: user.addressLine || '',
    city: user.city || '',
    state: user.state || '',
    pinCode: user.pinCode || '',
    profileCompleted: !!user.profileCompleted,
    role: user.role || 'USER',
    status: user.status || 'ACTIVE',
    memberType: initialPlan ? (initialPlan.name === 'Free Membership' ? 'FREE' : initialPlan.name === 'Basic Membership' ? 'BASIC' : 'PREMIUM') : 'FREE',
    referralCode: user.referralCode || '',
    referredById: user.referredById || '',
    membershipPlanId: initialPlan ? initialPlan.id : '',
    basicMembershipAmount: initialPlan ? initialPlan.price : 0,
    basicMembershipActivatedAt: user.basicMembershipActivatedAt ? new Date(user.basicMembershipActivatedAt).toISOString().slice(0, 16) : '',
    basicMembershipExpiresAt: user.basicMembershipExpiresAt ? new Date(user.basicMembershipExpiresAt).toISOString().split('T')[0] : '',
    lastDailyYieldAt: user.lastDailyYieldAt ? new Date(user.lastDailyYieldAt).toISOString().split('T')[0] : '',
    // Ranks/Badges
    starPerformer: !!user.starPerformer,
    doubleStarPerformer: !!user.doubleStarPerformer,
    elitePerformer: !!user.elitePerformer,
    tlRank: !!user.tlRank,
    tlRankEarnedAt: user.tlRankEarnedAt ? new Date(user.tlRankEarnedAt).toISOString().split('T')[0] : '',
    tlShareholder: !!user.tlShareholder,
    directorRank: !!user.directorRank,
    directorRankEarnedAt: user.directorRankEarnedAt ? new Date(user.directorRankEarnedAt).toISOString().split('T')[0] : '',
    directorShareholder: !!user.directorShareholder,
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const planId = e.target.value
    const selectedPlan = plans.find(p => p.id === planId)
    
    setForm(prev => {
      const next = { ...prev, membershipPlanId: planId }
      if (selectedPlan) {
        next.basicMembershipAmount = selectedPlan.price
        if (selectedPlan.name === 'Free Membership') {
          next.memberType = 'FREE'
        } else if (selectedPlan.name === 'Basic Membership') {
          next.memberType = 'BASIC'
        } else {
          next.memberType = 'PREMIUM'
        }
      } else {
        next.basicMembershipAmount = 0
        next.memberType = 'FREE'
      }
      return next
    })
  }

  function handleSave() {
    startTransition(async () => {
      const payload: any = { ...form }
      payload.dateOfBirth = form.dateOfBirth || null
      payload.referredById = form.referredById || null
      payload.membershipPlanId = form.membershipPlanId || null
      payload.basicMembershipActivatedAt = form.basicMembershipActivatedAt || null
      payload.basicMembershipExpiresAt = form.basicMembershipExpiresAt || null
      payload.lastDailyYieldAt = form.lastDailyYieldAt || null
      payload.tlRankEarnedAt = form.tlRankEarnedAt || null
      payload.directorRankEarnedAt = form.directorRankEarnedAt || null
      payload.basicMembershipAmount = Number(form.basicMembershipAmount) || 0

      const res = await updateUserAction(user.id, payload)
      if (res.success) {
        toast({ title: 'Success', description: res.message })
        onClose()
      } else {
        toast({ title: 'Error', description: res.message, variant: 'destructive' })
      }
    })
  }

  const tabs = [
    { id: 'personal', label: '👤 Profile & Contact' },
    { id: 'account', label: '🔒 Account & Ranks' },
    { id: 'membership', label: '👑 Membership' },
  ] as const

  return (
    <ModalPortal>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 py-8 overflow-y-auto"
        style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-brand-800 bg-brand-950 p-6 shadow-2xl text-left cursor-default my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-brand-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Pencil className="w-5 h-5 text-amber-500" />
                Edit User Details (A to Z)
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Updating comprehensive profile configuration for <span className="text-primary font-semibold">{user.name}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-brand-300 hover:bg-brand-900 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-brand-800/60 mt-4 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-bold transition-all border-b-2 rounded-t-lg ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-400 bg-brand-900/40'
                    : 'border-transparent text-brand-300 hover:text-white hover:bg-brand-900/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form Scroll Area */}
          <div className="mt-5 max-h-[60vh] overflow-y-auto pr-1 space-y-4 scrollbar-thin">
            {/* User ID (read-only) */}
            <div className="text-[11px] font-mono text-brand-300 bg-brand-900/30 px-3 py-1.5 rounded-lg border border-brand-800/40">
              User Unique ID: {user.id}
            </div>

            {activeTab === 'personal' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs font-semibold text-brand-200 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    disabled={isPending}
                    className="w-full h-9.5 px-3 rounded-lg bg-background border border-border/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-200 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={isPending}
                    className="w-full h-9.5 px-3 rounded-lg bg-background border border-border/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-200 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={isPending}
                    className="w-full h-9.5 px-3 rounded-lg bg-background border border-border/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-200 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    disabled={isPending}
                    className="w-full h-9.5 px-3 rounded-lg bg-background border border-border/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-brand-200 mb-1">Profile Picture URL</label>
                  <input
                    type="text"
                    name="profilePictureUrl"
                    value={form.profilePictureUrl}
                    onChange={handleChange}
                    disabled={isPending}
                    className="w-full h-9.5 px-3 rounded-lg bg-background border border-border/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-brand-200 mb-1">Address Line</label>
                  <input
                    type="text"
                    name="addressLine"
                    value={form.addressLine}
                    onChange={handleChange}
                    disabled={isPending}
                    className="w-full h-9.5 px-3 rounded-lg bg-background border border-border/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-200 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    disabled={isPending}
                    className="w-full h-9.5 px-3 rounded-lg bg-background border border-border/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-200 mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    disabled={isPending}
                    className="w-full h-9.5 px-3 rounded-lg bg-background border border-border/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-200 mb-1">Pin Code</label>
                  <input
                    type="text"
                    name="pinCode"
                    value={form.pinCode}
                    onChange={handleChange}
                    disabled={isPending}
                    className="w-full h-9.5 px-3 rounded-lg bg-background border border-border/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-brand-200 mb-1">Access Role</label>
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      disabled={isPending}
                      className="w-full h-9.5 px-3 rounded-lg bg-background border border-border/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    >
                      <option value="USER">User (Standard)</option>
                      <option value="ADMIN">Admin (Console Access)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-200 mb-1">User Status</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      disabled={isPending}
                      className="w-full h-9.5 px-3 rounded-lg bg-background border border-border/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="SUSPENDED">Suspended</option>
                      <option value="PENDING">Pending Verification</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-200 mb-1">Referral Code</label>
                    <input
                      type="text"
                      name="referralCode"
                      value={form.referralCode}
                      onChange={handleChange}
                      disabled={isPending}
                      className="w-full h-9.5 px-3 rounded-lg bg-background border border-border/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-200 mb-1">Referred By (User ID)</label>
                    <input
                      type="text"
                      name="referredById"
                      value={form.referredById}
                      onChange={handleChange}
                      disabled={isPending}
                      placeholder="None (Blank)"
                      className="w-full h-9.5 px-3 rounded-lg bg-background border border-border/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center justify-between p-2.5 rounded-xl border border-brand-800 bg-brand-900/10 cursor-pointer">
                    <span className="text-xs font-medium text-brand-200">Profile Completed</span>
                    <input
                      type="checkbox"
                      name="profileCompleted"
                      checked={form.profileCompleted}
                      onChange={handleChange}
                      disabled={isPending}
                      className="rounded border-brand-700 bg-background text-amber-500 focus:ring-0 focus:ring-offset-0 w-4.5 h-4.5"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2.5 rounded-xl border border-brand-800 bg-brand-900/10 cursor-pointer">
                    <span className="text-xs font-medium text-brand-200">Seen Profile Picture Popup</span>
                    <input
                      type="checkbox"
                      name="hasSeenProfilePicturePopup"
                      checked={form.hasSeenProfilePicturePopup}
                      onChange={handleChange}
                      disabled={isPending}
                      className="rounded border-brand-700 bg-background text-amber-500 focus:ring-0 focus:ring-offset-0 w-4.5 h-4.5"
                    />
                  </label>
                </div>

                {/* Performance Ranks Section */}
                <div className="p-4 bg-brand-900/20 border border-brand-800/60 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Ranks & Performance Badges</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <label className="flex items-center justify-between p-2.5 rounded-lg border border-brand-800/40 bg-brand-950/40 cursor-pointer hover:bg-brand-900/30 transition-colors">
                      <span className="text-xs font-medium text-white/80">⭐ Star Performer</span>
                      <input
                        type="checkbox"
                        name="starPerformer"
                        checked={form.starPerformer}
                        onChange={handleChange}
                        disabled={isPending}
                        className="rounded border-brand-700 bg-background text-amber-500 w-4.5 h-4.5"
                      />
                    </label>
                    <label className="flex items-center justify-between p-2.5 rounded-lg border border-brand-800/40 bg-brand-950/40 cursor-pointer hover:bg-brand-900/30 transition-colors">
                      <span className="text-xs font-medium text-white/80">⭐⭐ Double Star Performer</span>
                      <input
                        type="checkbox"
                        name="doubleStarPerformer"
                        checked={form.doubleStarPerformer}
                        onChange={handleChange}
                        disabled={isPending}
                        className="rounded border-brand-700 bg-background text-amber-500 w-4.5 h-4.5"
                      />
                    </label>
                    <label className="flex items-center justify-between p-2.5 rounded-lg border border-brand-800/40 bg-brand-950/40 cursor-pointer hover:bg-brand-900/30 transition-colors">
                      <span className="text-xs font-medium text-white/80">💎 Elite Performer</span>
                      <input
                        type="checkbox"
                        name="elitePerformer"
                        checked={form.elitePerformer}
                        onChange={handleChange}
                        disabled={isPending}
                        className="rounded border-brand-700 bg-background text-amber-500 w-4.5 h-4.5"
                      />
                    </label>
                    <label className="flex items-center justify-between p-2.5 rounded-lg border border-brand-800/40 bg-brand-950/40 cursor-pointer hover:bg-brand-900/30 transition-colors">
                      <span className="text-xs font-medium text-white/80">🏆 Team Leader (TL) Rank</span>
                      <input
                        type="checkbox"
                        name="tlRank"
                        checked={form.tlRank}
                        onChange={handleChange}
                        disabled={isPending}
                        className="rounded border-brand-700 bg-background text-amber-500 w-4.5 h-4.5"
                      />
                    </label>
                    <label className="flex items-center justify-between p-2.5 rounded-lg border border-brand-800/40 bg-brand-950/40 cursor-pointer hover:bg-brand-900/30 transition-colors">
                      <span className="text-xs font-medium text-white/80">👑 Director Rank</span>
                      <input
                        type="checkbox"
                        name="directorRank"
                        checked={form.directorRank}
                        onChange={handleChange}
                        disabled={isPending}
                        className="rounded border-brand-700 bg-background text-amber-500 w-4.5 h-4.5"
                      />
                    </label>
                    <label className="flex items-center justify-between p-2.5 rounded-lg border border-brand-800/40 bg-brand-950/40 cursor-pointer hover:bg-brand-900/30 transition-colors">
                      <span className="text-xs font-medium text-white/80">📊 TL Shareholder (1% Pool)</span>
                      <input
                        type="checkbox"
                        name="tlShareholder"
                        checked={form.tlShareholder}
                        onChange={handleChange}
                        disabled={isPending}
                        className="rounded border-brand-700 bg-background text-amber-500 w-4.5 h-4.5"
                      />
                    </label>
                    <label className="flex items-center justify-between p-2.5 rounded-lg border border-brand-800/40 bg-brand-950/40 cursor-pointer hover:bg-brand-900/30 transition-colors sm:col-span-2">
                      <span className="text-xs font-medium text-white/80">📊 Director Shareholder (1% Pool)</span>
                      <input
                        type="checkbox"
                        name="directorShareholder"
                        checked={form.directorShareholder}
                        onChange={handleChange}
                        disabled={isPending}
                        className="rounded border-brand-700 bg-background text-amber-500 w-4.5 h-4.5"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-brand-800/40">
                    <div>
                      <label className="block text-[11px] font-semibold text-brand-300 mb-1">TL Rank Earned At</label>
                      <input
                        type="date"
                        name="tlRankEarnedAt"
                        value={form.tlRankEarnedAt}
                        onChange={handleChange}
                        disabled={isPending}
                        className="w-full h-9 px-3 rounded-lg bg-background border border-brand-800/60 text-xs text-foreground focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-brand-300 mb-1">Director Rank Earned At</label>
                      <input
                        type="date"
                        name="directorRankEarnedAt"
                        value={form.directorRankEarnedAt}
                        onChange={handleChange}
                        disabled={isPending}
                        className="w-full h-9 px-3 rounded-lg bg-background border border-brand-800/60 text-xs text-foreground focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'membership' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs font-semibold text-brand-200 mb-1">Member Type</label>
                  <select
                    name="memberType"
                    value={form.memberType}
                    onChange={handleChange}
                    disabled={isPending}
                    className="w-full h-9.5 px-3 rounded-lg bg-background border border-border/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value="FREE">FREE</option>
                    <option value="BASIC">BASIC</option>
                    <option value="PREMIUM">PREMIUM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-200 mb-1">Active Membership Plan</label>
                  <select
                    name="membershipPlanId"
                    value={form.membershipPlanId}
                    onChange={handlePlanChange}
                    disabled={isPending}
                    className="w-full h-9.5 px-3 rounded-lg bg-background border border-border/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value="">No Active Plan (Free)</option>
                    {plans.filter(p => p.isActive).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (₹{p.price.toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-200 mb-1">Basic Membership Amount (₹)</label>
                  <input
                    type="number"
                    name="basicMembershipAmount"
                    value={form.basicMembershipAmount}
                    onChange={handleChange}
                    disabled={isPending}
                    className="w-full h-9.5 px-3 rounded-lg bg-background border border-brand-800/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-200 mb-1">Basic Activated At</label>
                  <input
                    type="datetime-local"
                    name="basicMembershipActivatedAt"
                    value={form.basicMembershipActivatedAt}
                    onChange={handleChange}
                    disabled={isPending}
                    className="w-full h-9.5 px-3 rounded-lg bg-background border border-brand-800/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-200 mb-1">Basic Expires At</label>
                  <input
                    type="date"
                    name="basicMembershipExpiresAt"
                    value={form.basicMembershipExpiresAt}
                    onChange={handleChange}
                    disabled={isPending}
                    className="w-full h-9.5 px-3 rounded-lg bg-background border border-brand-800/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-200 mb-1">Last Daily Yield Credited At</label>
                  <input
                    type="date"
                    name="lastDailyYieldAt"
                    value={form.lastDailyYieldAt}
                    onChange={handleChange}
                    disabled={isPending}
                    className="w-full h-9.5 px-3 rounded-lg bg-background border border-brand-800/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-2 border-t border-brand-800 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="px-4 font-semibold text-xs h-9.5 border-brand-700 bg-brand-900/50 hover:bg-brand-900 text-brand-300 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending}
              className="px-5 font-extrabold text-xs h-9.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl shadow-md transition-all active:scale-95"
            >
              {isPending ? 'Saving Details...' : 'Save Changes'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </ModalPortal>
  )
}

// ── UsersTable ────────────────────────────────────────────────────────────────
interface AssignReferrerModalProps {
  user: ReferralAssignableUser
  users: ReferralAssignableUser[]
  onClose: () => void
  onAssigned: () => void
}

function AssignReferrerModal({ user, users, onClose, onAssigned }: AssignReferrerModalProps) {
  const [isPending, startTransition] = useTransition()
  const [referrerId, setReferrerId] = useState('')
  const [query, setQuery] = useState('')

  const referrerOptions = useMemo(() => {
    const search = query.trim().toLowerCase()
    return users
      .filter((candidate) => candidate.id !== user.id)
      .filter((candidate) => {
        if (!search) return true
        return (
          candidate.name?.toLowerCase().includes(search) ||
          candidate.email?.toLowerCase().includes(search) ||
          candidate.referralCode?.toLowerCase().includes(search)
        )
      })
      .slice(0, 100)
  }, [query, user.id, users])

  function handleAssign(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await assignUserReferrerAction(user.id, referrerId)
      if (res.success) {
        toast({ title: 'Success', description: res.message })
        onAssigned()
        onClose()
      } else {
        toast({ title: 'Error', description: res.message, variant: 'destructive' })
      }
    })
  }

  return (
    <ModalPortal>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.78)' }}
        onClick={onClose}
      >
        <motion.form
          onSubmit={handleAssign}
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: 'spring', duration: 0.35 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-brand-800 bg-brand-950 p-6 shadow-2xl text-left cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-brand-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                Assign Referral Network
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Place <span className="text-primary font-semibold">{user.name}</span> under an existing user&apos;s referral tree.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-brand-300 hover:bg-brand-900 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            <div className="text-[11px] font-mono text-brand-300 bg-brand-900/30 px-3 py-2 rounded-lg border border-brand-800/40">
              User ID: {user.id}<br />
              Email: {user.email}
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-200 mb-1">Search Referrer</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, email, or referral code"
                disabled={isPending}
                className="w-full h-10 px-3 rounded-lg bg-background border border-border/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-200 mb-1">Existing Referrer</label>
              <select
                value={referrerId}
                onChange={(e) => setReferrerId(e.target.value)}
                disabled={isPending}
                required
                className="w-full h-10 px-3 rounded-lg bg-background border border-border/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="">Select a referrer</option>
                {referrerOptions.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name} - {candidate.email} ({candidate.referralCode})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-muted-foreground mt-2">
                This creates the same referral relationship as if the user registered with that referral code.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-brand-800 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="px-4 font-semibold text-xs h-9.5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !referrerId}
              className="px-5 font-extrabold text-xs h-9.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-md transition-all active:scale-95"
            >
              {isPending ? 'Assigning...' : 'Assign Referrer'}
            </Button>
          </div>
        </motion.form>
      </motion.div>
    </ModalPortal>
  )
}

interface DeleteUserModalProps {
  user: DeletableUser
  onClose: () => void
  onDeleted: () => void
}

function DeleteUserModal({ user, onClose, onDeleted }: DeleteUserModalProps) {
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState<'confirm' | 'email'>('confirm')
  const [emailConfirmation, setEmailConfirmation] = useState('')
  const [error, setError] = useState('')

  function handleDelete(e: React.FormEvent) {
    e.preventDefault()
    if (emailConfirmation !== user.email) {
      setError('Email address does not match. User was not deleted.')
      return
    }

    setError('')
    startTransition(async () => {
      const res = await deleteUserAction(user.id, emailConfirmation)
      if (res.success) {
        toast({ title: 'Success', description: res.message })
        onDeleted()
        onClose()
      } else {
        setError(res.message)
        toast({ title: 'Error', description: res.message, variant: 'destructive' })
      }
    })
  }

  return (
    <ModalPortal>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.78)' }}
        onClick={onClose}
      >
        <motion.form
          onSubmit={handleDelete}
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: 'spring', duration: 0.35 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-red-500/30 bg-brand-950 p-6 shadow-2xl text-left cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-brand-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-400" />
                Delete User
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {user.name} - {user.email}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-brand-300 hover:bg-brand-900 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {step === 'confirm' ? (
            <div className="mt-5 space-y-5">
              <p className="text-sm font-semibold text-white">Are you sure you want to delete this user?</p>
              <div className="flex justify-end gap-3 border-t border-brand-800 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="px-4 font-semibold text-xs h-9.5"
                >
                  No
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep('email')}
                  className="px-5 font-extrabold text-xs h-9.5 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-md transition-all active:scale-95"
                >
                  Yes
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-200 mb-1">
                  Copy and paste the user&apos;s email address to confirm
                </label>
                <input
                  type="email"
                  value={emailConfirmation}
                  onChange={(e) => {
                    setEmailConfirmation(e.target.value)
                    if (error) setError('')
                  }}
                  disabled={isPending}
                  className="w-full h-10 px-3 rounded-lg bg-background border border-border/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                />
                <p className="mt-2 text-[11px] font-mono text-brand-300">{user.email}</p>
              </div>

              {error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 border-t border-brand-800 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isPending}
                  className="px-4 font-semibold text-xs h-9.5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="px-5 font-extrabold text-xs h-9.5 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-md transition-all active:scale-95"
                >
                  {isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          )}
        </motion.form>
      </motion.div>
    </ModalPortal>
  )
}

export function UsersTable({ users, plans = [] }: UsersTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [filterName, setFilterName] = useState('')
  const [filterMembership, setFilterMembership] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterRank, setFilterRank] = useState<RankKey | 'ALL'>('ALL')
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [selectedUserMembership, setSelectedUserMembership] = useState<any | null>(null)
  const [editUser, setEditUser] = useState<any | null>(null)
  const [assignReferralUser, setAssignReferralUser] = useState<ReferralAssignableUser | null>(null)
  const [deleteUser, setDeleteUser] = useState<DeletableUser | null>(null)

  useEffect(() => {
    if (selectedUser || editUser || selectedUserMembership || assignReferralUser || deleteUser) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [selectedUser, editUser, selectedUserMembership, assignReferralUser, deleteUser])

  useEffect(() => {
    if (!selectedUser && !editUser && !selectedUserMembership && !assignReferralUser && !deleteUser) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedUser(null)
        setEditUser(null)
        setSelectedUserMembership(null)
        setAssignReferralUser(null)
        setDeleteUser(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedUser, editUser, selectedUserMembership, assignReferralUser, deleteUser])

  // Find the selected user in the current list to keep reactive updates
  const currentUser = useMemo(() => {
    if (!selectedUser) return null
    return users.find((u) => u.id === selectedUser.id) || selectedUser
  }, [users, selectedUser])

  // Find the selected user for membership updates to keep reactive updates
  const currentMembershipUser = useMemo(() => {
    if (!selectedUserMembership) return null
    return users.find((u) => u.id === selectedUserMembership.id) || selectedUserMembership
  }, [users, selectedUserMembership])

  // Map users to extract membershipPlanName for proper sorting
  const processedUsers = useMemo(() => {
    return users.map((user) => ({
      ...user,
      membershipPlanName: getMembershipDisplayName(user.membershipPlan?.name),
    }))
  }, [users])

  // Extract all unique membership plan names from users data
  const availablePlans = useMemo(() => {
    const plansSet = new Set<string>()
    users.forEach((u) => {
      const name = getMembershipDisplayName(u.membershipPlan?.name)
      if (name) plansSet.add(name)
    })
    if (plansSet.size === 0) {
      return ['Standard Membership', 'Bronze Membership', 'Silver Membership', 'Gold Membership', 'Diamond Membership', 'Platinum Membership']
    }
    return Array.from(plansSet)
  }, [users])

  // Apply filters
  const filteredUsers = useMemo(() => {
    return processedUsers.filter((user) => {
      // 1. Text Search (Name, Email, Phone)
      if (filterName) {
        const query = filterName.toLowerCase()
        const matchName = user.name?.toLowerCase().includes(query)
        const matchEmail = user.email?.toLowerCase().includes(query)
        const matchPhone = user.phone?.toLowerCase().includes(query)
        if (!matchName && !matchEmail && !matchPhone) return false
      }

      // 2. Membership Plan Filter
      if (filterMembership !== 'ALL') {
        if (user.membershipPlanName !== filterMembership) return false
      }

      // 3. Status Filter
      if (filterStatus !== 'ALL') {
        if (user.status !== filterStatus) return false
      }

      // 4. Rank Filter
      if (filterRank !== 'ALL') {
        const rank = getUserRank(user)
        if (rank.key !== filterRank) return false
      }

      return true
    })
  }, [processedUsers, filterName, filterMembership, filterStatus, filterRank])

  const handleToggleStatus = (userId: string) => {
    startTransition(async () => {
      const res = await toggleUserStatus(userId)
      if (res.success) {
        toast({ title: 'Success', description: res.message })
      } else {
        toast({ title: 'Error', description: res.message, variant: 'destructive' })
      }
    })
  }

  const handleToggleRank = (userId: string, rankType: 'starPerformer' | 'doubleStarPerformer' | 'elitePerformer' | 'tlRank' | 'tlShareholder' | 'directorRank' | 'directorShareholder', currentValue: boolean) => {
    startTransition(async () => {
      const res = await toggleUserRankAction(userId, rankType, !currentValue)
      if (res.success) {
        toast({ title: 'Success', description: res.message })
      } else {
        toast({ title: 'Error', description: res.message, variant: 'destructive' })
      }
    })
  }

  const handleGoToSite = (userId: string) => {
    startTransition(async () => {
      const res = await impersonateUserAction(userId)
      if (res.success && res.data?.redirectUrl) {
        toast({ title: 'Success', description: res.message })
        window.open(res.data.redirectUrl, '_blank')
      } else {
        toast({ title: 'Error', description: res.message, variant: 'destructive' })
      }
    })
  }

  const cols = [
    { key: 'name', label: 'Name', sortable: true, render: (v: unknown, row: any) => (
      <div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-medium">{String(v)}</p>
          {row.starPerformer && (
            <span className="text-[10px] bg-amber-500/20 text-amber-500 font-bold px-1 rounded border border-amber-500/20 cursor-default" title="Star Performer">⭐</span>
          )}
          {row.doubleStarPerformer && (
            <span className="text-[10px] bg-amber-500/30 text-amber-400 font-bold px-1 rounded border border-amber-500/30 cursor-default" title="Double Star Performer">⭐⭐</span>
          )}
          {row.elitePerformer && (
            <span className="text-[10px] bg-cyan-500/20 text-cyan-400 font-bold px-1 rounded border border-cyan-500/20 cursor-default" title="Elite Performer">💎</span>
          )}
          {row.tlRank && (
            <span className="text-[10px] bg-purple-500/20 text-purple-400 font-bold px-1 rounded border border-purple-500/20 cursor-default" title="TL Rank">🏆</span>
          )}
          {row.directorRank && (
            <span className="text-[10px] bg-rose-500/20 text-rose-400 font-bold px-1 rounded border border-rose-500/20 cursor-default" title="Director Rank">👑</span>
          )}
          {(row.tlShareholder || row.directorShareholder) && (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-1 rounded border border-emerald-500/20 cursor-default" title="1% Business Shareholder">📊</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{String(row.email)}</p>
      </div>
    )},
    { key: 'phone', label: 'Phone', render: (v: unknown) => <span className="text-xs font-mono">{String(v || '—')}</span> },
    { key: 'wallet', label: 'Balance', render: (v: unknown) => {
      const w = v as { mainBalance: number } | null
      return <span className="font-semibold text-sm">{formatCurrency(w?.mainBalance || 0)}</span>
    }},
    { key: 'membershipPlanName', label: 'Membership', sortable: true, render: (v: unknown, row: any) => {
      const planName = String(v)
      const planColor = row.membershipPlan?.color || '#3B82F6'
      return (
        <span 
          className="text-xs font-bold px-2.5 py-1 rounded-md border shadow-sm whitespace-nowrap"
          style={{ 
            backgroundColor: `${planColor}15`, 
            borderColor: `${planColor}30`,
            color: planColor 
          }}
        >
          {planName}
        </span>
      )
    }},
    // ── Rank Column ──────────────────────────────────────────────────────────
    { key: 'starPerformer', label: 'Rank', sortable: false, render: (_v: unknown, row: any) => {
      const rank = getUserRank(row)
      return (
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border whitespace-nowrap ${rank.color}`}
        >
          <span>{rank.icon}</span>
          <span>{rank.label}</span>
        </span>
      )
    }},
    { key: 'status', label: 'Status', sortable: true, render: (v: unknown) => <span className={`status-badge ${getStatusColor(String(v))}`}>{String(v)}</span> },
    { key: 'createdAt', label: 'Joined', sortable: true, render: (v: unknown) => <span className="text-xs text-muted-foreground">{formatDate(String(v))}</span> },
    { key: 'id', label: 'Actions', render: (id: string, row: any) => (
      <div className="flex flex-wrap gap-1">
        {/* Edit Button */}
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2 text-[10px] border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors"
          onClick={() => setEditUser(row)}
          disabled={isPending}
        >
          <Pencil className="w-3 h-3 mr-1" />
          Edit
        </Button>
        {!row.referredById && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-[10px] border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            onClick={() => setAssignReferralUser(row as ReferralAssignableUser)}
            disabled={isPending}
          >
            <UserPlus className="w-3 h-3 mr-1" />
            Assign Referrer
          </Button>
        )}
        {/* Go to Site Button */}
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2 text-[10px] border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors font-semibold"
          onClick={() => handleGoToSite(id)}
          disabled={isPending}
        >
          Go to Site
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-7 px-2 text-[10px] border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-colors"
          onClick={() => setSelectedUserMembership(row)}
          disabled={isPending}
        >
          Manage Membership
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-7 px-2 text-[10px] border-primary/30 text-primary hover:bg-primary/10 transition-colors"
          onClick={() => setSelectedUser(row)}
          disabled={isPending}
        >
          Manage Ranks
        </Button>
        <Button 
          size="sm" 
          variant={row.status === 'ACTIVE' ? 'destructive' : 'default'} 
          className="h-7 px-2 text-[10px]"
          onClick={() => handleToggleStatus(id)}
          disabled={isPending}
        >
          {row.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2 text-[10px] border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
          onClick={() => setDeleteUser(row as DeletableUser)}
          disabled={isPending}
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Delete
        </Button>
      </div>
    )},
  ]

  const hasActiveFilters = filterName || filterMembership !== 'ALL' || filterStatus !== 'ALL' || filterRank !== 'ALL'

  return (
    <div className="space-y-4">
      {/* Premium Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 backdrop-blur-sm">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={filterName}
            onChange={(e) => { setFilterName(e.target.value) }}
            className="w-full h-10 pl-10 pr-3 rounded-lg bg-background/50 border border-border/60 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>

        {/* Membership Dropdown */}
        <div>
          <select
            value={filterMembership}
            onChange={(e) => setFilterMembership(e.target.value)}
            className="w-full h-10 px-3 rounded-lg bg-background/50 border border-border/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
          >
            <option value="ALL">All Membership Plans</option>
            {availablePlans.map((plan) => (
              <option key={plan} value={plan}>
                {plan}
              </option>
            ))}
          </select>
        </div>

        {/* Rank Dropdown */}
        <div>
          <select
            value={filterRank}
            onChange={(e) => setFilterRank(e.target.value as RankKey | 'ALL')}
            className="w-full h-10 px-3 rounded-lg bg-background/50 border border-border/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
          >
            {ALL_RANK_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Dropdown + Reset */}
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 h-10 px-3 rounded-lg bg-background/50 border border-border/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING">Pending</option>
          </select>

          {/* Reset button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={() => {
                setFilterName('')
                setFilterMembership('ALL')
                setFilterStatus('ALL')
                setFilterRank('ALL')
              }}
              className="h-10 px-3 font-semibold shrink-0"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      <DataTable 
        data={filteredUsers} 
        columns={cols as any} 
        rowKey="id" 
        searchable={false}
        emptyMessage="No users found matching current filters" 
      />

      {/* Edit User Modal */}
      <AnimatePresence>
        {editUser && (
          <EditUserModal
            user={editUser}
            plans={plans}
            onClose={() => setEditUser(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {assignReferralUser && (
          <AssignReferrerModal
            user={assignReferralUser}
            users={users as ReferralAssignableUser[]}
            onClose={() => setAssignReferralUser(null)}
            onAssigned={() => router.refresh()}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteUser && (
          <DeleteUserModal
            user={deleteUser}
            onClose={() => setDeleteUser(null)}
            onDeleted={() => router.refresh()}
          />
        )}
      </AnimatePresence>

      {/* Manage User Membership Modal */}
      <AnimatePresence>
        {currentMembershipUser && (
          <ManageUserMembershipModal
            user={currentMembershipUser}
            plans={plans}
            onClose={() => setSelectedUserMembership(null)}
          />
        )}
      </AnimatePresence>

      {/* Rank & Badge Manager Modal — portaled to document.body to escape
          the <main z-10> stacking context that causes sidebar-hover flicker */}
      <AnimatePresence>
        {currentUser && (
          <ModalPortal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
              style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
              onClick={() => setSelectedUser(null)}
            >
              {/* Modal Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', duration: 0.4 }}
                className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border/80 bg-background p-6 shadow-2xl text-left cursor-default"
                onClick={(e) => e.stopPropagation()}
              >
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-muted pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">Manage Ranks &amp; Badges</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Assign, approve, or revoke ranks manually for <span className="text-primary font-semibold">{currentUser.name}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Scrollable Content */}
                  <div className="mt-4 max-h-[60vh] overflow-y-auto pr-1 space-y-3.5 scrollbar-thin">
                    {/* User email sub-header */}
                    <div className="text-[11px] font-mono text-muted-foreground bg-muted/20 px-3 py-1.5 rounded-lg border border-border/40">
                      User ID: {currentUser.id}<br/>
                      Email: {currentUser.email}
                    </div>

                    {/* Toggles list */}
                    {[
                      {
                        key: 'starPerformer',
                        icon: '⭐',
                        label: 'Star Performer Badge',
                        desc: 'Awarded for ₹5,000+ cumulative referral commission.',
                        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                      },
                      {
                        key: 'doubleStarPerformer',
                        icon: '⭐⭐',
                        label: 'Double Star Performer Badge',
                        desc: 'Awarded for ₹25,000+ cumulative referral commission.',
                        color: 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                      },
                      {
                        key: 'elitePerformer',
                        icon: '💎',
                        label: 'Elite Performer Badge',
                        desc: 'Awarded for ₹50,000+ cumulative referral commission.',
                        color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20'
                      },
                      {
                        key: 'tlRank',
                        icon: '🏆',
                        label: 'Team Leader (TL) Rank',
                        desc: 'Awarded for 5 active referrals & ₹1,00,000+ commission.',
                        color: 'text-purple-400 bg-purple-400/10 border-purple-400/20'
                      },
                      {
                        key: 'tlShareholder',
                        icon: '📊',
                        label: 'TL 1% Business Shareholder',
                        desc: 'Qualifies user to receive 1% business pool rewards (Max 25).',
                        color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                      },
                      {
                        key: 'directorRank',
                        icon: '👑',
                        label: 'Director Rank',
                        desc: 'Awarded for referring 5 Team Leaders.',
                        color: 'text-rose-400 bg-rose-400/10 border-rose-400/20'
                      },
                      {
                        key: 'directorShareholder',
                        icon: '📊',
                        label: 'Director 1% Business Shareholder',
                        desc: 'Qualifies user to receive 1% business pool rewards (Max 5).',
                        color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                      }
                    ].map((item) => {
                      const isChecked = !!currentUser[item.key]
                      return (
                        <div
                          key={item.key}
                          className="flex items-center justify-between p-3 rounded-xl border border-muted/50 bg-background/50 hover:bg-muted/10 transition-colors"
                        >
                          <div className="flex gap-3 items-start mr-4">
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${item.color} font-bold text-sm`}>
                              {item.icon}
                            </span>
                            <div>
                              <h4 className="text-xs font-semibold text-white/90">{item.label}</h4>
                              <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal">{item.desc}</p>
                            </div>
                          </div>

                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={isChecked}
                              onChange={() => handleToggleRank(currentUser.id, item.key as any, isChecked)}
                              disabled={isPending}
                            />
                            <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                      )
                    })}
                  </div>

                  {/* Footer */}
                  <div className="mt-6 flex justify-end border-t border-muted pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedUser(null)}
                      className="px-4 font-semibold text-xs h-9"
                    >
                      Close
                    </Button>
                  </div>
              </motion.div>
            </motion.div>
          </ModalPortal>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── ManageUserMembershipModal ──────────────────────────────────────────────────
interface ManageUserMembershipModalProps {
  user: any
  plans: any[]
  onClose: () => void
}

function ManageUserMembershipModal({ user, plans, onClose }: ManageUserMembershipModalProps) {
  const [isPending, startTransition] = useTransition()

  // Find user's current database membership plan to synchronize details
  const initialPlan = plans.find(p => p.id === user.membershipPlanId)

  const [form, setForm] = useState({
    memberType: initialPlan ? (initialPlan.name === 'Free Membership' ? 'FREE' : initialPlan.name === 'Basic Membership' ? 'BASIC' : 'PREMIUM') : 'FREE',
    membershipPlanId: initialPlan ? initialPlan.id : '',
    basicMembershipAmount: initialPlan ? initialPlan.price : 0,
    basicMembershipActivatedAt: user.basicMembershipActivatedAt ? new Date(user.basicMembershipActivatedAt).toISOString().slice(0, 16) : '',
    basicMembershipExpiresAt: user.basicMembershipExpiresAt ? new Date(user.basicMembershipExpiresAt).toISOString().split('T')[0] : '',
    lastDailyYieldAt: user.lastDailyYieldAt ? new Date(user.lastDailyYieldAt).toISOString().split('T')[0] : '',
  })

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const planId = e.target.value
    const selectedPlan = plans.find((p) => p.id === planId)

    setForm((prev) => {
      const next = { ...prev, membershipPlanId: planId }
      if (selectedPlan) {
        next.basicMembershipAmount = selectedPlan.price
        if (selectedPlan.name === 'Basic Membership') {
          next.memberType = 'BASIC'
        } else if (selectedPlan.name === 'Free Membership') {
          next.memberType = 'FREE'
        } else {
          next.memberType = 'PREMIUM'
        }
      } else {
        next.basicMembershipAmount = 0
        next.memberType = 'FREE'
      }
      return next
    })
  }

  const handleActivatedAtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const activatedAt = e.target.value
    const endDate = getMembershipEndDate(activatedAt)

    setForm((prev) => ({
      ...prev,
      basicMembershipActivatedAt: activatedAt,
      basicMembershipExpiresAt: endDate,
      lastDailyYieldAt: endDate,
    }))
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const payload = {
        memberType: form.memberType as 'FREE' | 'BASIC' | 'PREMIUM',
        membershipPlanId: form.membershipPlanId || null,
        basicMembershipAmount: Number(form.basicMembershipAmount) || 0,
        basicMembershipActivatedAt: form.basicMembershipActivatedAt || null,
        basicMembershipExpiresAt: form.basicMembershipExpiresAt || null,
        lastDailyYieldAt: form.lastDailyYieldAt || null,
      }

      const res = await updateUserAction(user.id, payload)
      if (res.success) {
        toast({ title: 'Success', description: 'User membership updated successfully' })
        onClose()
      } else {
        toast({ title: 'Error', description: res.message, variant: 'destructive' })
      }
    })
  }

  return (
    <ModalPortal>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 py-8 overflow-y-auto"
        style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-brand-800 bg-brand-950 p-6 shadow-2xl text-left cursor-default my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-brand-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                Manage Membership
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Assign and configure membership plans manually for <span className="text-primary font-semibold">{user.name}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-brand-300 hover:bg-brand-900 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="mt-4 space-y-4">
            <div className="text-[11px] font-mono text-brand-300 bg-brand-900/30 px-3 py-1.5 rounded-lg border border-brand-800/40">
              User ID: {user.id}<br/>
              Email: {user.email}
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-200 mb-1">Select Membership Plan</label>
              <select
                name="membershipPlanId"
                value={form.membershipPlanId}
                onChange={handlePlanChange}
                disabled={isPending}
                className="w-full h-9.5 px-3 rounded-lg bg-background border border-brand-800/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="">No Active Plan (Free)</option>
                {plans.filter(p => p.isActive).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (₹{p.price.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-200 mb-1">Member Type</label>
                <select
                  name="memberType"
                  value={form.memberType}
                  onChange={(e) => setForm((prev) => ({ ...prev, memberType: e.target.value as any }))}
                  disabled={isPending}
                  className="w-full h-9.5 px-3 rounded-lg bg-background border border-border/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                >
                  <option value="FREE">FREE</option>
                  <option value="BASIC">BASIC</option>
                  <option value="PREMIUM">PREMIUM</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-200 mb-1">Basic Amount (₹)</label>
                <input
                  type="number"
                  name="basicMembershipAmount"
                  value={form.basicMembershipAmount}
                  onChange={(e) => setForm((prev) => ({ ...prev, basicMembershipAmount: Number(e.target.value) || 0 }))}
                  disabled={isPending}
                  className="w-full h-9.5 px-3 rounded-lg bg-background border border-brand-850 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
            </div>

            <div className="border-t border-brand-800/60 pt-3 space-y-3">
              <h4 className="text-xs font-bold text-brand-300">Basic Membership Lifespan & Yield</h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-brand-200 mb-1 font-medium">Activated At</label>
                  <input
                    type="datetime-local"
                    name="basicMembershipActivatedAt"
                    value={form.basicMembershipActivatedAt}
                    onChange={handleActivatedAtChange}
                    disabled={isPending}
                    className="w-full h-8 px-2 rounded-lg bg-background border border-brand-800/60 text-xs text-foreground outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-brand-200 mb-1 font-medium">Expires At</label>
                  <input
                    type="date"
                    name="basicMembershipExpiresAt"
                    value={form.basicMembershipExpiresAt}
                    onChange={(e) => setForm((prev) => ({ ...prev, basicMembershipExpiresAt: e.target.value }))}
                    disabled={isPending}
                    className="w-full h-8 px-2 rounded-lg bg-background border border-brand-800/60 text-xs text-foreground outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-brand-200 mb-1 font-semibold">Last Yield Credited At</label>
                <input
                  type="date"
                  name="lastDailyYieldAt"
                  value={form.lastDailyYieldAt}
                  onChange={(e) => setForm((prev) => ({ ...prev, lastDailyYieldAt: e.target.value }))}
                  disabled={isPending}
                  className="w-full h-8.5 px-3 rounded-lg bg-background border border-brand-800/60 text-xs text-foreground outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-brand-800 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
                className="px-4 font-semibold text-xs h-9.5 border-brand-700 bg-brand-900/50 hover:bg-brand-900 text-brand-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="px-5 font-extrabold text-xs h-9.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl shadow-md transition-all active:scale-95"
              >
                {isPending ? 'Saving...' : 'Save Plan'}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </ModalPortal>
  )
}
