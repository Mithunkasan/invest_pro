'use client'

import { useTransition } from 'react'
import { DataTable } from '@/components/dashboard/DataTable'
import { formatDate, formatCurrency, getStatusColor } from '@/utils/formatters'
import { Button } from '@/components/ui/button'
import { 
  handleDeposit, 
  handleWithdrawal, 
  handleKYC, 
  toggleUserStatus 
} from '@/actions/admin'
import { toast } from '@/hooks/use-toast'

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

  const cols = [
    { key: 'name', label: 'Name', sortable: true, render: (v: unknown, row: any) => (
      <div>
        <p className="text-sm font-medium">{String(v)}</p>
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
      <div className="flex gap-1">
        <Button size="sm" variant="outline" className="h-7 px-2 text-xs">View</Button>
        <Button 
          size="sm" 
          variant={row.status === 'ACTIVE' ? 'destructive' : 'default'} 
          className="h-7 px-2 text-xs"
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
      <div className="text-[10px]">
        <p>A: {row.aadhaarNo}</p>
        <p>P: {row.panNo}</p>
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
  const cols = [
    { key: 'user.name', label: 'User', render: (_: any, row: any) => (
      <div>
        <p className="text-sm font-medium">{row.user.name}</p>
        <p className="text-xs text-muted-foreground">{row.user.email}</p>
      </div>
    )},
    { key: 'mainBalance', label: 'Main Balance', sortable: true, render: (v: any) => <span className="font-bold">{formatCurrency(Number(v))}</span> },
    { key: 'bonusBalance', label: 'Bonus', render: (v: any) => <span className="text-blue-500">{formatCurrency(Number(v))}</span> },
    { key: 'referralBalance', label: 'Referral', render: (v: any) => <span className="text-green-500">{formatCurrency(Number(v))}</span> },
    { key: 'updatedAt', label: 'Last Activity', render: (v: any) => <span className="text-xs text-muted-foreground">{formatDate(String(v))}</span> },
  ]
  return <DataTable data={data} columns={cols as any} rowKey="userId" searchPlaceholder="Search user wallets..." />
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
