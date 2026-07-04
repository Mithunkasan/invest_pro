'use client'

import { useState } from 'react'
import { DataTable } from './DataTable'
import { formatCurrency, formatDate, getStatusColor } from '@/utils/formatters'

interface TransactionsTableProps {
  transactions: any[]
}

const WALLET_FILTERS = [
  { label: 'All Wallets', value: 'ALL' },
  { label: 'Main', value: 'MAIN' },
  { label: 'Reward', value: 'REWARD' },
  { label: 'Task', value: 'TASK' },
  { label: 'Referral', value: 'REFERRAL' },
  { label: 'Level', value: 'LEVEL' },
  { label: 'Share', value: 'SHARE' },
  { label: 'Bonus', value: 'BONUS' },
]

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [selectedWallet, setSelectedWallet] = useState('ALL')

  const filteredTransactions = transactions.filter((txn) => {
    if (selectedWallet === 'ALL') return true
    if (selectedWallet === 'TASK') return String(txn.reference || '').startsWith('TIMEWALL:')
    return txn.walletType === selectedWallet
  })

  const cols = [
    { key: 'type', label: 'Type', sortable: true, render: (v: unknown) => {
      let label = String(v).replace(/_/g, ' ')
      if (v === 'INVESTMENT') label = 'SMART HYBRID DIGITAL EARNING'
      if (v === 'USER_PAY_SENT') label = 'MONEY SENT'
      if (v === 'USER_PAY_RECEIVED') label = 'MONEY RECEIVED'
      return <span className="text-xs font-medium capitalize">{label.toLowerCase()}</span>
    } },
    { key: 'description', label: 'Description', render: (v: unknown) => <span className="text-xs text-muted-foreground">{String(v || '—').replace(/\bROI\b/gi, 'Earning Platform').replace(/\bInvestment\b/gi, 'Earning Platform')}</span> },
    { key: 'walletType', label: 'Wallet', render: (v: unknown) => <span className="text-xs capitalize">{String(v || '—').toLowerCase()}</span> },
    { key: 'amount', label: 'Amount', sortable: true, render: (v: unknown, row: any) => (
      <span className={`font-semibold text-sm ${row.type === 'WITHDRAWAL' || row.type === 'INVESTMENT' || row.type === 'USER_PAY_SENT' ? 'text-red-500' : 'text-green-500'}`}>
        {row.type === 'WITHDRAWAL' || row.type === 'INVESTMENT' || row.type === 'USER_PAY_SENT' ? '-' : '+'}{formatCurrency(Number(v))}
      </span>
    )},
    { key: 'status', label: 'Status', render: (v: unknown) => <span className={`status-badge ${getStatusColor(String(v))}`}>{String(v)}</span> },
    { key: 'createdAt', label: 'Date', sortable: true, render: (v: unknown) => <span className="text-xs text-muted-foreground">{formatDate(String(v))}</span> },
  ]

  return (
    <div className="space-y-4">
      {/* Wallet Filter Tabs */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-border">
        {WALLET_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setSelectedWallet(f.value)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
              selectedWallet === f.value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <DataTable
        data={filteredTransactions}
        columns={cols as any}
        rowKey="id"
        searchPlaceholder="Search transactions..."
        emptyMessage="No transactions found for this wallet"
      />
    </div>
  )
}
