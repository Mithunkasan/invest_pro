'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dashboard/DataTable'
import { requestWithdrawalAction } from '@/actions/withdrawal'
import { formatCurrency, formatDate, getStatusColor } from '@/utils/formatters'
import type { Wallet, Withdrawal } from '@/types'

const cols = [
  { key: 'amount', label: 'Amount', render: (v: unknown) => <span className="font-semibold text-red-500">-{formatCurrency(Number(v))}</span> },
  { key: 'walletType', label: 'Wallet' },
  { key: 'status', label: 'Status', render: (v: unknown) => <span className={`status-badge ${getStatusColor(String(v))}`}>{String(v)}</span> },
  { key: 'createdAt', label: 'Requested', render: (v: unknown) => <span className="text-xs text-muted-foreground">{formatDate(String(v))}</span> },
  { key: 'processedAt', label: 'Processed', render: (v: unknown) => <span className="text-xs text-muted-foreground">{v ? formatDate(String(v)) : '—'}</span> },
]

export function WithdrawClient({ wallet, withdrawals }: { wallet: Wallet | null; withdrawals: Withdrawal[] }) {
  const [amount, setAmount] = useState('')
  const [walletType, setWalletType] = useState('MAIN')
  const [bankName, setBankName] = useState('')
  const [accountNo, setAccountNo] = useState('')
  const [ifsc, setIfsc] = useState('')
  const [accountName, setAccountName] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData()
    fd.set('amount', amount)
    fd.set('walletType', walletType)
    fd.set('bankName', bankName)
    fd.set('accountNo', accountNo)
    fd.set('ifsc', ifsc)
    fd.set('accountName', accountName)
    const result = await requestWithdrawalAction(fd)
    setLoading(false)
    setMsg({ type: result.success ? 'success' : 'error', text: result.message })
    if (result.success) { setAmount('') }
  }

  const balanceMap: Record<string, number> = {
    MAIN: wallet?.mainBalance || 0,
    BONUS: wallet?.bonusBalance || 0,
    REFERRAL: wallet?.referralBalance || 0,
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Withdraw Funds</h1>

      {/* Balances */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(balanceMap).map(([type, val]) => (
          <div key={type} className={`premium-card p-4 cursor-pointer transition-all ${walletType === type ? 'ring-2 ring-primary' : ''}`} onClick={() => setWalletType(type)}>
            <p className="text-xs text-muted-foreground">{type} Wallet</p>
            <p className="text-xl font-bold mt-1">{formatCurrency(val)}</p>
          </div>
        ))}
      </div>

      <div className="premium-card p-6">
        <h2 className="font-semibold mb-4">Request Withdrawal</h2>
        {msg && (
          <div className={`mb-4 p-3 rounded-xl text-sm ${msg.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-500' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
            {msg.text}
          </div>
        )}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium block mb-1.5">Amount (Available: {formatCurrency(balanceMap[walletType])})</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min="100" max={balanceMap[walletType]} className="form-input" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Bank Name</label>
            <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} required placeholder="HDFC Bank" className="form-input" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Account Number</label>
            <input type="text" value={accountNo} onChange={(e) => setAccountNo(e.target.value)} required placeholder="1234567890" className="form-input" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">IFSC Code</label>
            <input type="text" value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase())} required placeholder="HDFC0001234" className="form-input" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Account Holder Name</label>
            <input type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)} required placeholder="Arjun Kumar" className="form-input" />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" className="w-full sm:w-auto" loading={loading}>Submit Withdrawal Request</Button>
          </div>
        </form>
      </div>

      <div className="premium-card p-6">
        <h2 className="font-semibold mb-4">Withdrawal History</h2>
        <DataTable data={withdrawals as unknown as Record<string, unknown>[]} columns={cols as Parameters<typeof DataTable>[0]['columns']} rowKey="id" emptyMessage="No withdrawals yet" />
      </div>
    </div>
  )
}
