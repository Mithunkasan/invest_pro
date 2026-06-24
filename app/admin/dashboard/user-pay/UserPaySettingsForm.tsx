'use client'

import { useState } from 'react'
import { AlertCircle, Check, Save } from 'lucide-react'
import { updateUserPaySettingsAction } from '@/actions/userPay'
import { Button } from '@/components/ui/button'

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`flex h-10 w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 ${props.className || ''}`}
  />
)

const Label = (props: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label
    {...props}
    className={`text-sm font-semibold text-white/80 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${props.className || ''}`}
  />
)

interface UserPaySettingsFormProps {
  initialSettings: {
    deductionPercent: number
    minimumAmount: number
    maximumAmount: number
  }
}

export function UserPaySettingsForm({ initialSettings }: UserPaySettingsFormProps) {
  const [settings, setSettings] = useState<{
    deductionPercent: number | ''
    minimumAmount: number | ''
    maximumAmount: number | ''
  }>(initialSettings)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setSettings((current) => ({ ...current, [name]: value === '' ? '' : Number(value) }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const result = await updateUserPaySettingsAction({
        deductionPercent: Number(settings.deductionPercent),
        minimumAmount: Number(settings.minimumAmount),
        maximumAmount: Number(settings.maximumAmount),
      })
      setMessage({ type: result.success ? 'success' : 'error', text: result.message })
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="premium-card p-6 space-y-6">
      <div className="border-b pb-3 border-muted/50">
        <h2 className="text-lg font-bold text-white/90">Send Money Settings</h2>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-green-500/10 text-green-500 border border-green-500/20'
            : 'bg-red-500/10 text-red-500 border border-red-500/20'
        }`}>
          {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div className="space-y-2">
          <Label htmlFor="deductionPercent">Send Money Deduction Percentage (%)</Label>
          <div className="relative flex items-center">
            <Input
              id="deductionPercent"
              name="deductionPercent"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={settings.deductionPercent}
              onChange={handleChange}
              disabled={loading}
              className="pr-8 font-medium text-white"
              required
            />
            <span className="absolute right-3 text-sm text-muted-foreground font-bold pointer-events-none">%</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Percentage deducted from Send Money transfers. Set to 0 for no deduction.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="minimumAmount">Minimum Amount (₹)</Label>
          <div className="relative flex items-center">
            <Input
              id="minimumAmount"
              name="minimumAmount"
              type="number"
              step="0.01"
              min="0.01"
              value={settings.minimumAmount}
              onChange={handleChange}
              disabled={loading}
              className="pl-8 font-medium text-white"
              required
            />
            <span className="absolute left-3 text-sm text-muted-foreground font-bold pointer-events-none">₹</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Smallest amount a user can send in one transfer.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="maximumAmount">Maximum Amount (₹)</Label>
          <div className="relative flex items-center">
            <Input
              id="maximumAmount"
              name="maximumAmount"
              type="number"
              step="0.01"
              min="0.01"
              value={settings.maximumAmount}
              onChange={handleChange}
              disabled={loading}
              className="pl-8 font-medium text-white"
              required
            />
            <span className="absolute left-3 text-sm text-muted-foreground font-bold pointer-events-none">₹</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Largest amount a user can send in one transfer.</p>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="min-w-40">
        <Save className="w-4 h-4 mr-2" />
        {loading ? 'Saving...' : 'Save Settings'}
      </Button>
    </form>
  )
}
