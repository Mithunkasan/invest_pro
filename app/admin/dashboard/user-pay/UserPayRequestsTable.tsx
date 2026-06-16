'use client'

import { useState, useTransition } from 'react'
import { DataTable } from '@/components/dashboard/DataTable'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { formatCurrency, formatDate, getStatusColor } from '@/utils/formatters'
import { handleUserPayRequestAction } from '@/actions/userPay'

interface RequestsTableProps {
  initialRequests: any[]
}

export function UserPayRequestsTable({ initialRequests }: RequestsTableProps) {
  const [requests, setRequests] = useState(initialRequests)
  const [isPending, startTransition] = useTransition()

  const onHandle = (id: string, action: 'APPROVED' | 'REJECTED') => {
    if (!confirm(`Are you sure you want to ${action.toLowerCase()} this User Pay request?`)) {
      return
    }

    startTransition(async () => {
      const res = await handleUserPayRequestAction(id, action)
      if (res.success) {
        toast({ title: 'Success', description: res.message })
        // Update local state status
        setRequests((prev) =>
          prev.map((req) => (req.id === id ? { ...req, status: action } : req))
        )
      } else {
        toast({ title: 'Error', description: res.message, variant: 'destructive' })
      }
    })
  }

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
      label: 'Request Date',
      sortable: true,
      render: (v: any) => <span className="text-xs text-muted-foreground">{formatDate(String(v))}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (v: any) => <span className={`status-badge ${getStatusColor(String(v))}`}>{String(v)}</span>,
    },
    {
      key: 'id',
      label: 'Actions',
      render: (id: string, row: any) =>
        row.status === 'PENDING' && (
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="default"
              className="h-7 px-3 text-xs bg-green-600 hover:bg-green-700"
              onClick={() => onHandle(id, 'APPROVED')}
              disabled={isPending}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="h-7 px-3 text-xs"
              onClick={() => onHandle(id, 'REJECTED')}
              disabled={isPending}
            >
              Reject
            </Button>
          </div>
        ),
    },
  ]

  return (
    <DataTable
      data={requests}
      columns={cols as any}
      rowKey="id"
      searchPlaceholder="Search requests by sender/receiver..."
    />
  )
}
