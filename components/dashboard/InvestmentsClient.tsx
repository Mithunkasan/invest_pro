'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, TrendingUp, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dashboard/DataTable'
import { formatCurrency, formatDate, getStatusColor, calculateProgress, getDaysRemaining } from '@/utils/formatters'
import { createInvestmentAction } from '@/actions/investment'
import type { InvestmentPlan } from '@/types'

interface InvestmentsClientProps {
  plans: InvestmentPlan[]
  investments: Array<{
    id: string; amount: number; profit: number; status: string
    startDate: string; endDate: string; plan: { name: string; roiPercent: number; durationDays: number }
  }>
}

export function InvestmentsClient({ plans, investments }: InvestmentsClientProps) {
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleInvest() {
    if (!selectedPlan || !amount) return
    setLoading(true)
    setMsg(null)
    const result = await createInvestmentAction(selectedPlan.id, parseFloat(amount))
    setLoading(false)
    setMsg({ type: result.success ? 'success' : 'error', text: result.message })
    if (result.success) { setSelectedPlan(null); setAmount('') }
  }

  const cols = [
    { key: 'plan', label: 'Plan', render: (_: unknown, row: Record<string, unknown>) => {
      const p = row.plan as { name: string; roiPercent: number }
      return <div><p className="font-medium text-sm">{p.name}</p><p className="text-xs text-muted-foreground">{p.roiPercent}%/day</p></div>
    }},
    { key: 'amount', label: 'Invested', sortable: true, render: (v: unknown) => <span className="font-semibold">{formatCurrency(Number(v))}</span> },
    { key: 'profit', label: 'Profit', render: (v: unknown) => <span className="text-green-500 font-semibold">{formatCurrency(Number(v))}</span> },
    { key: 'status', label: 'Status', render: (v: unknown) => <span className={`status-badge ${getStatusColor(String(v))}`}>{String(v)}</span> },
    { key: 'endDate', label: 'Ends', render: (v: unknown, row: Record<string, unknown>) => {
      const prog = calculateProgress(String(row.startDate), String(v))
      const days = getDaysRemaining(String(v))
      return (
        <div className="space-y-1 min-w-[120px]">
          <div className="h-1.5 bg-muted rounded-full"><div className="h-full bg-primary rounded-full" style={{ width: `${prog}%` }} /></div>
          <p className="text-xs text-muted-foreground">{days > 0 ? `${days} days left` : 'Completed'}</p>
        </div>
      )
    }},
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Investment Plans</h1>

      {msg && (
        <div className={`p-4 rounded-xl border flex items-center gap-2 text-sm ${msg.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          {msg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {msg.text}
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`premium-card p-5 cursor-pointer transition-all duration-200 ${selectedPlan?.id === plan.id ? 'ring-2 ring-primary shadow-blue-glow' : 'hover:shadow-md hover:-translate-y-0.5'}`}
            onClick={() => { setSelectedPlan(plan); setAmount(String(plan.minAmount)) }}
          >
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              {selectedPlan?.id === plan.id && <Check className="w-4 h-4 text-primary" />}
            </div>
            <h3 className="font-bold text-base mb-1">{plan.name}</h3>
            <div className="text-2xl font-black text-primary mb-1">{plan.roiPercent}%<span className="text-sm font-normal text-muted-foreground">/day</span></div>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <div className="flex justify-between"><span>Duration</span><span>{plan.durationDays} days</span></div>
              <div className="flex justify-between"><span>Min</span><span>{formatCurrency(plan.minAmount)}</span></div>
              <div className="flex justify-between"><span>Total ROI</span><span className="text-green-500 font-semibold">{(plan.roiPercent * plan.durationDays).toFixed(0)}%</span></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Invest Modal Area */}
      {selectedPlan && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="premium-card p-6">
          <h2 className="font-semibold mb-4">Invest in {selectedPlan.name}</h2>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground block mb-1.5">
                Investment Amount (Min: {formatCurrency(selectedPlan.minAmount)} — Max: {formatCurrency(selectedPlan.maxAmount)})
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={selectedPlan.minAmount}
                max={selectedPlan.maxAmount}
                className="form-input"
              />
              {amount && (
                <p className="text-xs text-muted-foreground mt-1">
                  Expected return: <span className="text-green-500 font-semibold">
                    {formatCurrency(parseFloat(amount || '0') * (selectedPlan.roiPercent / 100) * selectedPlan.durationDays)}
                  </span> in {selectedPlan.durationDays} days
                </p>
              )}
            </div>
            <Button onClick={handleInvest} loading={loading} className="shrink-0">
              Confirm Investment
            </Button>
          </div>
        </motion.div>
      )}

      {/* My Investments Table */}
      <div className="premium-card p-6">
        <h2 className="font-semibold mb-4">My Investment History</h2>
        <DataTable
          data={investments as Record<string, unknown>[]}
          columns={cols as Parameters<typeof DataTable>[0]['columns']}
          rowKey="id"
          emptyMessage="No investments yet. Choose a plan above to get started!"
        />
      </div>
    </div>
  )
}
