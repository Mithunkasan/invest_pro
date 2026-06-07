'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sendAdminBonusAction } from '@/actions/admin'
import { Button } from '@/components/ui/button'
import { Coins, User, DollarSign, MessageSquare, Wallet, Check, AlertCircle, Calendar, ShieldAlert } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'

interface UserItem {
  email: string
  name: string
  memberType: 'FREE' | 'BASIC' | 'PREMIUM'
}

interface BonusLog {
  id: string
  date: Date
  amount: number
  userEmail: string
  originalWallet: string
  creditedWallet: string
  remark: string
  sentBy: string
  freeRestricted: boolean
}

interface BonusClientProps {
  users: UserItem[]
  initialBonuses: BonusLog[]
}

const walletOptions = [
  'Main Wallet',
  'Deposit Wallet',
  'Referral Wallet',
  'Reward Wallet',
  'Game Wallet',
  'Bonus Wallet',
  'Share Wallet',
  'Level Wallet'
]

const remarkSuggestions = [
  'Performance Bonus',
  'Referral Reward',
  'Promotional Bonus',
  'Festival Bonus'
]

function formatDDMMYYYY(date: Date | string): string {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
}

export function BonusClient({ users, initialBonuses }: BonusClientProps) {
  const [emailInput, setEmailInput] = useState('')
  const [amount, setAmount] = useState('')
  const [remark, setRemark] = useState('')
  const [selectedWallet, setSelectedWallet] = useState('Main Wallet')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null)
  
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [history, setHistory] = useState<BonusLog[]>(initialBonuses)

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter users based on search input
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(emailInput.toLowerCase()) ||
    user.name.toLowerCase().includes(emailInput.toLowerCase())
  ).slice(0, 10)

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectUser = (user: UserItem) => {
    setSelectedUser(user)
    setEmailInput(user.email)
    setShowDropdown(false)
    setMsg(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser && !users.some(u => u.email === emailInput)) {
      setMsg({ type: 'error', text: 'Please select a valid registered user from the dropdown.' })
      return
    }

    const emailToUse = selectedUser ? selectedUser.email : emailInput
    const parsedAmount = parseFloat(amount)

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setMsg({ type: 'error', text: 'Please enter a valid amount greater than zero.' })
      return
    }

    setMsg(null)

    startTransition(async () => {
      const res = await sendAdminBonusAction(emailToUse, parsedAmount, selectedWallet, remark)
      if (res.success) {
        setMsg({ type: 'success', text: res.message })
        // Clear form
        setEmailInput('')
        setAmount('')
        setRemark('')
        setSelectedUser(null)
        setSelectedWallet('Main Wallet')
        
        // Add to local history list
        const newLog: BonusLog = {
          id: Date.now().toString(),
          date: new Date(),
          amount: parsedAmount,
          userEmail: emailToUse,
          originalWallet: selectedWallet,
          creditedWallet: selectedWallet,
          remark: remark,
          sentBy: 'You', // Just a placeholder for immediate local addition
          freeRestricted: false
        }
        setHistory(prev => [newLog, ...prev])
      } else {
        setMsg({ type: 'error', text: res.message })
      }
    })
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center gap-3 border-b border-muted/50 pb-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center shadow-lg shadow-primary/20">
          <Coins className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Bonus Transfer</h1>
          <p className="text-sm text-muted-foreground">Credit manually approved bonuses to specific wallets of registered users.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-2 premium-card p-6 space-y-6 bg-card/45 backdrop-blur-xl border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-lg font-bold text-white/90 border-b border-muted/50 pb-3">Bonus Transfer Form</h2>

          {msg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl flex items-center gap-3 ${
                msg.type === 'success' 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              {msg.type === 'success' ? <Check className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <span className="text-sm font-medium">{msg.text}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* User Email Dropdown */}
            <div className="space-y-2 relative" ref={dropdownRef}>
              <label className="text-xs font-semibold text-white/80 uppercase tracking-wider block flex items-center gap-1.5">
                <User className="w-4 h-4 text-primary" /> User Email
              </label>
              <input
                type="text"
                placeholder="Search user email or name..."
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value)
                  setSelectedUser(null)
                  setShowDropdown(true)
                }}
                onFocus={() => setShowDropdown(true)}
                required
                className="flex h-11 w-full rounded-xl border border-border bg-background/50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-white/30 transition-all"
              />

              {showDropdown && emailInput.trim().length > 0 && (
                <div className="absolute z-20 w-full mt-1.5 rounded-xl border border-border bg-popover/95 backdrop-blur-md shadow-2xl overflow-hidden max-h-60 overflow-y-auto no-scrollbar">
                  {filteredUsers.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground text-center">No users found</div>
                  ) : (
                    filteredUsers.map((user) => (
                      <button
                        key={user.email}
                        type="button"
                        onClick={() => handleSelectUser(user)}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-primary/10 transition-colors flex items-center justify-between border-b border-white/5 last:border-0"
                      >
                        <div>
                          <p className="font-semibold text-white">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          user.memberType === 'FREE' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}>
                          {user.memberType}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}

              {selectedUser && (
                <div className="mt-2 p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground font-medium block">Selected User</span>
                    <span className="font-bold text-white">{selectedUser.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground font-medium block">Membership</span>
                    <span className={`text-xs font-black uppercase tracking-wider block ${
                      selectedUser.memberType === 'FREE' ? 'text-emerald-400' : 'text-indigo-400'
                    }`}>{selectedUser.memberType}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Choose Wallet */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/80 uppercase tracking-wider block flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-primary" /> Choose Wallet
                </label>
                <select
                  value={selectedWallet}
                  onChange={(e) => setSelectedWallet(e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-border bg-background/50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white transition-all cursor-pointer"
                >
                  {walletOptions.map(opt => (
                    <option key={opt} value={opt} className="bg-popover text-white">{opt}</option>
                  ))}
                </select>
                {/* Free Member Wallet restriction removed */}
              </div>

              {/* Send Amount */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/80 uppercase tracking-wider block flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-primary" /> Send Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="1"
                  step="any"
                  className="flex h-11 w-full rounded-xl border border-border bg-background/50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-white/30 transition-all"
                />
              </div>
            </div>

            {/* Remark */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/80 uppercase tracking-wider block flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-primary" /> Remark / Reason
              </label>
              <input
                type="text"
                placeholder="Enter reason for bonus..."
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                required
                className="flex h-11 w-full rounded-xl border border-border bg-background/50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-white/30 transition-all"
              />

              {/* Suggestions Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {remarkSuggestions.map(sug => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setRemark(sug)}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/80 hover:bg-primary/20 hover:text-white transition-colors cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-blue-600 font-bold text-white shadow-lg shadow-primary/20 hover:from-primary-hover hover:to-blue-500/90 transition-all cursor-pointer mt-2"
            >
              {isPending ? 'Processing Transfer...' : 'Submit Bonus Transfer'}
            </Button>
          </form>
        </div>

        {/* Info Rules Box */}
        <div className="premium-card p-5 bg-gradient-to-br from-indigo-950/20 to-blue-950/20 border-white/5 space-y-4">
          <h3 className="font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2 text-sm">
            <ShieldAlert className="w-4.5 h-4.5 text-amber-400" />
            Transfer Rules
          </h3>
          <ul className="text-xs space-y-2.5 text-white/70 leading-relaxed font-medium">
            <li className="flex gap-2">
              <span className="text-primary font-bold">1.</span>
              <span><strong>Searchable Selection:</strong> You must select a user whose email is registered and matches in the database.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">2.</span>
              <span><strong>Separate Sub-Wallets:</strong> All users (including Free Members) support separate sub-wallets (Reward, Referral, Level, Share, Bonus), allowing you to target transfers precisely.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">3.</span>
              <span><strong>Audit Logging:</strong> All bonuses generate a strict transaction record under the user profile and trigger immediate dashboard updates and in-app notifications.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* History Log Section */}
      <div className="premium-card p-6 bg-card/45 backdrop-blur-xl border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <h2 className="text-lg font-bold text-white/90 border-b border-muted/50 pb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" /> Admin Bonus History Log
        </h2>

        <div className="overflow-x-auto pt-4 no-scrollbar">
          {history.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">No bonuses transferred yet.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-xs text-muted-foreground uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">User Email</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Target Wallet</th>
                  <th className="py-3 px-4">Credited Wallet</th>
                  <th className="py-3 px-4">Remark</th>
                  <th className="py-3 px-4">Sent By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {history.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 text-xs font-semibold text-muted-foreground whitespace-nowrap">
                      {formatDDMMYYYY(log.date)}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white max-w-[200px] truncate" title={log.userEmail}>
                      {log.userEmail}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-green-400 whitespace-nowrap">
                      +{formatCurrency(log.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-white/80">
                      {log.originalWallet}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold">
                      <span className={log.freeRestricted ? 'text-amber-400 flex items-center gap-1' : 'text-emerald-400'}>
                        {log.creditedWallet}
                        {log.freeRestricted && (
                          <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded text-amber-400" title="Free Member Overridden">
                            Free Override
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-white/80 max-w-[180px] truncate" title={log.remark}>
                      {log.remark}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-primary">
                      {log.sentBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
