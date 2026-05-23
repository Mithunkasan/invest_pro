'use client'

import { useTransition, useState } from 'react'
import { motion } from 'framer-motion'
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
import { Plus, Edit2, Trash2, X, PlusCircle } from 'lucide-react'

interface TableProps {
  data: any[]
}

export function UsersTable({ users }: { users: any[] }) {
  const [isPending, startTransition] = useTransition()

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
    { key: '_count', label: 'Investments', render: (v: unknown) => {
      const c = v as { investments: number }
      return <span className="text-sm">{c.investments}</span>
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

  return <DataTable data={users} columns={cols as any} rowKey="id" searchPlaceholder="Search users..." emptyMessage="No users found" />
}

export function DepositsTable({ data }: TableProps) {
  const [isPending, startTransition] = useTransition()

  const onHandle = (id: string, action: 'APPROVE' | 'REJECT') => {
    startTransition(async () => {
      const res = await handleDeposit(id, action)
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
    { key: 'amount', label: 'Amount', sortable: true, render: (v: any) => <span className="font-semibold">{formatCurrency(Number(v))}</span> },
    { key: 'method', label: 'Method', render: (v: any) => <span className="text-xs uppercase font-bold">{String(v)}</span> },
    { key: 'utrNumber', label: 'UTR', render: (v: any) => <span className="text-xs font-mono">{String(v)}</span> },
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
        >Approve</Button>
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
  return <DataTable data={data} columns={cols as any} rowKey="id" searchPlaceholder="Search deposits..." />
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
    { key: 'amount', label: 'Amount', sortable: true, render: (v: any) => <span className="font-semibold">{formatCurrency(Number(v))}</span> },
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

export function PlansTable({ data }: TableProps) {
  const cols = [
    { key: 'name', label: 'Plan Name', sortable: true, render: (v: any, row: any) => (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: row.color }} />
        <span className="font-bold">{String(v)}</span>
      </div>
    )},
    { key: 'roiPercent', label: 'Daily ROI', render: (v: any) => <span className="font-black text-primary">{String(v)}%</span> },
    { key: 'durationDays', label: 'Duration', render: (v: any) => <span>{String(v)} Days</span> },
    { key: 'minAmount', label: 'Limits', render: (_: any, row: any) => (
      <span className="text-xs">{formatCurrency(row.minAmount)} - {formatCurrency(row.maxAmount)}</span>
    )},
    { key: 'status', label: 'Status', render: (v: any) => <span className={`status-badge ${getStatusColor(String(v))}`}>{String(v)}</span> },
    { key: 'id', label: 'Actions', render: () => (
      <Button size="sm" variant="outline" className="h-7 px-2 text-xs">Edit</Button>
    )},
  ]
  return <DataTable data={data} columns={cols as any} rowKey="id" searchable={false} />
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
            <a href={row.aadhaarUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold text-[9px]">📄 View Aadhaar</a>
          ) : (
            <span className="text-muted-foreground text-[9px]">No Aadhaar Image</span>
          )}
          <span className="text-muted-foreground/30">•</span>
          {row.panUrl ? (
            <a href={row.panUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold text-[9px]">📄 View PAN</a>
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

  const cols = [
    { key: 'user.name', label: 'User', render: (_: any, row: any) => (
      <div>
        <p className="text-sm font-medium">{row.user.name}</p>
        <p className="text-xs text-muted-foreground">{row.user.email}</p>
      </div>
    )},
    { key: 'mainBalance', label: 'Main', render: (v: any) => <span className="font-bold text-xs">{formatCurrency(Number(v))}</span> },
    { key: 'rewardBalance', label: 'Reward', render: (v: any) => <span className="text-amber-500 font-bold text-xs">{formatCurrency(Number(v))}</span> },
    { key: 'referralBalance', label: 'Referral', render: (v: any) => <span className="text-purple-500 font-bold text-xs">{formatCurrency(Number(v))}</span> },
    { key: 'levelBalance', label: 'Level', render: (v: any) => <span className="text-emerald-500 font-bold text-xs">{formatCurrency(Number(v))}</span> },
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="premium-card p-6 w-full max-w-md bg-card/95 border border-border shadow-2xl relative space-y-4"
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
          </motion.div>
        </div>
      )}
    </>
  )
}

export function AdminNotificationsTable({ data }: TableProps) {
  const cols = [
    { key: 'user.name', label: 'User', render: (_: any, row: any) => (
      <div>
        <p className="text-sm font-medium">{row.user.name}</p>
        <p className="text-[10px] text-muted-foreground">{row.user.email}</p>
      </div>
    )},
    { key: 'title', label: 'Title', render: (v: any) => <span className="font-bold">{String(v)}</span> },
    { key: 'message', label: 'Message', render: (v: any) => <p className="text-xs max-w-xs truncate">{String(v)}</p> },
    { key: 'type', label: 'Type', render: (v: any) => <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${v === 'SUCCESS' ? 'bg-green-500/10 text-green-500' : v === 'ERROR' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>{String(v)}</span> },
    { key: 'createdAt', label: 'Sent', render: (v: any) => <span className="text-xs text-muted-foreground">{formatDate(String(v))}</span> },
  ]
  return <DataTable data={data} columns={cols as any} rowKey="id" searchPlaceholder="Search notifications..." />
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
    { key: 'referralLevel1', label: 'Referral Rates', render: (_: any, row: any) => (
      <div className="space-y-0.5 text-[10px] leading-tight">
        <p className="text-purple-400 font-bold">L1: {row.referralLevel1}%</p>
        <p className="text-purple-300">L2: {row.referralLevel2}%</p>
        <p className="text-purple-300">L3: {row.referralLevel3}%</p>
      </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="premium-card p-6 w-full max-w-2xl bg-brand-950 border border-brand-800 shadow-2xl relative space-y-4 my-8"
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
                    step="0.1"
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

              {/* Referral Configs */}
              <div className="p-3.5 bg-brand-900/20 border border-brand-850 rounded-xl space-y-3">
                <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">Multi-Level Referral Commissions</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-brand-300">Level 1 (%)</label>
                    <input 
                      type="number"
                      step="0.1"
                      min="0"
                      required
                      className="w-full h-9 px-2 rounded-lg bg-background border border-border text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                      value={formData.referralLevel1}
                      onChange={(e) => setFormData(prev => ({ ...prev, referralLevel1: e.target.value }))}
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-brand-300">Level 2 (%)</label>
                    <input 
                      type="number"
                      step="0.1"
                      min="0"
                      required
                      className="w-full h-9 px-2 rounded-lg bg-background border border-border text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                      value={formData.referralLevel2}
                      onChange={(e) => setFormData(prev => ({ ...prev, referralLevel2: e.target.value }))}
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-brand-300">Level 3 (%)</label>
                    <input 
                      type="number"
                      step="0.1"
                      min="0"
                      required
                      className="w-full h-9 px-2 rounded-lg bg-background border border-border text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                      value={formData.referralLevel3}
                      onChange={(e) => setFormData(prev => ({ ...prev, referralLevel3: e.target.value }))}
                      disabled={isPending}
                    />
                  </div>
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
          </motion.div>
        </div>
      )}
    </>
  )
}
