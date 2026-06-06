'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dashboard/DataTable'
import { requestWithdrawalAction } from '@/actions/withdrawal'
import { formatCurrency, formatDate, getStatusColor } from '@/utils/formatters'
import type { Wallet, Withdrawal } from '@/types'

const cols = [
  { key: 'amount', label: 'Amount', render: (v: unknown, row: any) => (
    <div>
      <span className="font-semibold text-red-500">-{formatCurrency(Number(v))}</span>
      {row.deduction > 0 && (
        <p className="text-[10px] text-muted-foreground mt-0.5 whitespace-nowrap">
          Net: <span className="text-green-500 font-bold">{formatCurrency(row.netAmount)}</span> (after deduction)
        </p>
      )}
    </div>
  ) },
  { key: 'walletType', label: 'Wallet' },
  { key: 'status', label: 'Status', render: (v: unknown) => <span className={`status-badge ${getStatusColor(String(v))}`}>{String(v)}</span> },
  { key: 'createdAt', label: 'Requested', render: (v: unknown) => <span className="text-xs text-muted-foreground">{formatDate(String(v))}</span> },
  { key: 'processedAt', label: 'Processed', render: (v: unknown) => <span className="text-xs text-muted-foreground">{v ? formatDate(String(v)) : '—'}</span> },
]

export function WithdrawClient({ 
  wallet, 
  withdrawals, 
  deductionPercent = 20 
}: { 
  wallet: Wallet | null; 
  withdrawals: Withdrawal[]; 
  deductionPercent?: number 
}) {
  const walletType = 'MAIN'
  const [bankName, setBankName] = useState('')
  const [accountNo, setAccountNo] = useState('')
  const [ifsc, setIfsc] = useState('')
  const [accountName, setAccountName] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const availableBalance = wallet?.mainBalance || 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData()
    fd.set('amount', String(availableBalance))
    fd.set('walletType', walletType)
    fd.set('bankName', bankName)
    fd.set('accountNo', accountNo)
    fd.set('ifsc', ifsc)
    fd.set('accountName', accountName)
    const result = await requestWithdrawalAction(fd)
    setLoading(false)
    setMsg({ type: result.success ? 'success' : 'error', text: result.message })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Withdraw Funds</h1>

      {/* Balances - Display only Main Wallet */}
      <div className="grid grid-cols-1 max-w-sm gap-4">
        <div className="premium-card p-5 border border-primary/20 bg-primary/5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Main Wallet Balance</p>
          <p className="text-3xl font-black mt-1.5 text-white tracking-tight">{formatCurrency(availableBalance)}</p>
        </div>
      </div>

      <div className="premium-card p-6">
        <h2 className="font-semibold mb-4 text-white/90">Request Withdrawal</h2>
        {msg && (
          <div className={`mb-4 p-3 rounded-xl text-sm ${msg.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-500' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
            {msg.text}
          </div>
        )}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-white/80 block mb-1.5">Withdrawal Amount (Entire Main Wallet Balance)</label>
            <div className="relative flex items-center">
              <input 
                type="number" 
                value={availableBalance} 
                readOnly
                required 
                className="form-input w-full bg-background/50 border border-border rounded-lg text-white/70 font-semibold cursor-not-allowed opacity-80" 
              />
            </div>
            {availableBalance >= 100 ? (
              <div className="text-xs space-y-1 mt-3 p-3 rounded-xl bg-background/40 border border-border/50 max-w-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Withdrawal Amount:</span>
                  <span className="font-medium text-white">{formatCurrency(availableBalance)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground border-b border-border/20 pb-1.5">
                  <span>Admin Deduction ({deductionPercent}%):</span>
                  <span className="font-medium text-red-400">-{formatCurrency((availableBalance * deductionPercent) / 100)}</span>
                </div>
                <div className="flex justify-between text-white font-bold pt-1.5">
                  <span>Net to Receive:</span>
                  <span className="text-green-400">{formatCurrency((availableBalance * (100 - deductionPercent)) / 100)}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-red-400 mt-2 font-medium">
                Minimum withdrawal amount is ₹100. Your current balance is insufficient.
              </p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Bank Name</label>
            <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} required placeholder="HDFC Bank" className="form-input bg-background/50 border border-border rounded-lg" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Account Number</label>
            <input type="text" value={accountNo} onChange={(e) => setAccountNo(e.target.value)} required placeholder="1234567890" className="form-input bg-background/50 border border-border rounded-lg" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">IFSC Code</label>
            <input type="text" value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase())} required placeholder="HDFC0001234" className="form-input bg-background/50 border border-border rounded-lg" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Account Holder Name</label>
            <input type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)} required placeholder="Arjun Kumar" className="form-input bg-background/50 border border-border rounded-lg" />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" className="w-full sm:w-auto" loading={loading} disabled={availableBalance < 100}>Submit Withdrawal Request</Button>
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
