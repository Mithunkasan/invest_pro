'use client'

import { useState } from 'react'
import { Copy, Check, Users } from 'lucide-react'
import { DataTable } from '@/components/dashboard/DataTable'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { StatsCard } from './StatsCard'

interface TeamMember {
  id: string
  name: string
  phone: string | null
  level: number
  totalEarning: number
  walletBalance: number
  rank: string
}

interface ReferralClientProps {
  referralCode: string
  referralLink: string
  team: TeamMember[]
  totalReferrals: number
  referralCommissionStructure: string
}

const cols = [
  { 
    key: 'name', 
    label: 'Name', 
    sortable: true, 
    render: (v: unknown) => <span className="font-semibold text-white/95">{String(v)}</span> 
  },
  { 
    key: 'level', 
    label: 'Level', 
    sortable: true, 
    render: (v: unknown) => (
      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border shadow-sm ${
        Number(v) === 1 
          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
          : 'bg-zinc-800/50 text-zinc-400 border-zinc-700/30'
      }`}>
        {Number(v) === 1 ? 'Direct (L1)' : `Indirect (L${v})`}
      </span>
    )
  },
  { 
    key: 'phone', 
    label: 'Mobile No', 
    render: (v: unknown, row: any) => (
      <span className="font-mono text-xs text-white/80">{row.level === 1 ? String(v || '—') : '—'}</span>
    )
  },
  { 
    key: 'totalEarning', 
    label: 'Total Earning', 
    sortable: true, 
    render: (v: unknown, row: any) => (
      <span className="font-medium text-xs text-green-400">{row.level === 1 ? formatCurrency(Number(v)) : '—'}</span>
    )
  },
  { 
    key: 'walletBalance', 
    label: 'Available Wallet', 
    sortable: true, 
    render: (v: unknown, row: any) => (
      <span className="font-medium text-xs text-white/80">{row.level === 1 ? formatCurrency(Number(v)) : '—'}</span>
    )
  },
  { 
    key: 'rank', 
    label: 'Rank', 
    sortable: true, 
    render: (v: unknown) => (
      <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{String(v)}</span>
    )
  },
]

export function ReferralClient({ 
  referralCode, 
  referralLink,
  team, 
  totalReferrals, 
  referralCommissionStructure 
}: ReferralClientProps) {
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

      {/* Stats - Display only Total Referrals */}
      <div className="grid grid-cols-1 max-w-sm gap-4">
        <StatsCard 
          title="Total Referrals" 
          value={totalReferrals} 
          isCurrency={false} 
          icon={<Users className="w-5 h-5 text-purple-500" />} 
          iconBg="bg-purple-500/10" 
        />
      </div>

      {/* Share Links */}
      <div className="premium-card p-6 space-y-4">
        <h2 className="font-semibold text-white/95">Your Referral Details</h2>

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
          <a href={`https://wa.me/?text=${encodeURIComponent('Join VR Galaxy Network and earn daily returns! ' + referralLink)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-green-500/10 text-green-500 border border-green-500/20 text-sm hover:bg-green-500/20 transition-colors">
            📱 Share on WhatsApp
          </a>
          <a href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm hover:bg-blue-500/20 transition-colors">
            ✈️ Share on Telegram
          </a>
        </div>
      </div>

      {/* Commission Structure */}
      <div className="premium-card p-6">
        <h2 className="font-semibold mb-4 text-white/95">Commission Structure</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 text-center">
          {(referralCommissionStructure || '10,5,3')
            .split(',')
            .map((p) => p.trim())
            .filter(Boolean)
            .map((rate, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-muted/50 border border-muted/30">
                <p className="text-xs text-muted-foreground font-semibold font-mono">Level {idx + 1}</p>
                <p className="text-2xl font-black text-primary my-1 font-mono">{rate}%</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                  {idx === 0 ? 'Direct Referrals' : idx === 1 ? 'Indirect Upline' : 'Network Upline'}
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* My Team Section */}
      <div className="premium-card p-6">
        <h2 className="font-semibold mb-4 text-white/95">My Team ({team.length})</h2>
        <DataTable 
          data={team as unknown as Record<string, unknown>[]} 
          columns={cols as Parameters<typeof DataTable>[0]['columns']} 
          rowKey="id" 
          searchPlaceholder="Search team members..." 
          emptyMessage="No team members yet. Share your referral link to build your team!" 
        />
      </div>
    </div>
  )
}
