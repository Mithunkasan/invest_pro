'use client'

import { useState } from 'react'
import { updateMinimumDepositAmountAction } from '@/actions/deposit'
import { Button } from '@/components/ui/button'

export function DepositMinimumSettings({ initialAmount }: { initialAmount: number }) {
  const [amount, setAmount] = useState(String(initialAmount))
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ success: boolean; text: string } | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    const result = await updateMinimumDepositAmountAction(Number(amount))
    setMessage({ success: result.success, text: result.message })
    setLoading(false)
  }

  return (
    <div className="premium-card p-6">
      <h2 className="font-semibold">Deposit Settings</h2>
      <p className="text-xs text-muted-foreground mt-1">Set the minimum amount users can submit as a deposit.</p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row sm:items-end gap-3 max-w-xl">
        <div className="flex-1">
          <label htmlFor="minimumDepositAmount" className="text-sm font-medium block mb-1.5">Minimum Deposit Amount (₹)</label>
          <input
            id="minimumDepositAmount"
            type="number"
            min="1"
            step="1"
            required
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="form-input"
          />
        </div>
        <Button type="submit" loading={loading}>Save Minimum Amount</Button>
      </form>

      {message && (
        <p className={`text-xs mt-3 ${message.success ? 'text-green-500' : 'text-red-400'}`}>
          {message.text}
        </p>
      )}
    </div>
  )
}
