'use client'

import { useState } from 'react'
import { Copy, Check, Users, DollarSign } from 'lucide-react'
import { DataTable } from '@/components/dashboard/DataTable'
import { formatCurrency, formatDate, generateReferralLink } from '@/utils/formatters'
import { StatsCard } from './StatsCard'

interface ReferralClientProps {
  referralCode: string
  referrals: Array<{ id: string; commission: number; level: number; createdAt: string; referred: { name: string; email: string; createdAt: string } }>
  totalCommission: number
  totalReferrals: number
}

const cols = [
  { key: 'referred', label: 'Member', render: (_: unknown, row: Record<string, unknown>) => {
    const r = row.referred as { name: string; email: string }
    return (
      <div>
        <p className="text-sm font-medium">{r.name}</p>
        <p className="text-xs text-muted-foreground">{r.email}</p>
      </div>
    )
  }},
  { key: 'commission', label: 'Commission Earned', render: (v: unknown) => <span className="text-green-500 font-semibold">{formatCurrency(Number(v))}</span> },
  { key: 'level', label: 'Level', render: (v: unknown) => <span className="text-xs">Level {String(v)}</span> },
  { key: 'createdAt', label: 'Joined', render: (v: unknown) => <span className="text-xs text-muted-foreground">{formatDate(String(v))}</span> },
]

export function ReferralClient({ referralCode, referrals, totalCommission, totalReferrals }: ReferralClientProps) {
  const referralLink = generateReferralLink(referralCode)
  const [copied, setCopied] = useState<string | null>(null)

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Referral Program</h1>
      <p className="text-muted-foreground text-sm">Earn up to 10% commission by referring friends and family.</p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatsCard title="Total Referrals" value={totalReferrals} isCurrency={false} icon={<Users className="w-5 h-5 text-purple-500" />} iconBg="bg-purple-500/10" />
        <StatsCard title="Total Earnings" value={totalCommission} icon={<DollarSign className="w-5 h-5 text-gold-500" />} iconBg="bg-gold-500/10" />
      </div>

      {/* Share Links */}
      <div className="premium-card p-6 space-y-4">
        <h2 className="font-semibold">Your Referral Details</h2>

        <div>
          <label className="text-sm text-muted-foreground block mb-1.5">Referral Code</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-4 py-3 rounded-xl bg-muted/50 font-mono font-bold text-primary tracking-widest text-center">
              {referralCode}
            </code>
            <button onClick={() => copy(referralCode, 'code')} className="px-4 py-3 rounded-xl border border-border hover:bg-accent transition-colors">
              {copied === 'code' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm text-muted-foreground block mb-1.5">Referral Link</label>
          <div className="flex items-center gap-2">
            <input value={referralLink} readOnly className="flex-1 form-input text-xs font-mono" />
            <button onClick={() => copy(referralLink, 'link')} className="px-4 py-3 rounded-xl border border-border hover:bg-accent transition-colors shrink-0">
              {copied === 'link' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          <a href={`https://wa.me/?text=${encodeURIComponent('Join InvestPro and earn daily returns! ' + referralLink)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-green-500/10 text-green-500 border border-green-500/20 text-sm hover:bg-green-500/20 transition-colors">
            📱 Share on WhatsApp
          </a>
          <a href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm hover:bg-blue-500/20 transition-colors">
            ✈️ Share on Telegram
          </a>
        </div>
      </div>

      {/* Commission Structure */}
      <div className="premium-card p-6">
        <h2 className="font-semibold mb-4">Commission Structure</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { level: 'Level 1', rate: '5%', label: 'Direct Referrals' },
            { level: 'Level 2', rate: '3%', label: 'Indirect Referrals' },
            { level: 'Level 3', rate: '2%', label: 'Extended Network' },
          ].map((c) => (
            <div key={c.level} className="p-3 rounded-xl bg-muted/50">
              <p className="text-xs text-muted-foreground">{c.level}</p>
              <p className="text-2xl font-black text-primary">{c.rate}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team Table */}
      <div className="premium-card p-6">
        <h2 className="font-semibold mb-4">My Team ({totalReferrals})</h2>
        <DataTable data={referrals as unknown as Record<string, unknown>[]} columns={cols as Parameters<typeof DataTable>[0]['columns']} rowKey="id" searchPlaceholder="Search team..." emptyMessage="No referrals yet. Share your link to start earning!" />
      </div>
    </div>
  )
}
