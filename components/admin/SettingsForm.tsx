'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { updateSystemSettingsAction } from '@/actions/admin'
import { Button } from '@/components/ui/button'
import { Check, AlertCircle, Save } from 'lucide-react'

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

interface SettingsFormProps {
  initialSettings: {
    referralPercent: number
    level1Percent: number
    level2Percent: number
    level3Percent: number
    levelIncomeEnabled: boolean
    referralCommissionStructure?: string
    starPerformerThreshold: number
    starPerformerEnabled: boolean
    doubleStarThreshold: number
    doubleStarEnabled: boolean
    eliteThreshold: number
    eliteEnabled: boolean
    tlRankRequiredReferrals: number
    tlRankRequiredCommission: number
    tlRankMaxUsers: number
    tlRankEnabled: boolean
    directorRankRequiredTLs: number
    directorRankMaxUsers: number
    directorRankEnabled: boolean
    heroMembers: string
    heroActive: string
    heroPaid: string
    heroRate: string
    withdrawalDeductionPercent?: number
    userPayDeductionPercent?: number
    basicDailyYieldPercent?: number
    giftDepositAmount?: number
  }
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [settings, setSettings] = useState({
    ...initialSettings,
    doubleStarThreshold: initialSettings.doubleStarThreshold ?? 25000.0,
    doubleStarEnabled: initialSettings.doubleStarEnabled ?? true,
    eliteThreshold: initialSettings.eliteThreshold ?? 50000.0,
    eliteEnabled: initialSettings.eliteEnabled ?? true,
    tlRankRequiredCommission: initialSettings.tlRankRequiredCommission ?? 100000.0,
    directorRankRequiredTLs: initialSettings.directorRankRequiredTLs ?? 5,
    directorRankMaxUsers: initialSettings.directorRankMaxUsers ?? 5,
    directorRankEnabled: initialSettings.directorRankEnabled ?? true,
    withdrawalDeductionPercent: initialSettings.withdrawalDeductionPercent ?? 20.0,
    userPayDeductionPercent: initialSettings.userPayDeductionPercent ?? 0.0,
    basicDailyYieldPercent: initialSettings.basicDailyYieldPercent ?? 0.2,
    heroMembers: initialSettings.heroMembers || '25,689+',
    heroActive: initialSettings.heroActive || '8,932+',
    heroPaid: initialSettings.heroPaid || '₹12.45 Cr+',
    heroRate: initialSettings.heroRate || '99.8%',
    giftDepositAmount: initialSettings.giftDepositAmount ?? 0,
  })

  // Initialize referral levels
  const getInitialLevels = () => {
    if (initialSettings.referralCommissionStructure) {
      return initialSettings.referralCommissionStructure
        .split(',')
        .map((p) => Number(p.trim()))
        .filter((p) => !isNaN(p))
    }
    // Fallback to legacy fields
    return [
      initialSettings.referralPercent ?? 10,
      initialSettings.level2Percent ?? 5,
      initialSettings.level3Percent ?? 2,
    ]
  }

  const [commissionLevels, setCommissionLevels] = useState<number[]>(getInitialLevels())
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    const isStringField = name.startsWith('hero')
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value === '' ? '' : (isStringField ? value : Number(value)),
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
      const payload = {
        ...settings,
        referralCommissionStructure: commissionLevels.join(','),
        // Sync legacy fields for backwards compatibility
        referralPercent: commissionLevels[0] || 0,
        level1Percent: commissionLevels[0] || 0,
        level2Percent: commissionLevels[1] || 0,
        level3Percent: commissionLevels[2] || 0,
      }
      const res = await updateSystemSettingsAction(payload)
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

      {/* ── Section: Referral Level Commissions ──────────────────────── */}
      <div className="premium-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4 border-muted/50">
          <div>
            <h2 className="text-lg font-bold text-white/90">Referral Level Commissions</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configure the referral commission percentage distributed to each upline level.
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
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50 transition-all"
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
              className="border-primary/30 text-primary hover:bg-primary/10 hover:text-primary-foreground transition-all"
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
              <Label htmlFor={`level-${idx}`} className="text-sm font-semibold text-white/90">
                Upline Level {idx + 1} (%)
              </Label>
              <div className="relative flex items-center">
                <Input
                  id={`level-${idx}`}
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

      {/* ── Section 3: Performance Badges Automations ────────────────────── */}
      <div className="premium-card p-6 space-y-6">
        <h2 className="text-lg font-bold text-white/90 border-b pb-3 border-muted/50">Performance Badges Configuration</h2>
        
        {/* Star Performer */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white/80">⭐ Star Performer Badge</h3>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4 border-l border-primary/20">
              <div className="space-y-2">
                <Label htmlFor="starPerformerThreshold" className="text-xs font-semibold text-white/70">Commission Threshold Amount (₹)</Label>
                <Input
                  id="starPerformerThreshold"
                  name="starPerformerThreshold"
                  type="number"
                  value={settings.starPerformerThreshold}
                  onChange={handleChange}
                  disabled={loading}
                />
                <p className="text-[11px] text-muted-foreground">Cumulative referral commissions needed to auto-promote to Star Performer (Standard: ₹5,000).</p>
              </div>
            </div>
          )}
        </div>

        {/* Double Star Performer */}
        <div className="space-y-4 pt-4 border-t border-muted/30">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white/80">⭐⭐ Double Star Performer Badge</h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.doubleStarEnabled}
                onChange={(e) => handleToggle('doubleStarEnabled', e.target.checked)}
                disabled={loading}
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              <span className="ml-3 text-sm font-bold text-white/80">Enabled</span>
            </label>
          </div>
          {settings.doubleStarEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4 border-l border-primary/20">
              <div className="space-y-2">
                <Label htmlFor="doubleStarThreshold" className="text-xs font-semibold text-white/70">Commission Threshold Amount (₹)</Label>
                <Input
                  id="doubleStarThreshold"
                  name="doubleStarThreshold"
                  type="number"
                  value={settings.doubleStarThreshold}
                  onChange={handleChange}
                  disabled={loading}
                />
                <p className="text-[11px] text-muted-foreground">Cumulative referral commissions needed to auto-promote to Double Star Performer (Standard: ₹25,000).</p>
              </div>
            </div>
          )}
        </div>

        {/* Elite Performer */}
        <div className="space-y-4 pt-4 border-t border-muted/30">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white/80">💎 Elite Performer Badge</h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.eliteEnabled}
                onChange={(e) => handleToggle('eliteEnabled', e.target.checked)}
                disabled={loading}
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              <span className="ml-3 text-sm font-bold text-white/80">Enabled</span>
            </label>
          </div>
          {settings.eliteEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4 border-l border-primary/20">
              <div className="space-y-2">
                <Label htmlFor="eliteThreshold" className="text-xs font-semibold text-white/70">Commission Threshold Amount (₹)</Label>
                <Input
                  id="eliteThreshold"
                  name="eliteThreshold"
                  type="number"
                  value={settings.eliteThreshold}
                  onChange={handleChange}
                  disabled={loading}
                />
                <p className="text-[11px] text-muted-foreground">Cumulative referral commissions needed to auto-promote to Elite Performer (Standard: ₹50,000).</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Section 4: TL Rank Automations ─────────────────────────── */}
      <div className="premium-card p-6 space-y-6">
        <div className="flex items-center justify-between border-b pb-3 border-muted/50">
          <div>
            <h2 className="text-lg font-bold text-white/90">TL Rank Promotion Settings</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Awarded to users referring 5 active members with commissions ≥ ₹1,00,000.</p>
          </div>
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
            className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2"
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
              <p className="text-[11px] text-muted-foreground">Number of referred members with active Smart Hybrid Digital Earnings needed (Standard: 5).</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tlRankRequiredCommission" className="text-sm font-semibold">Required Cumulative Commission (₹)</Label>
              <Input
                id="tlRankRequiredCommission"
                name="tlRankRequiredCommission"
                type="number"
                value={settings.tlRankRequiredCommission}
                onChange={handleChange}
                disabled={loading}
              />
              <p className="text-[11px] text-muted-foreground">Cumulative commission from referred users needed (Standard: ₹1,00,000).</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tlRankMaxUsers" className="text-sm font-semibold">Max Global Shareholder Limit</Label>
              <Input
                id="tlRankMaxUsers"
                name="tlRankMaxUsers"
                type="number"
                value={settings.tlRankMaxUsers}
                onChange={handleChange}
                disabled={loading}
              />
              <p className="text-[11px] text-muted-foreground">First N eligible users globally to auto-receive 1% business shareholder status (Standard: 25).</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Section 4.5: Director Rank Automations ─────────────────────────── */}
      <div className="premium-card p-6 space-y-6">
        <div className="flex items-center justify-between border-b pb-3 border-muted/50">
          <div>
            <h2 className="text-lg font-bold text-white/90">Director Rank Promotion Settings</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Awarded to users referring 5 Team Leaders.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.directorRankEnabled}
              onChange={(e) => handleToggle('directorRankEnabled', e.target.checked)}
              disabled={loading}
            />
            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            <span className="ml-3 text-sm font-bold text-white/80">Enabled</span>
          </label>
        </div>

        {settings.directorRankEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2"
          >
            <div className="space-y-2">
              <Label htmlFor="directorRankRequiredTLs" className="text-sm font-semibold">Required Team Leaders</Label>
              <Input
                id="directorRankRequiredTLs"
                name="directorRankRequiredTLs"
                type="number"
                value={settings.directorRankRequiredTLs}
                onChange={handleChange}
                disabled={loading}
              />
              <p className="text-[11px] text-muted-foreground">Number of referred members with Team Leader rank needed (Standard: 5).</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="directorRankMaxUsers" className="text-sm font-semibold">Max Global Shareholder Limit</Label>
              <Input
                id="directorRankMaxUsers"
                name="directorRankMaxUsers"
                type="number"
                value={settings.directorRankMaxUsers}
                onChange={handleChange}
                disabled={loading}
              />
              <p className="text-[11px] text-muted-foreground">First N eligible users globally to auto-receive 1% business shareholder status (Standard: 5).</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Section: Withdrawal Settings ─────────────────────────── */}
      <div className="premium-card p-6 space-y-6">
        <h2 className="text-lg font-bold border-b pb-3 border-muted/50 text-white/90">Withdrawal Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <Label htmlFor="withdrawalDeductionPercent" className="text-sm font-semibold">Withdrawal Deduction Percentage (%)</Label>
            <div className="relative flex items-center">
              <Input
                id="withdrawalDeductionPercent"
                name="withdrawalDeductionPercent"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={settings.withdrawalDeductionPercent}
                onChange={handleChange}
                disabled={loading}
                className="pr-8 bg-background/50 font-medium text-white"
              />
              <span className="absolute right-3 text-sm text-muted-foreground font-bold pointer-events-none">%</span>
            </div>
            <p className="text-[11px] text-muted-foreground">The percentage dynamically deducted from user withdrawal requests before processing (e.g. 20%).</p>
          </div>
        </div>
      </div>

      {/* ── Section: Send Money Settings ─────────────────────────── */}
      <div className="premium-card p-6 space-y-6">
        <h2 className="text-lg font-bold border-b pb-3 border-muted/50 text-white/90">Send Money Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <Label htmlFor="userPayDeductionPercent" className="text-sm font-semibold">Send Money Deduction Percentage (%)</Label>
            <div className="relative flex items-center">
              <Input
                id="userPayDeductionPercent"
                name="userPayDeductionPercent"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={settings.userPayDeductionPercent}
                onChange={handleChange}
                disabled={loading}
                className="pr-8 bg-background/50 font-medium text-white"
              />
              <span className="absolute right-3 text-sm text-muted-foreground font-bold pointer-events-none">%</span>
            </div>
            <p className="text-[11px] text-muted-foreground">The percentage dynamically deducted from Send Money transfers (e.g. 5%). Set to 0 for no deduction.</p>
          </div>
        </div>
      </div>

      {/* ── Section: Gift Deposit Settings ────────────────────── */}
      <div className="premium-card p-6 space-y-6">
        <h2 className="text-lg font-bold border-b pb-3 border-muted/50 text-white/90">Gift Deposit Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <Label htmlFor="giftDepositAmount" className="text-sm font-semibold">Required Gift Deposit Amount (₹)</Label>
            <div className="relative flex items-center">
              <Input
                id="giftDepositAmount"
                name="giftDepositAmount"
                type="number"
                step="1"
                min="0"
                value={settings.giftDepositAmount}
                onChange={handleChange}
                disabled={loading}
                className="pl-8 bg-background/50 font-medium text-white"
              />
              <span className="absolute left-3 text-sm text-muted-foreground font-bold pointer-events-none">₹</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Amount users must deposit and get admin approval before they can submit a gift shipping address. Set to 0 to disable the requirement.</p>
          </div>
        </div>
      </div>

      {/* ── Section 5: Hero Section Statistics ────────────────────── */}
      <div className="premium-card p-6 space-y-6">
        <h2 className="text-lg font-bold border-b pb-3 border-muted/50 text-white/90">Hero Section Live Statistics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="heroMembers" className="text-sm font-semibold">Total Members</Label>
            <Input
              id="heroMembers"
              name="heroMembers"
              type="text"
              value={settings.heroMembers || ''}
              onChange={handleChange}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">Displayed on the frontend. Supports format like: <code className="text-primary font-bold">25,689+</code></p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="heroActive" className="text-sm font-semibold">Active Today</Label>
            <Input
              id="heroActive"
              name="heroActive"
              type="text"
              value={settings.heroActive || ''}
              onChange={handleChange}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">Displayed on the frontend. Supports format like: <code className="text-primary font-bold">8,932+</code></p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="heroPaid" className="text-sm font-semibold">Total Paid</Label>
            <Input
              id="heroPaid"
              name="heroPaid"
              type="text"
              value={settings.heroPaid || ''}
              onChange={handleChange}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">Displayed on the frontend. Supports format like: <code className="text-primary font-bold">₹12.45 Cr+</code></p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="heroRate" className="text-sm font-semibold">Success Rate</Label>
            <Input
              id="heroRate"
              name="heroRate"
              type="text"
              value={settings.heroRate || ''}
              onChange={handleChange}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">Displayed on the frontend. Supports format like: <code className="text-primary font-bold">99.8%</code></p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="gap-2 px-6">
          <Save size={18} /> {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </form>
  )
}
