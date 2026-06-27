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
    mainToDepositPercent: number
    depositToDepositPercent: number
    depositToMainPercent: number
    minimumAmount: number
    maximumAmount: number
    mainToDepositEnabled: boolean
    depositToDepositEnabled: boolean
    depositToMainEnabled: boolean
  }
}

type SettingsState = {
  mainToDepositPercent: number | ''
  depositToDepositPercent: number | ''
  depositToMainPercent: number | ''
  minimumAmount: number | ''
  maximumAmount: number | ''
  mainToDepositEnabled: boolean
  depositToDepositEnabled: boolean
  depositToMainEnabled: boolean
}

const transferRoutes: Array<{
  label: string
  enabledName: 'mainToDepositEnabled' | 'depositToDepositEnabled' | 'depositToMainEnabled'
  percentName: 'mainToDepositPercent' | 'depositToDepositPercent' | 'depositToMainPercent'
}> = [
  {
    label: 'Main Wallet -> Deposit Wallet',
    enabledName: 'mainToDepositEnabled',
    percentName: 'mainToDepositPercent',
  },
  {
    label: 'Deposit Wallet -> Deposit Wallet',
    enabledName: 'depositToDepositEnabled',
    percentName: 'depositToDepositPercent',
  },
  {
    label: 'Deposit Wallet -> Main Wallet',
    enabledName: 'depositToMainEnabled',
    percentName: 'depositToMainPercent',
  },
]

export function UserPaySettingsForm({ initialSettings }: UserPaySettingsFormProps) {
  const [settings, setSettings] = useState<SettingsState>(initialSettings)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = event.target
    setSettings((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value === '' ? '' : Number(value),
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const result = await updateUserPaySettingsAction({
        mainToDepositPercent: Number(settings.mainToDepositPercent),
        depositToDepositPercent: Number(settings.depositToDepositPercent),
        depositToMainPercent: Number(settings.depositToMainPercent),
        minimumAmount: Number(settings.minimumAmount),
        maximumAmount: Number(settings.maximumAmount),
        mainToDepositEnabled: settings.mainToDepositEnabled,
        depositToDepositEnabled: settings.depositToDepositEnabled,
        depositToMainEnabled: settings.depositToMainEnabled,
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
        {transferRoutes.map((route) => (
          <div key={route.percentName} className="rounded-xl border border-border/60 bg-background/30 p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor={route.enabledName}>{route.label}</Label>
              <label className="flex h-10 items-center gap-3 rounded-md border border-border bg-background/50 px-3 py-2 text-sm">
                <input
                  id={route.enabledName}
                  name={route.enabledName}
                  type="checkbox"
                  checked={settings[route.enabledName]}
                  onChange={handleChange}
                  disabled={loading}
                  className="h-4 w-4 rounded border-border"
                />
                <span className="font-medium text-white">
                  {settings[route.enabledName] ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>

            <div className="space-y-2">
              <Label htmlFor={route.percentName}>Transfer Charge (%)</Label>
              <div className="relative flex items-center">
                <Input
                  id={route.percentName}
                  name={route.percentName}
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={settings[route.percentName]}
                  onChange={handleChange}
                  disabled={loading}
                  className="pr-8 font-medium text-white"
                  required
                />
                <span className="absolute right-3 text-sm text-muted-foreground font-bold pointer-events-none">%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="space-y-2">
          <Label htmlFor="minimumAmount">Minimum Amount (INR)</Label>
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
              className="pl-10 font-medium text-white"
              required
            />
            <span className="absolute left-3 text-sm text-muted-foreground font-bold pointer-events-none">Rs</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Smallest amount a user can send in one transfer.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="maximumAmount">Maximum Amount (INR)</Label>
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
              className="pl-10 font-medium text-white"
              required
            />
            <span className="absolute left-3 text-sm text-muted-foreground font-bold pointer-events-none">Rs</span>
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
