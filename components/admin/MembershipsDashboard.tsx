'use client'

import { useState } from 'react'
import { MembershipsTable } from './AdminTables'
import { UserMembershipsTable } from './UserMembershipsTable'
import { UpgradeRequestsTable } from './UpgradeRequestsTable'
import { Crown, Sparkles, AlertCircle, Users } from 'lucide-react'

interface MembershipsDashboardProps {
  plans: any[]
  users: any[]
  upgradeRequests: any[]
}

export function MembershipsDashboard({ plans, users, upgradeRequests = [] }: MembershipsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'tiers' | 'assignments' | 'requests'>('tiers')

  // Stats calculations
  const activeCount = plans.filter(p => p.isActive).length
  const totalCount = plans.length
  const highestPrice = plans.length > 0 ? Math.max(...plans.map(p => p.price)) : 0
  const basicCount = users.filter(u => u.memberType === 'BASIC').length
  const premiumCount = users.filter(u => u.memberType === 'PREMIUM').length
  const totalSubscribers = basicCount + premiumCount

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <Crown className="w-6.5 h-6.5 text-amber-500" />
          Membership Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Create, edit, delete, and manage configurations for user membership tiers, pricing structures, and access levels.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="premium-card p-5 bg-gradient-to-br from-brand-900/60 to-brand-850/40 border-0 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Crown className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-brand-300 font-bold uppercase tracking-wider">Active Tiers</p>
            <p className="text-2xl font-black text-white mt-0.5">{activeCount} / {totalCount}</p>
          </div>
        </div>
        <div className="premium-card p-5 bg-gradient-to-br from-brand-900/60 to-brand-850/40 border-0 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Sparkles className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-brand-300 font-bold uppercase tracking-wider">Max Tier Price</p>
            <p className="text-2xl font-black text-white mt-0.5">
              {highestPrice > 0 ? `₹${highestPrice.toLocaleString('en-IN')}` : '₹0.00'}
            </p>
          </div>
        </div>
        <div className="premium-card p-5 bg-gradient-to-br from-brand-900/60 to-brand-850/40 border-0 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
            <Users className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-xs text-brand-300 font-bold uppercase tracking-wider">Total Subscribed</p>
            <p className="text-2xl font-black text-white mt-0.5">{totalSubscribers} Members</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-brand-800 gap-1.5">
        <button
          type="button"
          onClick={() => setActiveTab('tiers')}
          className={`px-5 py-2.5 text-sm font-bold transition-all border-b-2 rounded-t-xl flex items-center gap-1.5 ${
            activeTab === 'tiers'
              ? 'border-amber-500 text-amber-400 bg-brand-900/40'
              : 'border-transparent text-brand-300 hover:text-white hover:bg-brand-900/10'
          }`}
        >
          <Crown className="w-4 h-4" />
          Membership Tiers
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('assignments')}
          className={`px-5 py-2.5 text-sm font-bold transition-all border-b-2 rounded-t-xl flex items-center gap-1.5 ${
            activeTab === 'assignments'
              ? 'border-amber-500 text-amber-400 bg-brand-900/40'
              : 'border-transparent text-brand-300 hover:text-white hover:bg-brand-900/10'
          }`}
        >
          <Users className="w-4 h-4" />
          User Assignments
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`px-5 py-2.5 text-sm font-bold transition-all border-b-2 rounded-t-xl flex items-center gap-1.5 ${
            activeTab === 'requests'
              ? 'border-amber-500 text-amber-400 bg-brand-900/40'
              : 'border-transparent text-brand-300 hover:text-white hover:bg-brand-900/10'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Upgrade Requests
          {upgradeRequests.filter(r => r.status === 'PENDING').length > 0 && (
            <span className="ml-1 text-[10px] bg-amber-500 text-black px-1.5 py-0.5 rounded-full font-black animate-pulse">
              {upgradeRequests.filter(r => r.status === 'PENDING').length}
            </span>
          )}
        </button>
      </div>

      {/* Dashboard Panels */}
      <div className="premium-card p-6">
        {activeTab === 'tiers' ? (
          <MembershipsTable data={plans} />
        ) : activeTab === 'assignments' ? (
          <UserMembershipsTable users={users} plans={plans} />
        ) : (
          <UpgradeRequestsTable requests={upgradeRequests} />
        )}
      </div>
    </div>
  )
}
