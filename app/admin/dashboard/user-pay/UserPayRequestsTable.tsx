'use client'

import { useState } from 'react'
import { DataTable } from '@/components/dashboard/DataTable'
import { formatCurrency, formatDate, getStatusColor } from '@/utils/formatters'

interface RequestsTableProps {
  initialRequests: any[]
}

export function UserPayRequestsTable({ initialRequests }: RequestsTableProps) {
  const [requests] = useState(initialRequests)

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
      label: 'Date',
      sortable: true,
      render: (v: any) => <span className="text-xs text-muted-foreground">{formatDate(String(v))}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (v: any) => <span className={`status-badge ${getStatusColor(String(v))}`}>{String(v)}</span>,
    },
  ]

  return (
    <DataTable
      data={requests}
      columns={cols as any}
      rowKey="id"
      searchPlaceholder="Search history by sender/receiver..."
    />
  )
}
