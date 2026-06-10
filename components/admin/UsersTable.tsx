'use client'

import { useTransition, useState, useMemo, useEffect } from 'react'
import { DataTable } from '@/components/dashboard/DataTable'
import { formatDate, formatCurrency, getStatusColor } from '@/utils/formatters'
import { Button } from '@/components/ui/button'
import { toggleUserStatus, toggleUserRankAction, upgradeUserToPremiumAction, updateUserAction } from '@/actions/admin'
import { toast } from '@/hooks/use-toast'
import { Search, X, Pencil } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ModalPortal } from '@/components/common/ModalPortal'

interface UsersTableProps {
  users: any[]
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
  onClose: () => void
}

function EditUserModal({ user, onClose }: EditUserModalProps) {
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    addressLine: user.addressLine || '',
    city: user.city || '',
    state: user.state || '',
    pinCode: user.pinCode || '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSave() {
    startTransition(async () => {
      const res = await updateUserAction(user.id, form)
      if (res.success) {
        toast({ title: 'Success', description: res.message })
        onClose()
      } else {
        toast({ title: 'Error', description: res.message, variant: 'destructive' })
      }
    })
  }

  const fields: { name: keyof typeof form; label: string; type?: string }[] = [
    { name: 'name', label: 'Full Name' },
    { name: 'email', label: 'Email Address', type: 'email' },
    { name: 'phone', label: 'Phone Number', type: 'tel' },
    { name: 'addressLine', label: 'Address Line' },
    { name: 'city', label: 'City' },
    { name: 'state', label: 'State' },
    { name: 'pinCode', label: 'Pin Code' },
  ]

  return (
    <ModalPortal>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
        onClick={onClose}
      >
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
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Pencil className="w-4 h-4 text-primary" />
                Edit User
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Editing details for <span className="text-primary font-semibold">{user.name}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <div className="mt-4 max-h-[60vh] overflow-y-auto pr-1 space-y-3 scrollbar-thin">
            {/* User ID (read-only) */}
            <div className="text-[11px] font-mono text-muted-foreground bg-muted/20 px-3 py-1.5 rounded-lg border border-border/40">
              User ID: {user.id}
            </div>

            {fields.map((f) => (
              <div key={f.name}>
                <label className="block text-xs font-medium text-white/70 mb-1">{f.label}</label>
                <input
                  type={f.type || 'text'}
                  name={f.name}
                  value={form[f.name]}
                  onChange={handleChange}
                  disabled={isPending}
                  className="w-full h-9 px-3 rounded-lg bg-background/50 border border-border/60 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:opacity-60"
                />
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-2 border-t border-muted pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="px-4 font-semibold text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending}
              className="px-4 font-semibold text-xs h-9"
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </ModalPortal>
  )
}

// ── UsersTable ────────────────────────────────────────────────────────────────
export function UsersTable({ users }: UsersTableProps) {
  const [isPending, startTransition] = useTransition()
  const [filterName, setFilterName] = useState('')
  const [filterMembership, setFilterMembership] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterRank, setFilterRank] = useState<RankKey | 'ALL'>('ALL')
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [editUser, setEditUser] = useState<any | null>(null)

  useEffect(() => {
    if (selectedUser || editUser) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [selectedUser, editUser])

  useEffect(() => {
    if (!selectedUser && !editUser) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedUser(null)
        setEditUser(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedUser, editUser])

  // Find the selected user in the current list to keep reactive updates
  const currentUser = useMemo(() => {
    if (!selectedUser) return null
    return users.find((u) => u.id === selectedUser.id) || selectedUser
  }, [users, selectedUser])

  // Map users to extract membershipPlanName for proper sorting
  const processedUsers = useMemo(() => {
    return users.map((user) => ({
      ...user,
      membershipPlanName: user.membershipPlan?.name || 'Free Membership',
    }))
  }, [users])

  // Extract all unique membership plan names from users data
  const availablePlans = useMemo(() => {
    const plansSet = new Set<string>()
    users.forEach((u) => {
      const name = u.membershipPlan?.name
      if (name) plansSet.add(name)
    })
    if (plansSet.size === 0) {
      return ['Free Membership', 'Bronze Membership', 'Silver Membership', 'Gold Membership', 'Diamond Membership', 'Platinum Membership']
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

  const handleUpgradeToPremium = (userId: string) => {
    startTransition(async () => {
      const res = await upgradeUserToPremiumAction(userId)
      if (res.success) {
        toast({ title: 'Success', description: res.message })
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
        <Button 
          size="sm" 
          variant="outline" 
          className="h-7 px-2 text-[10px] border-primary/30 text-primary hover:bg-primary/10 transition-colors"
          onClick={() => setSelectedUser(row)}
          disabled={isPending}
        >
          Manage Ranks
        </Button>
        {row.memberType === 'BASIC' && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-[10px] border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
            onClick={() => handleUpgradeToPremium(id)}
            disabled={isPending}
          >
            Upgrade Premium
          </Button>
        )}
        <Button 
          size="sm" 
          variant={row.status === 'ACTIVE' ? 'destructive' : 'default'} 
          className="h-7 px-2 text-[10px]"
          onClick={() => handleToggleStatus(id)}
          disabled={isPending}
        >
          {row.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
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
            onClose={() => setEditUser(null)}
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
