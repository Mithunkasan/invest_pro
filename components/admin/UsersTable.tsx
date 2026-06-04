'use client'

import { useTransition, useState, useMemo } from 'react'
import { DataTable } from '@/components/dashboard/DataTable'
import { formatDate, formatCurrency, getStatusColor } from '@/utils/formatters'
import { Button } from '@/components/ui/button'
import { toggleUserStatus, toggleUserRankAction } from '@/actions/admin'
import { toast } from '@/hooks/use-toast'
import { Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface UsersTableProps {
  users: any[]
}

export function UsersTable({ users }: UsersTableProps) {
  const [isPending, startTransition] = useTransition()
  const [filterName, setFilterName] = useState('')
  const [filterMembership, setFilterMembership] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [selectedUser, setSelectedUser] = useState<any | null>(null)

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

      return true
    })
  }, [processedUsers, filterName, filterMembership, filterStatus])

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
    { key: 'status', label: 'Status', sortable: true, render: (v: unknown) => <span className={`status-badge ${getStatusColor(String(v))}`}>{String(v)}</span> },
    { key: 'createdAt', label: 'Joined', sortable: true, render: (v: unknown) => <span className="text-xs text-muted-foreground">{formatDate(String(v))}</span> },
    { key: 'id', label: 'Actions', render: (id: string, row: any) => (
      <div className="flex flex-wrap gap-1">
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
      </div>
    )},
  ]

  return (
    <div className="space-y-4">
      {/* Premium Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 backdrop-blur-sm">
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
          {(filterName || filterMembership !== 'ALL' || filterStatus !== 'ALL') && (
            <Button
              variant="outline"
              onClick={() => {
                setFilterName('')
                setFilterMembership('ALL')
                setFilterStatus('ALL')
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

      {/* Rank & Badge Manager Modal */}
      <AnimatePresence>
        {currentUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border/80 bg-background p-6 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-muted pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Manage Ranks & Badges</h3>
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
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
