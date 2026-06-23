'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Upload, Smartphone, Building2, QrCode, AlertCircle, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dashboard/DataTable'
import { submitDepositAction } from '@/actions/deposit'
import { formatCurrency, formatDate, getStatusColor } from '@/utils/formatters'
import type { Deposit } from '@/types'
import type { SystemSettings } from '@prisma/client'

const cols = [
  { key: 'amount', label: 'Amount', render: (v: unknown) => <span className="font-semibold">{formatCurrency(Number(v))}</span> },
  { key: 'method', label: 'Method', render: (v: unknown) => <span className="text-xs capitalize">{String(v).replace(/_/g, ' ')}</span> },
  { key: 'utrNumber', label: 'UTR', render: (v: unknown) => <span className="text-xs font-mono">{String(v || '—')}</span> },
  { key: 'status', label: 'Status', render: (v: unknown) => <span className={`status-badge ${getStatusColor(String(v))}`}>{String(v)}</span> },
  { key: 'createdAt', label: 'Date', render: (v: unknown) => <span className="text-xs text-muted-foreground">{formatDate(String(v))}</span> },
]

export function DepositClient({ deposits, settings }: { deposits: Deposit[], settings: SystemSettings }) {
  const [method, setMethod] = useState('UPI')
  const [amount, setAmount] = useState('')
  const [utr, setUtr] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    const fd = new FormData()
    fd.set('amount', amount)
    fd.set('method', method)
    fd.set('utrNumber', utr)
    const result = await submitDepositAction(fd)
    setLoading(false)
    setMsg({ type: result.success ? 'success' : 'error', text: result.message })
    if (result.success) { setAmount(''); setUtr('') }
  }

  const methods = [
    { id: 'UPI', label: 'UPI Transfer', icon: Smartphone, desc: settings?.upiId || 'Not configured' },
    { id: 'BANK_TRANSFER', label: 'Bank Transfer', icon: Building2, desc: `A/C: ${settings?.accountNumber || 'Not configured'}` },
    { id: 'QR_CODE', label: 'QR Code', icon: QrCode, desc: 'Scan QR to pay' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Deposit Funds</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Method Selection */}
        <div className="space-y-4">
          <div className="premium-card p-6">
            <h2 className="font-semibold mb-4">Select Payment Method</h2>
            <div className="grid grid-cols-3 gap-2">
              {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`p-3 rounded-xl border text-center transition-all ${method === m.id ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'}`}
                >
                  <m.icon className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs font-medium">{m.label}</span>
                </button>
              ))}
            </div>

            {/* Payment Details */}
            <div className="mt-4 p-4 rounded-xl bg-muted/50 space-y-2">
              {method === 'UPI' && (
                <>
                  <p className="text-xs text-muted-foreground font-medium">UPI ID</p>
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-bold">{settings?.upiId || 'Not configured'}</code>
                    {settings?.upiId && (
                      <button onClick={() => copy(settings.upiId!, 'upi')} className="text-primary hover:text-primary/80">
                        {copied === 'upi' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </>
              )}
              {method === 'BANK_TRANSFER' && (
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Bank Name', value: settings?.bankName || 'Not configured' },
                    { label: 'Account Name', value: settings?.accountName || 'Not configured' },
                    { label: 'Account No', value: settings?.accountNumber || 'Not configured' },
                    { label: 'IFSC', value: settings?.ifscCode || 'Not configured' },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center">
                      <span className="text-muted-foreground text-xs">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <code className="font-medium">{item.value}</code>
                        {item.value !== 'Not configured' && (
                          <button onClick={() => copy(item.value, item.label)} className="text-primary">
                            {copied === item.label ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {method === 'QR_CODE' && (
                <div className="text-center py-4">
                  {settings?.qrCodeUrl ? (
                    <div className="w-48 h-48 bg-white rounded-xl mx-auto flex items-center justify-center p-2 border border-border">
                      <img src={settings.qrCodeUrl} alt="QR Code" className="max-w-full max-h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-white rounded-xl mx-auto flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-muted-foreground opacity-50" />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {settings?.qrCodeUrl ? 'Scan to pay' : 'QR code not configured'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-300">
              After making the payment, enter the UTR/Transaction number below. Admin will verify and credit your wallet within 24 hours.
            </p>
          </div>
        </div>

        {/* Deposit Form */}
        <div className="premium-card p-6">
          <h2 className="font-semibold mb-4">Submit Deposit</h2>
          {msg && (
            <div className={`mb-4 p-3 rounded-xl text-sm ${msg.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-500' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
              {msg.text}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Deposit Amount (Min ₹1,000)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min="1000" placeholder="10000" className="form-input" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">UTR / Transaction Number</label>
              <input type="text" value={utr} onChange={(e) => setUtr(e.target.value)} required minLength={10} placeholder="UTR123456789" className="form-input" />
            </div>
            <Button type="submit" className="w-full" loading={loading}>
              Submit Deposit Request
            </Button>
          </form>
        </div>
      </div>

      {/* Deposit History */}
      <div className="premium-card p-6">
        <h2 className="font-semibold mb-4">Deposit History</h2>
        <DataTable data={deposits as unknown as Record<string, unknown>[]} columns={cols as Parameters<typeof DataTable>[0]['columns']} rowKey="id" emptyMessage="No deposits yet" />
      </div>
    </div>
  )
}

