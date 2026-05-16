'use client'

import { DataTable } from './DataTable'
import { formatCurrency, formatDate, getStatusColor } from '@/utils/formatters'

interface TransactionsTableProps {
  transactions: any[]
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const cols = [
    { key: 'type', label: 'Type', sortable: true, render: (v: unknown) => <span className="text-xs font-medium capitalize">{String(v).replace(/_/g, ' ')}</span> },
    { key: 'description', label: 'Description', render: (v: unknown) => <span className="text-xs text-muted-foreground">{String(v || '—')}</span> },
    { key: 'walletType', label: 'Wallet', render: (v: unknown) => <span className="text-xs capitalize">{String(v).toLowerCase()}</span> },
    { key: 'amount', label: 'Amount', sortable: true, render: (v: unknown, row: any) => (
      <span className={`font-semibold text-sm ${row.type === 'WITHDRAWAL' || row.type === 'INVESTMENT' ? 'text-red-500' : 'text-green-500'}`}>
        {row.type === 'WITHDRAWAL' || row.type === 'INVESTMENT' ? '-' : '+'}{formatCurrency(Number(v))}
      </span>
    )},
    { key: 'status', label: 'Status', render: (v: unknown) => <span className={`status-badge ${getStatusColor(String(v))}`}>{String(v)}</span> },
    { key: 'createdAt', label: 'Date', sortable: true, render: (v: unknown) => <span className="text-xs text-muted-foreground">{formatDate(String(v))}</span> },
  ]

  return (
    <DataTable
      data={transactions}
      columns={cols as any}
      rowKey="id"
      searchPlaceholder="Search transactions..."
      emptyMessage="No transactions found"
    />
  )
}
