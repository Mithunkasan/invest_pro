'use client'

import { useTransition, useState, useMemo, useEffect } from 'react'
import { DataTable } from '@/components/dashboard/DataTable'
import { formatDate, formatCurrency } from '@/utils/formatters'
import { Button } from '@/components/ui/button'
import { updateUserAction } from '@/actions/admin'
import { toast } from '@/hooks/use-toast'
import { Search, X, Pencil, Sparkles, Crown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ModalPortal } from '@/components/common/ModalPortal'
import { getMembershipEndDate } from '@/utils/membershipDates'
import { getMembershipDisplayName } from '@/utils/membershipDisplay'

interface UserMembershipsTableProps {
  users: any[]
  plans: any[]
}

interface EditMembershipModalProps {
  user: any
  plans: any[]
  onClose: () => void
}

function EditMembershipModal({ user, plans, onClose }: EditMembershipModalProps) {
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

  // Autofill some plan values if the user selects a plan
  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const planId = e.target.value
    const selectedPlan = plans.find(p => p.id === planId)
    
    setForm(prev => {
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

    setForm(prev => ({
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
          <div className="flex items-center justify-between border-b border-brand-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                Assign Membership Plan
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Modifying membership subscription settings for <span className="text-primary font-semibold">{user.name}</span>
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
            <div>
              <label className="block text-xs font-semibold text-brand-200 mb-1">Select Membership Plan</label>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-200 mb-1">Member Type</label>
                <select
                  name="memberType"
                  value={form.memberType}
                  onChange={(e) => setForm(prev => ({ ...prev, memberType: e.target.value as any }))}
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
                  onChange={(e) => setForm(prev => ({ ...prev, basicMembershipAmount: Number(e.target.value) || 0 }))}
                  disabled={isPending}
                  className="w-full h-9.5 px-3 rounded-lg bg-background border border-border/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
            </div>

            <div className="border-t border-brand-800/60 pt-3 space-y-3">
              <h4 className="text-xs font-bold text-brand-300">Basic Membership Lifespan & Yield</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-brand-200 mb-1">Activated At</label>
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
                  <label className="block text-[11px] text-brand-200 mb-1">Expires At</label>
                  <input
                    type="date"
                    name="basicMembershipExpiresAt"
                    value={form.basicMembershipExpiresAt}
                    onChange={(e) => setForm(prev => ({ ...prev, basicMembershipExpiresAt: e.target.value }))}
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
                  onChange={(e) => setForm(prev => ({ ...prev, lastDailyYieldAt: e.target.value }))}
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
                {isPending ? 'Saving Plan...' : 'Save Plan'}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </ModalPortal>
  )
}

export function UserMembershipsTable({ users, plans }: UserMembershipsTableProps) {
  const [filterName, setFilterName] = useState('')
  const [filterType, setFilterType] = useState('ALL')
  const [filterPlan, setFilterPlan] = useState('ALL')
  const [editUser, setEditUser] = useState<any | null>(null)

  useEffect(() => {
    if (editUser) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [editUser])

  // Process data for sorting and mapping
  const processedUsers = useMemo(() => {
    return users.map((u) => ({
      ...u,
      planName: getMembershipDisplayName(u.membershipPlan?.name),
    }))
  }, [users])

  // Filter listings
  const filteredUsers = useMemo(() => {
    return processedUsers.filter((user) => {
      if (filterName) {
        const q = filterName.toLowerCase()
        const mName = user.name?.toLowerCase().includes(q)
        const mEmail = user.email?.toLowerCase().includes(q)
        if (!mName && !mEmail) return false
      }

      if (filterType !== 'ALL') {
        if (user.memberType !== filterType) return false
      }

      if (filterPlan !== 'ALL') {
        if (user.membershipPlanId !== filterPlan) return false
      }

      return true
    })
  }, [processedUsers, filterName, filterType, filterPlan])

  const cols = [
    {
      key: 'name',
      label: 'Member Info',
      sortable: true,
      render: (v: any, row: any) => (
        <div>
          <p className="text-sm font-semibold text-white/90">{String(v)}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'memberType',
      label: 'Type',
      sortable: true,
      render: (v: any) => {
        const type = String(v)
        const colors =
          type === 'PREMIUM'
            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            : type === 'BASIC'
            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
        return (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors}`}>
            {type}
          </span>
        )
      },
    },
    {
      key: 'planName',
      label: 'Active Plan Tier',
      sortable: true,
      render: (v: any, row: any) => {
        const planColor = row.membershipPlan?.color || '#94A3B8'
        return (
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full border border-white/10"
              style={{ backgroundColor: planColor }}
            />
            <span className="text-xs font-semibold" style={{ color: planColor }}>
              {String(v)}
            </span>
          </div>
        )
      },
    },
    {
      key: 'createdAt',
      label: 'Date Joined',
      sortable: true,
      render: (v: any) => <span className="text-xs text-muted-foreground">{formatDate(String(v))}</span>,
    },
    {
      key: 'id',
      label: 'Membership Actions',
      render: (id: string, row: any) => (
        <Button
          size="sm"
          variant="outline"
          className="h-7.5 px-2.5 text-xs border-brand-850 hover:bg-brand-900/60 text-brand-200 hover:text-white"
          onClick={() => setEditUser(row)}
        >
          <Pencil className="w-3.5 h-3.5 mr-1 text-amber-500" />
          Assign / Modify Plan
        </Button>
      ),
    },
  ]

  const hasActiveFilters = filterName || filterType !== 'ALL' || filterPlan !== 'ALL'

  return (
    <div className="space-y-4">
      {/* Search & Filter bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-brand-900/20 border border-brand-800/40 backdrop-blur-sm">
        {/* Name/Email search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search member name or email..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="w-full h-10 pl-10 pr-3 rounded-lg bg-background border border-brand-800 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* MemberType Filter */}
        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full h-10 px-3 rounded-lg bg-background border border-brand-800 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="ALL">All Membership Types</option>
            <option value="FREE">FREE</option>
            <option value="BASIC">BASIC</option>
            <option value="PREMIUM">PREMIUM</option>
          </select>
        </div>

        {/* Membership Plans Filter */}
        <div className="flex gap-2">
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="flex-1 h-10 px-3 rounded-lg bg-background border border-brand-800 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="ALL">All Active Tiers</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={() => {
                setFilterName('')
                setFilterType('ALL')
                setFilterPlan('ALL')
              }}
              className="h-10 px-3 font-semibold shrink-0"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Datatable */}
      <DataTable
        data={filteredUsers}
        columns={cols as any}
        rowKey="id"
        searchable={false}
        emptyMessage="No user memberships found matching criteria"
      />

      {/* Edit modal */}
      <AnimatePresence>
        {editUser && (
          <EditMembershipModal
            user={editUser}
            plans={plans}
            onClose={() => setEditUser(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
