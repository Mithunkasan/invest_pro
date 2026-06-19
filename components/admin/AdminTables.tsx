'use client'

import { useTransition, useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ModalPortal } from '@/components/common/ModalPortal'
import { DataTable } from '@/components/dashboard/DataTable'
import { formatDate, formatCurrency, getStatusColor } from '@/utils/formatters'
import { Button } from '@/components/ui/button'
import { 
  handleDeposit, 
  handleWithdrawal, 
  handleKYC, 
  toggleUserStatus,
  toggleUserRankAction,
  adjustUserBalanceAction,
  upsertMembershipPlanAction,
  deleteMembershipPlanAction
} from '@/actions/admin'
import { toast } from '@/hooks/use-toast'
import { Plus, Edit2, Trash2, X, PlusCircle, Search, Calendar } from 'lucide-react'

interface TableProps {
  data: any[]
}

export function UsersTable({ users }: { users: any[] }) {
  const [isPending, startTransition] = useTransition()
  const [filterName, setFilterName] = useState('')
  const [filterMembership, setFilterMembership] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')

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

  const handleToggleRank = (userId: string, rankType: 'starPerformer' | 'tlRank', currentValue: boolean) => {
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
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium">{String(v)}</p>
          {row.starPerformer && (
            <span className="text-[10px] bg-amber-500/20 text-amber-500 font-bold px-1 rounded border border-amber-500/20" title="Star Performer">⭐</span>
          )}
          {row.tlRank && (
            <span className="text-[10px] bg-purple-500/20 text-purple-500 font-bold px-1 rounded border border-purple-500/20" title="TL Rank">🏆</span>
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
          className={`h-7 px-1.5 text-[10px] ${row.starPerformer ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : ''}`}
          onClick={() => handleToggleRank(id, 'starPerformer', !!row.starPerformer)}
          disabled={isPending}
        >
          {row.starPerformer ? '- Star' : '+ Star'}
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className={`h-7 px-1.5 text-[10px] ${row.tlRank ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : ''}`}
          onClick={() => handleToggleRank(id, 'tlRank', !!row.tlRank)}
          disabled={isPending}
        >
          {row.tlRank ? '- TL' : '+ TL'}
        </Button>
        <Button 
          size="sm" 
          variant={row.status === 'ACTIVE' ? 'destructive' : 'default'} 
          className="h-7 px-1.5 text-[10px]"
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
    </div>
  )
}

export function DepositsTable({ data }: TableProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedDeposit, setSelectedDeposit] = useState<any | null>(null)

  const onHandle = (id: string, action: 'APPROVE' | 'REJECT') => {
    let remarks: string | undefined = undefined
    if (action === 'REJECT') {
      const input = prompt('Enter rejection reason (optional):')
      if (input === null) return // Cancelled
      remarks = input
    }
    startTransition(async () => {
      const res = await handleDeposit(id, action, remarks)
      if (res.success) {
        toast({ title: 'Success', description: res.message })
      } else {
        toast({ title: 'Error', description: res.message, variant: 'destructive' })
      }
    })
  }

  const openDocument = (url: string, title: string) => {
    if (url.startsWith('data:')) {
      const win = window.open()
      if (win) {
        win.document.write(`
          <html>
            <head>
              <title>${title}</title>
              <style>
                body { margin: 0; background: #0b0f19; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
                img { max-width: 100%; max-height: 100%; object-fit: contain; }
              </style>
            </head>
            <body>
              <img src="${url}" alt="${title}" />
            </body>
          </html>
        `)
        win.document.close()
      }
    } else {
      window.open(url, '_blank')
    }
  }

  const cols = [
    { key: 'user.name', label: 'User', render: (_: any, row: any) => (
      <div>
        <p className="text-sm font-medium">{row.user?.name || 'Unknown'}</p>
        <p className="text-xs text-muted-foreground">{row.user?.email || '—'}</p>
      </div>
    )},
    { key: 'amount', label: 'Amount', sortable: true, render: (v: any) => <span className="font-semibold">{formatCurrency(Number(v))}</span> },
    { key: 'method', label: 'Method', render: (v: any) => <span className="text-xs uppercase font-bold">{String(v)}</span> },
    { key: 'utrNumber', label: 'UTR', render: (v: any) => <span className="text-xs font-mono">{String(v || '—')}</span> },
    { key: 'status', label: 'Status', render: (v: any) => <span className={`status-badge ${getStatusColor(String(v))}`}>{String(v)}</span> },
    { key: 'createdAt', label: 'Date', render: (v: any) => <span className="text-xs text-muted-foreground">{formatDate(String(v))}</span> },
    { key: 'id', label: 'Actions', render: (id: string, row: any) => (
      <div className="flex items-center gap-1.5 flex-wrap">
        <Button 
          size="sm" 
          variant="outline" 
          className="h-7 px-2 text-xs border-primary/30 text-primary hover:bg-primary/10 font-bold"
          onClick={() => setSelectedDeposit(row)}
        >
          View
        </Button>
        {row.status === 'PENDING' && (
          <>
            <Button 
              size="sm" 
              variant="default" 
              className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700 font-bold"
              onClick={() => onHandle(id, 'APPROVE')}
              disabled={isPending}
            >
              Approve
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              className="h-7 px-2 text-xs font-bold"
              onClick={() => onHandle(id, 'REJECT')}
              disabled={isPending}
            >
              Reject
            </Button>
          </>
        )}
      </div>
    )},
  ]

  return (
    <>
      <DataTable data={data} columns={cols as any} rowKey="id" searchPlaceholder="Search deposits..." />

      {/* View Details Modal */}
      {selectedDeposit && (
        <ModalPortal>
          <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
            onClick={() => setSelectedDeposit(null)}
          >
            <div 
              className="relative w-full max-w-lg bg-brand-950 border border-brand-800 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-brand-800 pb-3">
                <div>
                  <h3 className="text-lg font-black text-white">Deposit Request Details</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono">Reference ID: {selectedDeposit.id}</p>
                </div>
                <button 
                  onClick={() => setSelectedDeposit(null)}
                  className="rounded-lg p-1 text-brand-300 hover:bg-brand-900 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grid info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">User</p>
                  <p className="font-semibold text-white/90">{selectedDeposit.user?.name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{selectedDeposit.user?.email || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</p>
                  <span className={`status-badge mt-1 inline-block ${getStatusColor(selectedDeposit.status)}`}>
                    {selectedDeposit.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Amount</p>
                  <p className="font-extrabold text-white text-base">{formatCurrency(selectedDeposit.amount)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Payment Method</p>
                  <p className="font-bold text-white uppercase">{selectedDeposit.method}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">UTR Number</p>
                  <p className="font-mono text-white/90 bg-muted/30 px-2 py-0.5 rounded border border-border/20 inline-block mt-0.5">
                    {selectedDeposit.utrNumber || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Date Requested</p>
                  <p className="text-muted-foreground mt-0.5">{formatDate(selectedDeposit.createdAt)}</p>
                </div>
                {selectedDeposit.remarks && (
                  <div className="col-span-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Remarks / Notes</p>
                    <p className="text-white/80 bg-muted/20 p-2 rounded border border-border/25 mt-1 text-xs">
                      {selectedDeposit.remarks}
                    </p>
                  </div>
                )}
              </div>

              {/* Proof Image */}
              {selectedDeposit.proofUrl ? (
                <div className="border border-border/40 rounded-xl overflow-hidden bg-black/40 p-2.5 text-center space-y-1.5">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Payment Proof Screenshot</p>
                  <img 
                    src={selectedDeposit.proofUrl} 
                    alt="Payment Proof" 
                    className="max-h-64 mx-auto object-contain cursor-pointer rounded-lg hover:opacity-95 transition-opacity"
                    onClick={() => openDocument(selectedDeposit.proofUrl, 'Payment Proof')}
                  />
                  <p className="text-[10px] text-muted-foreground">Click image to open full screen ↗</p>
                </div>
              ) : (
                <div className="border border-dashed border-border/40 rounded-xl p-6 text-center text-muted-foreground bg-muted/10">
                  No payment proof uploaded
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex justify-end gap-2 border-t border-brand-800 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedDeposit(null)}
                  className="px-4 font-semibold text-xs border-brand-700 bg-brand-900/50 hover:bg-brand-900 text-brand-300 hover:text-white"
                >
                  Close
                </Button>
                {selectedDeposit.status === 'PENDING' && (
                  <>
                    <Button 
                      onClick={() => { onHandle(selectedDeposit.id, 'REJECT'); setSelectedDeposit(null); }}
                      variant="destructive"
                      disabled={isPending}
                      className="px-4 font-extrabold text-xs"
                    >
                      Reject
                    </Button>
                    <Button 
                      onClick={() => { onHandle(selectedDeposit.id, 'APPROVE'); setSelectedDeposit(null); }}
                      disabled={isPending}
                      className="px-4 bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs"
                    >
                      Approve
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  )
}

export function WithdrawalsTable({ data }: TableProps) {
  const [isPending, startTransition] = useTransition()

  const onHandle = (id: string, action: 'APPROVE' | 'REJECT') => {
    startTransition(async () => {
      const res = await handleWithdrawal(id, action)
      if (res.success) {
        toast({ title: 'Success', description: res.message })
      } else {
        toast({ title: 'Error', description: res.message, variant: 'destructive' })
      }
    })
  }

  const cols = [
    { key: 'user.name', label: 'User', render: (_: any, row: any) => (
      <div>
        <p className="text-sm font-medium">{row.user.name}</p>
        <p className="text-xs text-muted-foreground">{row.user.email}</p>
      </div>
    )},
    { key: 'amount', label: 'Amount', sortable: true, render: (v: any, row: any) => (
      <div>
        <p className="font-semibold text-sm">{formatCurrency(Number(v))}</p>
        {row.deduction > 0 && (
          <p className="text-[10px] text-muted-foreground mt-0.5 whitespace-nowrap">
            Net: <span className="text-green-500 font-bold">{formatCurrency(row.netAmount)}</span> (deducted {formatCurrency(row.deduction)})
          </p>
        )}
      </div>
    )},
    { key: 'bankDetails', label: 'Bank Details', render: (_: any, row: any) => (
      <div className="text-[10px] leading-tight">
        <p className="font-bold">{row.bankDetails.bankName}</p>
        <p>{row.bankDetails.accountNo}</p>
        <p>{row.bankDetails.ifsc}</p>
      </div>
    )},
    { key: 'status', label: 'Status', render: (v: any) => <span className={`status-badge ${getStatusColor(String(v))}`}>{String(v)}</span> },
    { key: 'createdAt', label: 'Date', render: (v: any) => <span className="text-xs text-muted-foreground">{formatDate(String(v))}</span> },
    { key: 'id', label: 'Actions', render: (id: string, row: any) => row.status === 'PENDING' && (
      <div className="flex gap-1">
        <Button 
          size="sm" 
          variant="default" 
          className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700"
          onClick={() => onHandle(id, 'APPROVE')}
          disabled={isPending}
        >Pay</Button>
        <Button 
          size="sm" 
          variant="destructive" 
          className="h-7 px-2 text-xs"
          onClick={() => onHandle(id, 'REJECT')}
          disabled={isPending}
        >Reject</Button>
      </div>
    )},
  ]
  return <DataTable data={data} columns={cols as any} rowKey="id" searchPlaceholder="Search withdrawals..." />
}

export function KycTable({ data }: TableProps) {
  const [isPending, startTransition] = useTransition()

  const onHandle = (id: string, action: 'APPROVED' | 'REJECTED') => {
    startTransition(async () => {
      const res = await handleKYC(id, action)
      if (res.success) {
        toast({ title: 'Success', description: res.message })
      } else {
        toast({ title: 'Error', description: res.message, variant: 'destructive' })
      }
    })
  }

  const openDocument = (url: string, title: string) => {
    if (url.startsWith('data:')) {
      const win = window.open()
      if (win) {
        win.document.write(`
          <html>
            <head>
              <title>${title}</title>
              <style>
                body { margin: 0; background: #0b0f19; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
                img { max-width: 100%; max-height: 100%; object-fit: contain; }
              </style>
            </head>
            <body>
              <img src="${url}" alt="${title}" />
            </body>
          </html>
        `)
        win.document.close()
      }
    } else {
      window.open(url, '_blank')
    }
  }

  const cols = [
    { key: 'user.name', label: 'User', render: (_: any, row: any) => (
      <div>
        <p className="text-sm font-medium">{row.user.name}</p>
        <p className="text-xs text-muted-foreground">{row.user.email}</p>
      </div>
    )},
    { key: 'aadhaarNo', label: 'Aadhaar / PAN', render: (_: any, row: any) => (
      <div className="text-[10px] space-y-0.5">
        <p className="font-semibold text-white/90">Aadhaar: <span className="font-mono text-muted-foreground">{row.aadhaarNo || '—'}</span></p>
        <p className="font-semibold text-white/90">PAN: <span className="font-mono text-muted-foreground">{row.panNo || '—'}</span></p>
        <div className="flex items-center gap-2 mt-1">
          {row.aadhaarUrl ? (
            <button
              type="button"
              onClick={() => openDocument(row.aadhaarUrl, `${row.user?.name || 'User'}'s Aadhaar Card`)}
              className="text-primary hover:underline font-bold text-[9px] bg-transparent border-none p-0 cursor-pointer outline-none"
            >
              📄 View Aadhaar
            </button>
          ) : (
            <span className="text-muted-foreground text-[9px]">No Aadhaar Image</span>
          )}
          <span className="text-muted-foreground/30">•</span>
          {row.panUrl ? (
            <button
              type="button"
              onClick={() => openDocument(row.panUrl, `${row.user?.name || 'User'}'s PAN Card`)}
              className="text-primary hover:underline font-bold text-[9px] bg-transparent border-none p-0 cursor-pointer outline-none"
            >
              📄 View PAN
            </button>
          ) : (
            <span className="text-muted-foreground text-[9px]">No PAN Image</span>
          )}
        </div>
      </div>
    )},
    { key: 'status', label: 'Status', render: (v: any) => <span className={`status-badge ${getStatusColor(String(v))}`}>{String(v)}</span> },
    { key: 'createdAt', label: 'Submitted', render: (v: any) => <span className="text-xs text-muted-foreground">{formatDate(String(v))}</span> },
    { key: 'id', label: 'Actions', render: (id: string, row: any) => row.status === 'PENDING' && (
      <div className="flex gap-1">
        <Button 
          size="sm" 
          variant="default" 
          className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700"
          onClick={() => onHandle(id, 'APPROVED')}
          disabled={isPending}
        >Verify</Button>
        <Button 
          size="sm" 
          variant="destructive" 
          className="h-7 px-2 text-xs"
          onClick={() => onHandle(id, 'REJECTED')}
          disabled={isPending}
        >Reject</Button>
      </div>
    )},
  ]
  return <DataTable data={data} columns={cols as any} rowKey="id" searchPlaceholder="Search KYC..." />
}

export function ReferralsTable({ data }: TableProps) {
  const cols = [
    { key: 'referrer.name', label: 'Referrer', render: (_: any, row: any) => (
      <div>
        <p className="text-sm font-medium">{row.referrer.name}</p>
        <p className="text-xs text-muted-foreground">{row.referrer.email}</p>
      </div>
    )},
    { key: 'referred.name', label: 'Referred User', render: (_: any, row: any) => (
      <div>
        <p className="text-sm font-medium">{row.referred.name}</p>
        <p className="text-xs text-muted-foreground">{row.referred.email}</p>
      </div>
    )},
    { key: 'commission', label: 'Commission', render: (v: any) => <span className="text-green-500 font-bold">{formatCurrency(Number(v))}</span> },
    { key: 'level', label: 'Level', render: (v: any) => <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">Lvl {String(v)}</span> },
    { key: 'createdAt', label: 'Date', render: (v: any) => <span className="text-xs text-muted-foreground">{formatDate(String(v))}</span> },
  ]
  return <DataTable data={data} columns={cols as any} rowKey="id" searchPlaceholder="Search referrers..." />
}

export function WalletsTable({ data }: TableProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedWallet, setSelectedWallet] = useState<{ userId: string; name: string } | null>(null)
  const [adjustData, setAdjustData] = useState({
    walletType: 'MAIN' as any,
    amount: '',
    operation: 'ADD' as 'ADD' | 'SUBTRACT'
  })

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedWallet) return

    startTransition(async () => {
      const res = await adjustUserBalanceAction(
        selectedWallet.userId,
        adjustData.walletType,
        Number(adjustData.amount),
        adjustData.operation
      )

      if (res.success) {
        toast({ title: 'Success', description: res.message })
        setSelectedWallet(null)
        setAdjustData({ walletType: 'MAIN', amount: '', operation: 'ADD' })
      } else {
        toast({ title: 'Error', description: res.message, variant: 'destructive' })
      }
    })
  }

  useEffect(() => {
    if (selectedWallet) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [selectedWallet])

  useEffect(() => {
    if (!selectedWallet) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedWallet(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedWallet])

  const cols = [
    { key: 'user.name', label: 'User', render: (_: any, row: any) => (
      <div>
        <p className="text-sm font-medium">{row.user.name}</p>
        <p className="text-xs text-muted-foreground">{row.user.email}</p>
      </div>
    )},
    { key: 'mainBalance', label: 'Main', render: (v: any) => <span className="font-bold text-xs">{formatCurrency(Number(v))}</span> },
    { key: 'depositBalance', label: 'Deposit', render: (v: any) => <span className="text-blue-400 font-bold text-xs">{formatCurrency(Number(v))}</span> },
    { key: 'rewardBalance', label: 'Reward', render: (v: any) => <span className="text-amber-500 font-bold text-xs">{formatCurrency(Number(v))}</span> },
    { key: 'referralBalance', label: 'Referral', render: (_: any, row: any) => <span className="text-purple-500 font-bold text-xs">{formatCurrency((row.referralBalance || 0) + (row.levelBalance || 0))}</span> },
    { key: 'shareBalance', label: 'Share', render: (v: any) => <span className="text-cyan-500 font-bold text-xs">{formatCurrency(Number(v))}</span> },
    { key: 'bonusBalance', label: 'Bonus', render: (v: any) => <span className="text-orange-500 font-bold text-xs">{formatCurrency(Number(v))}</span> },
    { key: 'userId', label: 'Actions', render: (userId: string, row: any) => (
      <Button 
        size="sm" 
        variant="default" 
        className="h-7 px-2 text-xs"
        onClick={() => setSelectedWallet({ userId, name: row.user.name })}
        disabled={isPending}
      >
        Adjust
      </Button>
    )}
  ]

  return (
    <>
      <DataTable data={data} columns={cols as any} rowKey="userId" searchPlaceholder="Search user wallets..." />

      {/* Adjust Balance Glassmorphic Dialog Modal */}
      {selectedWallet && (
        <ModalPortal>
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
            onClick={() => setSelectedWallet(null)}
          >
          <div 
            className="p-6 w-full max-w-md bg-card/95 border border-border rounded-2xl shadow-2xl relative space-y-4 text-left cursor-default animate-in fade-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
              <h3 className="text-lg font-bold text-white/90">Adjust Wallet Balance</h3>
              <p className="text-xs text-muted-foreground">Adjusting wallets for <span className="text-primary font-bold">{selectedWallet.name}</span></p>

              <form onSubmit={handleAdjustSubmit} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Wallet Type</label>
                  <select 
                    className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground focus:ring-1 focus:ring-primary outline-none"
                    value={adjustData.walletType}
                    onChange={(e) => setAdjustData(prev => ({ ...prev, walletType: e.target.value as any }))}
                    disabled={isPending}
                  >
                    <option value="MAIN">Main Wallet</option>
                    <option value="REWARD">Reward Wallet</option>
                    <option value="REFERRAL">Referral Income</option>
                    <option value="LEVEL">Level Income</option>
                    <option value="SHARE">Share Wallet</option>
                    <option value="BONUS">Bonus Wallet</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Operation</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      type="button"
                      className={`h-9 rounded-lg text-xs font-bold transition-all ${adjustData.operation === 'ADD' ? 'bg-green-600 text-white shadow-md' : 'bg-muted text-muted-foreground'}`}
                      onClick={() => setAdjustData(prev => ({ ...prev, operation: 'ADD' }))}
                      disabled={isPending}
                    >
                      Add Balance (+)
                    </button>
                    <button 
                      type="button"
                      className={`h-9 rounded-lg text-xs font-bold transition-all ${adjustData.operation === 'SUBTRACT' ? 'bg-red-600 text-white shadow-md' : 'bg-muted text-muted-foreground'}`}
                      onClick={() => setAdjustData(prev => ({ ...prev, operation: 'SUBTRACT' }))}
                      disabled={isPending}
                    >
                      Subtract Balance (-)
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Amount (₹)</label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    placeholder="Enter adjustment amount"
                    className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                    value={adjustData.amount}
                    onChange={(e) => setAdjustData(prev => ({ ...prev, amount: e.target.value }))}
                    disabled={isPending}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setSelectedWallet(null)} 
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isPending}
                    className={adjustData.operation === 'ADD' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                  >
                    {isPending ? 'Processing...' : 'Apply Adjustment'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  )
}

export function AdminNotificationsTable({ 
  data, 
  plans = [], 
  pendingCounts 
}: { 
  data: any[]; 
  plans?: any[]; 
  pendingCounts?: any; 
}) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filterMembership, setFilterMembership] = useState('ALL')

  // Helper function to resolve user's membership display name
  const getMembershipLabel = (row: any): string => {
    if (row.user?.membershipPlan?.name) {
      return row.user.membershipPlan.name.replace(' Membership', '')
    }
    const memberType = row.user?.memberType || 'FREE'
    if (memberType === 'FREE') return 'Free'
    if (memberType === 'BASIC') return 'Basic'
    if (memberType === 'PREMIUM') return 'Premium'
    return 'Free'
  }

  const filteredData = useMemo(() => {
    return data.filter((row: any) => {
      // 1. Membership Filter
      if (filterMembership !== 'ALL') {
        const mLabel = getMembershipLabel(row)
        if (mLabel.toLowerCase() !== filterMembership.toLowerCase()) return false
      }

      // 2. Date Filter
      const created = new Date(row.createdAt)
      if (startDate) {
        const filterStart = new Date(startDate + 'T00:00:00')
        if (created < filterStart) return false
      }
      if (endDate) {
        const filterEnd = new Date(endDate + 'T23:59:59.999')
        if (created > filterEnd) return false
      }

      return true
    })
  }, [data, filterMembership, startDate, endDate])

  const cols = [
    { key: 'user.name', label: 'User', render: (_: any, row: any) => (
      <div>
        <p className="text-sm font-medium">{row.user?.name || 'Unknown'}</p>
        <p className="text-[10px] text-muted-foreground">{row.user?.email || '—'}</p>
        <span className="text-[9px] px-1.5 py-0.5 mt-1 rounded bg-muted/60 text-muted-foreground font-semibold border border-border/40 inline-block">
          {getMembershipLabel(row)}
        </span>
      </div>
    )},
    { key: 'title', label: 'Title', render: (v: any, row: any) => {
      const titleStr = String(v)
      let countToShow: number | undefined = undefined

      if (pendingCounts) {
        const lowerTitle = titleStr.toLowerCase()
        if (lowerTitle.includes('deposit')) {
          countToShow = pendingCounts.deposits
        } else if (lowerTitle.includes('withdrawal')) {
          countToShow = pendingCounts.withdrawals
        } else if (lowerTitle.includes('kyc') || lowerTitle.includes('document')) {
          countToShow = pendingCounts.kyc
        } else if (lowerTitle.includes('gift')) {
          countToShow = pendingCounts.gifts
        } else if (lowerTitle.includes('upgrade') || lowerTitle.includes('membership')) {
          countToShow = pendingCounts.memberships
        } else if (lowerTitle.includes('ticket')) {
          countToShow = pendingCounts.tickets
        } else if (lowerTitle.includes('password')) {
          countToShow = pendingCounts.passwordResets
        }
      }

      return (
        <span className="font-bold flex items-center gap-1.5 flex-wrap">
          {titleStr}
          {countToShow !== undefined && countToShow > 0 && (
            <span className="bg-red-500/10 text-red-500 text-[10px] font-black px-1.5 py-0.5 rounded border border-red-500/25 shrink-0">
              Pending: {countToShow}
            </span>
          )}
          {!row.isRead && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" title="Unread" />
          )}
        </span>
      )
    } },
    { key: 'message', label: 'Message', render: (v: any) => <p className="text-xs max-w-xs truncate">{String(v)}</p> },
    { key: 'type', label: 'Type', render: (v: any) => <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${v === 'SUCCESS' ? 'bg-green-500/10 text-green-500' : v === 'ERROR' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>{String(v)}</span> },
    { key: 'createdAt', label: 'Sent', render: (v: any) => <span className="text-xs text-muted-foreground">{formatDate(String(v))}</span> },
  ]

  const hasActiveFilters = startDate || endDate || filterMembership !== 'ALL'

  const handleClearFilters = () => {
    setStartDate('')
    setEndDate('')
    setFilterMembership('ALL')
  }

  const membershipOptions = useMemo(() => {
    const dbOptions = plans.map((plan: any) => plan.name.replace(' Membership', ''))
    return Array.from(new Set(dbOptions)).filter(Boolean) as string[]
  }, [plans])

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 backdrop-blur-sm">
        {/* Membership Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Membership Type</label>
          <select
            value={filterMembership}
            onChange={(e) => setFilterMembership(e.target.value)}
            className="w-full h-10 px-3 rounded-lg bg-background/50 border border-border/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
          >
            <option value="ALL">All Memberships</option>
            {membershipOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full h-10 px-3 rounded-lg bg-background/50 border border-border/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
          />
        </div>

        {/* End Date + Reset button */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> End Date
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 h-10 px-3 rounded-lg bg-background/50 border border-border/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
            />
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={handleClearFilters}
                className="h-10 px-3 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 font-bold border border-rose-500/20"
              >
                <X className="w-4 h-4 mr-1" /> Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      <DataTable data={filteredData} columns={cols as any} rowKey="id" searchPlaceholder="Search notifications..." />
    </div>
  )
}

export function SecurityLogsTable({ data }: TableProps) {
  const cols = [
    { key: 'name', label: 'User', render: (_: any, row: any) => (
      <div>
        <p className="text-sm font-medium">{row.name}</p>
        <p className="text-xs text-muted-foreground">{row.email}</p>
      </div>
    )},
    { key: 'status', label: 'Action/Status', render: (v: any) => <span className={`status-badge ${v === 'SUSPENDED' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{String(v)}</span> },
    { key: 'updatedAt', label: 'Time', render: (v: any) => <span className="text-xs text-muted-foreground">{formatDate(String(v))}</span> },
  ]
  return <DataTable data={data} columns={cols as any} rowKey="email" searchPlaceholder="Search logs..." />
}

export function MembershipsTable({ data }: TableProps) {
  const [isPending, startTransition] = useTransition()
  const [isModalOpen, setModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    durationDays: '365',
    depositBonus: '0',
    referralLevel1: '10',
    referralLevel2: '0',
    referralLevel3: '0',
    withdrawalTime: '24-48 Hours',
    support: 'Standard Email',
    color: '#3B82F6',
    isActive: true
  })

  const [featuresList, setFeaturesList] = useState<string[]>([])
  const [newFeatureText, setNewFeatureText] = useState('')

  const handleOpenEdit = (plan: any) => {
    setSelectedPlan(plan)
    setFormData({
      name: plan.name,
      price: String(plan.price),
      durationDays: String(plan.durationDays),
      depositBonus: String(plan.depositBonus),
      referralLevel1: String(plan.referralLevel1),
      referralLevel2: String(plan.referralLevel2),
      referralLevel3: String(plan.referralLevel3),
      withdrawalTime: plan.withdrawalTime,
      support: plan.support,
      color: plan.color,
      isActive: plan.isActive
    })
    setFeaturesList(plan.features || [])
    setNewFeatureText('')
    setModalOpen(true)
  }

  const handleOpenCreate = () => {
    setSelectedPlan(null)
    setFormData({
      name: '',
      price: '',
      durationDays: '365',
      depositBonus: '0',
      referralLevel1: '10',
      referralLevel2: '0',
      referralLevel3: '0',
      withdrawalTime: '24-48 Hours',
      support: 'Standard Email',
      color: '#3B82F6',
      isActive: true
    })
    setFeaturesList([])
    setNewFeatureText('')
    setModalOpen(true)
  }

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return
    setFeaturesList(prev => [...prev, newFeatureText.trim()])
    setNewFeatureText('')
  }

  const handleRemoveFeature = (index: number) => {
    setFeaturesList(prev => prev.filter((_, idx) => idx !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const res = await upsertMembershipPlanAction({
        id: selectedPlan?.id,
        name: formData.name,
        price: Number(formData.price),
        durationDays: Number(formData.durationDays),
        depositBonus: Number(formData.depositBonus || 0),
        referralLevel1: Number(formData.referralLevel1 || 0),
        referralLevel2: Number(formData.referralLevel2 || 0),
        referralLevel3: Number(formData.referralLevel3 || 0),
        withdrawalTime: formData.withdrawalTime,
        support: formData.support,
        features: featuresList,
        color: formData.color,
        isActive: formData.isActive
      })

      if (res.success) {
        toast({ title: 'Success', description: res.message })
        setModalOpen(false)
      } else {
        toast({ title: 'Error', description: res.message, variant: 'destructive' })
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this membership plan? This action cannot be undone.')) return
    startTransition(async () => {
      const res = await deleteMembershipPlanAction(id)
      if (res.success) {
        toast({ title: 'Success', description: res.message })
      } else {
        toast({ title: 'Error', description: res.message, variant: 'destructive' })
      }
    })
  }

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [isModalOpen])

  useEffect(() => {
    if (!isModalOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen])

  const cols = [
    { key: 'name', label: 'Plan Name', sortable: true, render: (v: any, row: any) => (
      <div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border border-white/20 shadow-sm shrink-0" style={{ backgroundColor: row.color }} />
          <span className="font-bold text-white/90">{String(v)}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${row.isActive ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
            {row.isActive ? 'Active' : 'Inactive'}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {row.durationDays === -1 ? 'Lifetime' : `${row.durationDays} Days`}
          </span>
        </div>
      </div>
    )},
    { key: 'price', label: 'Pricing', sortable: true, render: (v: any) => (
      <span className="font-black text-sm text-brand-100">{formatCurrency(Number(v))}</span>
    )},
    { key: 'depositBonus', label: 'Yield Bonus', render: (v: any) => (
      <span className="text-xs text-amber-500 font-extrabold">+{String(v)}% Yield</span>
    )},
    { key: 'withdrawalTime', label: 'Limits & Support', render: (_: any, row: any) => (
      <div className="text-[10px] space-y-0.5 max-w-[150px] truncate leading-tight">
        <p className="text-brand-300 font-medium">⚡ {row.withdrawalTime}</p>
        <p className="text-muted-foreground">💬 {row.support}</p>
      </div>
    )},
    { key: 'features', label: 'Features Count', render: (v: any) => {
      const list = v as string[]
      return <span className="text-xs text-brand-300 font-mono bg-brand-900/40 border border-brand-850 px-2 py-0.5 rounded-md">{list?.length || 0} items</span>
    }},
    { key: 'id', label: 'Actions', render: (id: string, row: any) => (
      <div className="flex gap-1.5">
        <Button 
          size="sm" 
          variant="outline" 
          className="h-7.5 px-2 text-xs border-brand-700 bg-brand-800/40 hover:bg-brand-700/60 text-brand-200 hover:text-white"
          onClick={() => handleOpenEdit(row)}
          disabled={isPending}
        >
          <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
        </Button>
        <Button 
          size="sm" 
          variant="destructive" 
          className="h-7.5 px-2 text-xs"
          onClick={() => handleDelete(id)}
          disabled={isPending}
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
        </Button>
      </div>
    )},
  ]

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 pb-4 border-b border-border/40">
        <div>
          <h3 className="text-lg font-bold text-white/90">Plans List</h3>
          <p className="text-xs text-muted-foreground">Manage and set up membership plans for users.</p>
        </div>
        <Button 
          onClick={handleOpenCreate}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold flex items-center gap-1.5 h-9.5 px-4 shadow-lg rounded-xl shrink-0 transition-all active:scale-95"
        >
          <Plus className="w-4.5 h-4.5" /> Add New Plan
        </Button>
      </div>

      <DataTable data={data} columns={cols as any} rowKey="id" searchPlaceholder="Search plan names..." />

      {/* Add / Edit Glassmorphic Dialog Modal */}
      {isModalOpen && (
        <ModalPortal>
          <div
            className="fixed inset-0 z-[9999] flex items-start justify-center p-4 py-8 overflow-y-auto"
            style={{ backgroundColor: 'rgba(0,0,0,0.80)' }}
            onClick={() => setModalOpen(false)}
          >
          <div 
            className="p-6 w-full max-w-2xl bg-brand-950 border border-brand-800 rounded-2xl shadow-2xl relative space-y-4 text-left cursor-default animate-in fade-in zoom-in-95 duration-300 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
              <button 
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-brand-900/60 border border-brand-800 flex items-center justify-center hover:bg-brand-800 text-brand-300 hover:text-white transition-colors"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <PlusCircle className="w-6 h-6 text-amber-500" />
                {selectedPlan ? 'Modify Membership Plan' : 'Create New Membership Plan'}
              </h3>
              <p className="text-xs text-muted-foreground -mt-2">
                {selectedPlan ? `Updating details for: ${selectedPlan.name}` : 'Set up parameters and perks for this new tier.'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                {/* Primary Config Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Plan Name</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Diamond Elite"
                      className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      disabled={isPending}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Price (₹)</label>
                    <input 
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="e.g. 4999"
                      className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      disabled={isPending}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                      <span>Duration in Days</span>
                      <span className="text-[10px] text-amber-500 font-bold">Use -1 for Lifetime</span>
                    </label>
                    <input 
                      type="number"
                      required
                      placeholder="e.g. 365"
                      className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                      value={formData.durationDays}
                      onChange={(e) => setFormData(prev => ({ ...prev, durationDays: e.target.value }))}
                      disabled={isPending}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Deposit Bonus Yield (%)</label>
                    <input 
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="e.g. 2.5"
                      className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                      value={formData.depositBonus}
                      onChange={(e) => setFormData(prev => ({ ...prev, depositBonus: e.target.value }))}
                      disabled={isPending}
                    />
                  </div>
                </div>

                {/* Service Configs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Withdrawal Time Description</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. 2 Hours, 24-48 Hours"
                      className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                      value={formData.withdrawalTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, withdrawalTime: e.target.value }))}
                      disabled={isPending}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Support Tier Description</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. 24/7 Premium, Standard Email"
                      className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                      value={formData.support}
                      onChange={(e) => setFormData(prev => ({ ...prev, support: e.target.value }))}
                      disabled={isPending}
                    />
                  </div>
                </div>

                {/* Styling & Features row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-xs font-semibold text-muted-foreground">Accent Hex Color</label>
                    <div className="flex gap-2">
                      <input 
                        type="color"
                        className="w-10 h-10 rounded-lg bg-transparent border-0 cursor-pointer outline-none shrink-0"
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        disabled={isPending}
                      />
                      <input 
                        type="text"
                        required
                        placeholder="#3B82F6"
                        className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground outline-none focus:ring-1 focus:ring-primary font-mono uppercase"
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        disabled={isPending}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">Plan Status</label>
                    <div className="flex items-center gap-3 h-10 pl-1">
                      <label className="relative flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={formData.isActive}
                          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                          disabled={isPending}
                        />
                        <div className="w-11 h-6 bg-brand-900 border border-brand-800 rounded-full peer peer-focus:ring-1 peer-focus:ring-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-brand-300 after:border-brand-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 peer-checked:after:bg-white peer-checked:after:border-white"></div>
                        <span className="ml-3 text-sm font-medium text-brand-200">This plan is active and public</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Dynamic Features List Builder */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Custom Plan Features & Benefits</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Free stock market premium guides"
                      className="flex-1 h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                      value={newFeatureText}
                      onChange={(e) => setNewFeatureText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddFeature()
                        }
                      }}
                      disabled={isPending}
                    />
                    <Button 
                      type="button" 
                      onClick={handleAddFeature}
                      className="h-10 px-4 bg-brand-900 border border-brand-800 text-xs font-extrabold hover:bg-brand-800 text-brand-200 hover:text-white"
                      disabled={isPending}
                    >
                      <Plus className="w-4 h-4 mr-1.5" /> Add Perk
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1.5 max-h-36 overflow-y-auto pr-1">
                    {featuresList.map((feature, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center gap-1.5 text-[11px] bg-brand-900/60 border border-brand-800 text-brand-100 pl-3 pr-1.5 py-1 rounded-full font-medium"
                      >
                        <span>{feature}</span>
                        <button 
                          type="button"
                          onClick={() => handleRemoveFeature(idx)}
                          className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-brand-850 text-brand-300 hover:text-white transition-colors"
                          disabled={isPending}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {featuresList.length === 0 && (
                      <p className="text-xs text-muted-foreground italic pl-1">No features added yet. Add some custom benefits above!</p>
                    )}
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-2 pt-3 border-t border-brand-850">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setModalOpen(false)} 
                    disabled={isPending}
                    className="hover:bg-brand-900/60 text-brand-300 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isPending}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold px-5 rounded-xl shadow-md transition-all active:scale-95"
                  >
                    {isPending ? 'Saving Plan...' : selectedPlan ? 'Save Changes' : 'Create Plan'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  )
}
