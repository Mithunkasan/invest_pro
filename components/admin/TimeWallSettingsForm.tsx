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
    timeWallReferralCommissionStructure?: string
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

  // Initialize commission levels state
  const getInitialLevels = () => {
    if (initialSettings.timeWallReferralCommissionStructure) {
      return initialSettings.timeWallReferralCommissionStructure
        .split(',')
        .map((p) => Number(p.trim()))
        .filter((p) => !isNaN(p))
    }
    return [10, 5, 3]
  }

  const [commissionLevels, setCommissionLevels] = useState<number[]>(getInitialLevels())

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
        timeWallReferralCommissionStructure: commissionLevels.join(','),
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
          <Label htmlFor="timeWallPercentFree">Free Users Conversion Value (Multiplier)</Label>
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
              required
            />
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
          <h3 className="text-sm font-bold text-white/80 mb-4">Membership Plan Conversion Values (Multipliers)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settings.plans.map((plan) => (
              <div key={plan.id} className="space-y-2">
                <Label htmlFor={`plan-${plan.id}`}>{plan.name} Conversion Value</Label>
                <div className="relative flex items-center">
                  <Input
                    id={`plan-${plan.id}`}
                    type="number"
                    step="0.00001"
                    min="0"
                    value={plan.timeWallPercent}
                    onChange={(e) => handlePlanPercentChange(plan.id, e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section: TimeWall Referral Level Commissions ────────────────── */}
      <div className="border-t border-muted/50 pt-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4 border-muted/50">
          <div>
            <h3 className="text-sm font-bold text-white/80">TimeWall Referral Level Commissions</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configure the referral commission percentage distributed to each upline level for TimeWall earnings.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (commissionLevels.length > 1) {
                  setCommissionLevels(commissionLevels.slice(0, -1))
                }
              }}
              disabled={loading || commissionLevels.length <= 1}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50 transition-all text-xs"
            >
              - Remove Level
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setCommissionLevels([...commissionLevels, 0])
              }}
              disabled={loading}
              className="border-primary/30 text-primary hover:bg-primary/10 hover:text-primary-foreground transition-all text-xs"
            >
              + Add Level
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-2">
          {commissionLevels.map((pct, idx) => (
            <div key={idx} className="space-y-2 premium-card p-4 bg-background/30 border border-muted/40 relative overflow-hidden group rounded-xl">
              <div className="absolute top-2 right-3 text-[10px] font-bold text-primary/30 group-hover:text-primary/50 transition-colors uppercase tracking-wider">
                Level {idx + 1}
              </div>
              <Label htmlFor={`timewall-level-${idx}`} className="text-xs font-semibold text-white/70">
                Upline Level {idx + 1} (%)
              </Label>
              <div className="relative flex items-center">
                <Input
                  id={`timewall-level-${idx}`}
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={pct}
                  onChange={(e) => {
                    const newLevels = [...commissionLevels]
                    newLevels[idx] = e.target.value === '' ? 0 : Number(e.target.value)
                    setCommissionLevels(newLevels)
                  }}
                  disabled={loading}
                  className="pr-8 bg-background/50 font-medium text-white"
                />
                <span className="absolute right-3 text-sm text-muted-foreground font-bold pointer-events-none">%</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-normal">
                {idx === 0 
                  ? "Direct Referrer (e.g. User A refers User B)"
                  : `Level ${idx + 1} Uplines in the referral tree`}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={loading} className="min-w-40">
        <Save className="w-4 h-4 mr-2" />
        {loading ? 'Saving...' : 'Save TimeWall Settings'}
      </Button>
    </form>
  )
}
