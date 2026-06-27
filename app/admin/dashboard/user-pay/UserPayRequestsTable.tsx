'use client'

import { useMemo, useState } from 'react'
import { DataTable } from '@/components/dashboard/DataTable'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDateTime, getStatusColor } from '@/utils/formatters'
import { Search } from 'lucide-react'

interface RequestsTableProps {
  initialRequests: any[]
}

function walletLabel(walletType?: string) {
  if (walletType === 'DEPOSIT') return 'Deposit Wallet'
  if (walletType === 'MAIN') return 'Main Wallet'
  if (walletType === 'BONUS') return 'Bonus Wallet'
  if (walletType === 'REFERRAL') return 'Referral Wallet'
  if (walletType === 'LEVEL') return 'Level Wallet'
  if (walletType === 'REWARD') return 'Reward Wallet'
  if (walletType === 'SHARE') return 'Share Wallet'
  return 'Wallet'
}

function routeKey(row: any) {
  if (row.sourceWallet === 'MAIN' && row.destinationWallet === 'DEPOSIT') return 'MAIN_TO_DEPOSIT'
  if (row.sourceWallet === 'DEPOSIT' && row.destinationWallet === 'DEPOSIT') return 'DEPOSIT_TO_DEPOSIT'
  if (row.sourceWallet === 'DEPOSIT' && row.destinationWallet === 'MAIN') return 'DEPOSIT_TO_MAIN'
  return 'OTHER'
}

function routeLabel(key: string) {
  if (key === 'MAIN_TO_DEPOSIT') return 'Main Wallet -> Deposit Wallet'
  if (key === 'DEPOSIT_TO_DEPOSIT') return 'Deposit Wallet -> Deposit Wallet'
  if (key === 'DEPOSIT_TO_MAIN') return 'Deposit Wallet -> Main Wallet'
  return 'Other Wallet Transfer'
}

export function UserPayRequestsTable({ initialRequests }: RequestsTableProps) {
  const [requests] = useState(initialRequests)
  const [filterQuery, setFilterQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterTransferType, setFilterTransferType] = useState('ALL')

  const filteredRequests = useMemo(() => {
    const q = filterQuery.toLowerCase().trim()
    return requests.filter((row: any) => {
      const transferType = routeKey(row)
      if (filterStatus !== 'ALL' && row.status !== filterStatus) return false
      if (filterTransferType !== 'ALL' && transferType !== filterTransferType) return false
      if (!q) return true

      return [
        row.sender?.name,
        row.sender?.email,
        row.senderId,
        row.receiver?.name,
        row.receiver?.email,
        row.receiverId,
        row.sourceWallet,
        row.destinationWallet,
        routeLabel(transferType),
        row.amount,
        row.finalAmount,
        row.status,
      ].some((value) => String(value || '').toLowerCase().includes(q))
    })
  }, [requests, filterQuery, filterStatus, filterTransferType])

  const cols = [
    {
      key: 'sender',
      label: 'Sender',
      render: (_: any, row: any) => (
        <div>
          <p className="text-sm font-medium">{row.sender.name}</p>
          <p className="text-xs text-muted-foreground">{row.sender.email}</p>
          <p className="text-[10px] text-muted-foreground font-mono">ID: {row.senderId}</p>
        </div>
      ),
    },
    {
      key: 'receiver',
      label: 'Receiver',
      render: (_: any, row: any) => (
        <div>
          <p className="text-sm font-medium">{row.receiver.name}</p>
          <p className="text-xs text-muted-foreground">{row.receiver.email}</p>
          <p className="text-[10px] text-muted-foreground font-mono">ID: {row.receiverId}</p>
        </div>
      ),
    },
    {
      key: 'sourceWallet',
      label: 'Wallet Route',
      render: (_: any, row: any) => (
        <div>
          <p className="text-sm font-semibold">{routeLabel(routeKey(row))}</p>
          <p className="text-xs text-muted-foreground">
            {walletLabel(row.sourceWallet)} to {walletLabel(row.destinationWallet)}
          </p>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount Details',
      sortable: true,
      render: (_: any, row: any) => (
        <div>
          <p className="font-semibold text-sm">Amount: {formatCurrency(row.amount)}</p>
          <p className="text-xs text-red-400 mt-0.5">
            Deduction: {formatCurrency(row.deductionAmount)} ({row.deductionPercent}%)
          </p>
          <p className="text-xs text-green-400 font-bold mt-0.5">
            Final: {formatCurrency(row.finalAmount)}
          </p>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Transfer Date & Time',
      sortable: true,
      render: (v: any) => <span className="text-xs text-muted-foreground">{formatDateTime(String(v))}</span>,
    },
    {
      key: 'updatedAt',
      label: 'Status Updated Time',
      sortable: true,
      render: (_: any, row: any) => (
        <span className="text-xs text-muted-foreground">
          {row.status === 'PENDING' ? 'Pending' : formatDateTime(String(row.updatedAt))}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (v: any) => <span className={`status-badge ${getStatusColor(String(v))}`}>{String(v)}</span>,
    },
  ]

  const hasActiveFilters = filterQuery || filterStatus !== 'ALL' || filterTransferType !== 'ALL'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 backdrop-blur-sm">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by sender, receiver, user ID, or amount..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-3 rounded-lg bg-background/50 border border-border/60 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
        <select
          value={filterTransferType}
          onChange={(e) => setFilterTransferType(e.target.value)}
          className="h-10 px-3 rounded-lg bg-background/50 border border-border/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
        >
          <option value="ALL">All Transfer Types</option>
          <option value="MAIN_TO_DEPOSIT">Main Wallet {'->'} Deposit Wallet</option>
          <option value="DEPOSIT_TO_DEPOSIT">Deposit Wallet {'->'} Deposit Wallet</option>
          <option value="DEPOSIT_TO_MAIN">Deposit Wallet {'->'} Main Wallet</option>
        </select>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="min-w-0 flex-1 h-10 px-3 rounded-lg bg-background/50 border border-border/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={() => {
                setFilterQuery('')
                setFilterStatus('ALL')
                setFilterTransferType('ALL')
              }}
              className="h-10 px-3 font-semibold shrink-0"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      <DataTable
        data={filteredRequests}
        columns={cols as any}
        rowKey="id"
        searchable={false}
        emptyMessage="No send money records found matching current filters"
      />
    </div>
  )
}
