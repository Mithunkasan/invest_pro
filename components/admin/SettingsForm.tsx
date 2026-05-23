'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { updateSystemSettingsAction } from '@/actions/admin'
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
import { Check, AlertCircle, Save } from 'lucide-react'

interface SettingsFormProps {
  initialSettings: {
    referralPercent: number
    level1Percent: number
    level2Percent: number
    level3Percent: number
    levelIncomeEnabled: boolean
    starPerformerThreshold: number
    starPerformerEnabled: boolean
    tlRankRequiredReferrals: number
    tlRankMaxUsers: number
    tlRankEnabled: boolean
  }
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value === '' ? '' : Number(value),
    }))
  }

  const handleToggle = (name: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const res = await updateSystemSettingsAction(settings)
      if (res.success) {
        setMessage({ type: 'success', text: res.message })
      } else {
        setMessage({ type: 'error', text: res.message })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
          }`}
        >
          {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{message.text}</span>
        </motion.div>
      )}

      {/* ── Section 1: Referral & Commission ──────────────────────── */}
      <div className="premium-card p-6 space-y-6">
        <h2 className="text-lg font-bold border-b pb-3 border-muted/50 text-white/90">Referral Commissions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="referralPercent" className="text-sm font-semibold">Direct Referral Commission (%)</Label>
            <Input
              id="referralPercent"
              name="referralPercent"
              type="number"
              step="0.01"
              value={settings.referralPercent}
              onChange={handleChange}
              disabled={loading}
              className="bg-background/50"
            />
            <p className="text-xs text-muted-foreground">Percentage credited to direct referrer on user investment.</p>
          </div>
        </div>
      </div>

      {/* ── Section 2: Level Income Configuration ───────────────────── */}
      <div className="premium-card p-6 space-y-6">
        <div className="flex items-center justify-between border-b pb-3 border-muted/50">
          <h2 className="text-lg font-bold text-white/90">Level Income System</h2>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.levelIncomeEnabled}
              onChange={(e) => handleToggle('levelIncomeEnabled', e.target.checked)}
              disabled={loading}
            />
            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            <span className="ml-3 text-sm font-bold text-white/80">Enabled</span>
          </label>
        </div>

        {settings.levelIncomeEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2"
          >
            <div className="space-y-2">
              <Label htmlFor="level1Percent" className="text-sm font-semibold">Level 1 Commission (%)</Label>
              <Input
                id="level1Percent"
                name="level1Percent"
                type="number"
                step="0.01"
                value={settings.level1Percent}
                onChange={handleChange}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">Direct Referrer (Standard: 10%)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level2Percent" className="text-sm font-semibold">Level 2 Commission (%)</Label>
              <Input
                id="level2Percent"
                name="level2Percent"
                type="number"
                step="0.01"
                value={settings.level2Percent}
                onChange={handleChange}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">Level 2 Referrer (Standard: 5%)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level3Percent" className="text-sm font-semibold">Level 3 Commission (%)</Label>
              <Input
                id="level3Percent"
                name="level3Percent"
                type="number"
                step="0.01"
                value={settings.level3Percent}
                onChange={handleChange}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">Level 3 Referrer (Standard: 2%)</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Section 3: Star Performer Automations ────────────────────── */}
      <div className="premium-card p-6 space-y-6">
        <div className="flex items-center justify-between border-b pb-3 border-muted/50">
          <h2 className="text-lg font-bold text-white/90">Star Performer Promotion</h2>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.starPerformerEnabled}
              onChange={(e) => handleToggle('starPerformerEnabled', e.target.checked)}
              disabled={loading}
            />
            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            <span className="ml-3 text-sm font-bold text-white/80">Enabled</span>
          </label>
        </div>

        {settings.starPerformerEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2"
          >
            <div className="space-y-2">
              <Label htmlFor="starPerformerThreshold" className="text-sm font-semibold">Wallet Threshold Amount (₹)</Label>
              <Input
                id="starPerformerThreshold"
                name="starPerformerThreshold"
                type="number"
                value={settings.starPerformerThreshold}
                onChange={handleChange}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">Required Main Wallet balance to auto-promote user to Star Performer status.</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Section 4: TL Rank Automations ─────────────────────────── */}
      <div className="premium-card p-6 space-y-6">
        <div className="flex items-center justify-between border-b pb-3 border-muted/50">
          <h2 className="text-lg font-bold text-white/90">TL Rank Promotion</h2>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.tlRankEnabled}
              onChange={(e) => handleToggle('tlRankEnabled', e.target.checked)}
              disabled={loading}
            />
            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            <span className="ml-3 text-sm font-bold text-white/80">Enabled</span>
          </label>
        </div>

        {settings.tlRankEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2"
          >
            <div className="space-y-2">
              <Label htmlFor="tlRankRequiredReferrals" className="text-sm font-semibold">Required Active Referrals</Label>
              <Input
                id="tlRankRequiredReferrals"
                name="tlRankRequiredReferrals"
                type="number"
                value={settings.tlRankRequiredReferrals}
                onChange={handleChange}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">Number of referred members with active investments needed for TL Rank.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tlRankMaxUsers" className="text-sm font-semibold">Max Global Limit (Users Cap)</Label>
              <Input
                id="tlRankMaxUsers"
                name="tlRankMaxUsers"
                type="number"
                value={settings.tlRankMaxUsers}
                onChange={handleChange}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">Maximum first N eligible users globally to auto-receive TL Rank status (Standard: 25).</p>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="gap-2 px-6">
          <Save size={18} /> {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </form>
  )
}
