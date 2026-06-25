'use client'

import { useMemo, useState } from 'react'
import { DataTable } from '@/components/dashboard/DataTable'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDateTime, getStatusColor } from '@/utils/formatters'
import { Search } from 'lucide-react'

interface RequestsTableProps {
  initialRequests: any[]
}

export function UserPayRequestsTable({ initialRequests }: RequestsTableProps) {
  const [requests] = useState(initialRequests)
  const [filterQuery, setFilterQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')

  const filteredRequests = useMemo(() => {
    const q = filterQuery.toLowerCase().trim()
    return requests.filter((row: any) => {
      if (filterStatus !== 'ALL' && row.status !== filterStatus) return false
      if (!q) return true

      return [
        row.sender?.name,
        row.sender?.email,
        row.senderId,
        row.receiver?.name,
        row.receiver?.email,
        row.receiverId,
        row.amount,
        row.finalAmount,
        row.status,
      ].some((value) => String(value || '').toLowerCase().includes(q))
    })
  }, [requests, filterQuery, filterStatus])

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
      label: 'Request Submitted Time',
      sortable: true,
      render: (v: any) => <span className="text-xs text-muted-foreground">{formatDateTime(String(v))}</span>,
    },
    {
      key: 'updatedAt',
      label: 'Admin Action Time',
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

  const hasActiveFilters = filterQuery || filterStatus !== 'ALL'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 backdrop-blur-sm">
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
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 h-10 px-3 rounded-lg bg-background/50 border border-border/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
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
