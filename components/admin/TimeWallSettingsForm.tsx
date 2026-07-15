'use client'

import { useState } from 'react'
import { AlertCircle, Check, Save } from 'lucide-react'
import { updateTimeWallSettingsAction } from '@/actions/timewall'
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

interface TimeWallSettingsFormProps {
  initialSettings: {
    username: string
    password: string
    offerwallUrl: string
    postbackSecret: string
    timeWallPercentFree: number
    plans: {
      id: string
      name: string
      timeWallPercent: number
    }[]
  }
}

export function TimeWallSettingsForm({ initialSettings }: TimeWallSettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = event.target
    setSettings((current) => ({
      ...current,
      [name]: type === 'number' ? Number(value) : value,
    }))
  }

  const handlePlanPercentChange = (planId: string, value: string) => {
    setSettings((current) => ({
      ...current,
      plans: current.plans.map((p) =>
        p.id === planId ? { ...p, timeWallPercent: Number(value) } : p
      ),
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const result = await updateTimeWallSettingsAction({
        username: settings.username,
        password: settings.password,
        offerwallUrl: settings.offerwallUrl,
        postbackSecret: settings.postbackSecret,
        timeWallPercentFree: settings.timeWallPercentFree,
        planPercentages: settings.plans.map(p => ({
          id: p.id,
          timeWallPercent: p.timeWallPercent
        }))
      })
      setMessage({ type: result.success ? 'success' : 'error', text: result.message })
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="premium-card p-6 space-y-6 max-w-4xl">
      <div className="border-b pb-3 border-muted/50">
        <h2 className="text-lg font-bold text-white/90">TimeWall Integration</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Configure the TimeWall redirect and conversion percentages applied before Task Wallet credit.
        </p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="username">TimeWall Username</Label>
          <Input
            id="username"
            name="username"
            type="email"
            value={settings.username}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">TimeWall Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={settings.password}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="offerwallUrl">TimeWall Offerwall URL</Label>
          <Input
            id="offerwallUrl"
            name="offerwallUrl"
            type="url"
            value={settings.offerwallUrl}
            onChange={handleChange}
            disabled={loading}
            required
          />
          <p className="text-[11px] text-muted-foreground">
            Supports placeholders like {'{userId}'}, {'{email}'}, and {'{name}'}. User identifiers are also appended automatically.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeWallPercentFree">Free Users Conversion Percentage (%)</Label>
          <div className="relative flex items-center">
            <Input
              id="timeWallPercentFree"
              name="timeWallPercentFree"
              type="number"
              step="0.00001"
              min="0"
              value={settings.timeWallPercentFree}
              onChange={handleChange}
              disabled={loading}
              className="pr-8"
              required
            />
            <span className="absolute right-3 text-sm text-muted-foreground font-bold pointer-events-none">%</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="postbackSecret">Postback Secret</Label>
          <Input
            id="postbackSecret"
            name="postbackSecret"
            type="text"
            value={settings.postbackSecret}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="md:col-span-2 border-t border-muted/50 pt-4 mt-2">
          <h3 className="text-sm font-bold text-white/80 mb-4">Membership Plan Conversion Percentages</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settings.plans.map((plan) => (
              <div key={plan.id} className="space-y-2">
                <Label htmlFor={`plan-${plan.id}`}>{plan.name} Conversion Percentage (%)</Label>
                <div className="relative flex items-center">
                  <Input
                    id={`plan-${plan.id}`}
                    type="number"
                    step="0.00001"
                    min="0"
                    value={plan.timeWallPercent}
                    onChange={(e) => handlePlanPercentChange(plan.id, e.target.value)}
                    disabled={loading}
                    className="pr-8"
                    required
                  />
                  <span className="absolute right-3 text-sm text-muted-foreground font-bold pointer-events-none">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="min-w-40">
        <Save className="w-4 h-4 mr-2" />
        {loading ? 'Saving...' : 'Save TimeWall Settings'}
      </Button>
    </form>
  )
}
