'use client'

import { useState, useEffect, useTransition } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeftRight, Check, AlertCircle, HelpCircle, Wallet, ArrowUpRight, ArrowDownLeft, Clock, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { formatCurrency, formatDate, getStatusColor } from '@/utils/formatters'
import { validateRecipientEmailAction, submitUserPayRequestAction } from '@/actions/userPay'

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

interface UserPayClientProps {
  userId: string
  walletBalance: number
  deductionPercent: number
  initialRequests: any[]
}

export function UserPayClient({ userId, walletBalance, deductionPercent, initialRequests }: UserPayClientProps) {
  const [email, setEmail] = useState('')
  const [recipientId, setRecipientId] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [isValidatingEmail, setIsValidatingEmail] = useState(false)
  const [emailError, setEmailError] = useState('')

  const [amount, setAmount] = useState('')
  const [isPending, startTransition] = useTransition()
  const [requests, setRequests] = useState(initialRequests)

  // Real-time email validation and recipient ID retrieval
  useEffect(() => {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) {
      setRecipientId('')
      setRecipientName('')
      setEmailError('')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmed)) {
      setRecipientId('')
      setRecipientName('')
      setEmailError('Please enter a valid email address')
      return
    }

    setEmailError('')
    setIsValidatingEmail(true)

    const timer = setTimeout(async () => {
      const res = await validateRecipientEmailAction(trimmed)
      setIsValidatingEmail(false)
      if (res.success && res.userId && res.userName) {
        setRecipientId(res.userId)
        setRecipientName(res.userName)
        toast({ title: 'Recipient Verified', description: `${res.userName} found.` })
      } else {
        setRecipientId('')
        setRecipientName('')
        setEmailError(res.message || 'Recipient not found')
      }
    }, 600)

    return () => clearTimeout(timer)
  }, [email])

  // Calculation parameters
  const enteredAmount = Number(amount) || 0
  const calculatedDeduction = (enteredAmount * deductionPercent) / 100
  const finalTransferAmount = Math.max(0, enteredAmount - calculatedDeduction)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!recipientId) {
      toast({ title: 'Error', description: 'Please enter a valid recipient email.', variant: 'destructive' })
      return
    }
    if (enteredAmount <= 0) {
      toast({ title: 'Error', description: 'Please enter an amount greater than 0.', variant: 'destructive' })
      return
    }
    if (enteredAmount > walletBalance) {
      toast({ title: 'Error', description: 'Insufficient Main Wallet Balance.', variant: 'destructive' })
      return
    }

    startTransition(async () => {
      const res = await submitUserPayRequestAction({
        recipientEmail: email,
        amount: enteredAmount
      })

      if (res.success) {
        toast({ title: 'Success', description: res.message })
        setEmail('')
        setAmount('')
        // Refresh local request history
        const updated = await fetch('/api/user-pay').then(res => res.json()).catch(() => null)
        if (updated && Array.isArray(updated)) {
          setRequests(updated)
        } else {
          // Fallback: reload page to update state
          window.location.reload()
        }
      } else {
        toast({ title: 'Error', description: res.message, variant: 'destructive' })
      }
    })
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Card: Transfer Form */}
        <div className="lg:col-span-7 premium-card p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-primary" /> Transfer Funds
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Recipient Email */}
            <div className="space-y-2">
              <Label htmlFor="recipientEmail">Recipient Email</Label>
              <div className="relative">
                <Input
                  id="recipientEmail"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isPending}
                  className="pr-10"
                />
                <div className="absolute right-3 top-2.5 flex items-center">
                  {isValidatingEmail && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                  )}
                  {!isValidatingEmail && recipientId && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                  {!isValidatingEmail && emailError && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
              {recipientName && (
                <p className="text-xs text-green-400 font-medium">Recipient Name: {recipientName}</p>
              )}
              {emailError && (
                <p className="text-xs text-red-400 font-medium">{emailError}</p>
              )}
            </div>

            {/* Recipient User ID (Auto-filled) */}
            <div className="space-y-2">
              <Label htmlFor="recipientId">Recipient User ID</Label>
              <Input
                id="recipientId"
                type="text"
                placeholder="Auto-filled after email validation"
                value={recipientId}
                disabled
                className="bg-muted/40 font-mono text-xs select-all text-white/70 border-dashed"
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="amount">Amount (₹)</Label>
                <button
                  type="button"
                  onClick={() => setAmount(String(walletBalance))}
                  className="text-xs text-primary hover:text-primary-foreground font-semibold"
                >
                  Use Max
                </button>
              </div>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isPending}
                  className="pr-8"
                />
                <span className="absolute right-3 top-2 text-sm text-muted-foreground font-semibold">₹</span>
              </div>
              {enteredAmount > walletBalance && (
                <p className="text-xs text-red-400 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Amount exceeds available Main Wallet balance
                </p>
              )}
            </div>

            {/* Dynamic Transfer Details Breakdown */}
            <div className="p-4 rounded-xl bg-background/60 border border-muted/50 space-y-2.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Entered Amount</span>
                <span className="font-semibold text-white">{formatCurrency(enteredAmount)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Deduction Percentage</span>
                <span className="font-semibold text-amber-500">{deductionPercent}%</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Deduction Amount</span>
                <span className="font-semibold text-red-400">{formatCurrency(calculatedDeduction)}</span>
              </div>
              <div className="h-px bg-muted/60 my-1" />
              <div className="flex justify-between font-bold text-white">
                <span>Final Transfer Amount</span>
                <span className="text-green-400">{formatCurrency(finalTransferAmount)}</span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending || !recipientId || enteredAmount <= 0 || enteredAmount > walletBalance}
              className="w-full h-11 transition-all"
            >
              {isPending ? 'Submitting Transfer Request...' : 'Send'}
            </Button>
          </form>
        </div>

        {/* Right Card: Wallet Information */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="premium-card p-6 bg-gradient-to-br from-brand-900 via-brand-850 to-indigo-950 border-0 shadow-2xl relative overflow-hidden flex-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-2 text-white/70 text-xs font-semibold uppercase tracking-wider mb-2">
              <Wallet className="w-4 h-4 text-blue-400" /> Available Main Wallet Balance
            </div>
            <p className="text-3xl font-black text-white">{formatCurrency(walletBalance)}</p>
            <p className="text-xs text-white/50 mt-2 leading-relaxed">
              Only Main Wallet balance is eligible for user transfers. Deposit balances cannot be directly sent.
            </p>
          </div>

          <div className="premium-card p-6 space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" /> Transfer Rules
            </h3>
            <ul className="text-xs text-muted-foreground space-y-2.5 leading-normal">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>Peer-to-peer transfers are not immediate. Admin approval is required for all request releases.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>The sender must possess sufficient Main Wallet balance at both request creation and approval time.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>A platform deduction percentage is automatically computed from the entered amount, yielding a final transfer net value.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Requests History Log */}
      <div className="premium-card p-6">
        <h2 className="text-lg font-bold text-white mb-4">Transfer Requests History</h2>
        
        {requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm">No transfer requests logged yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs uppercase font-semibold">
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Party Details</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Deduction</th>
                  <th className="py-3 px-4">Final Net</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted/30">
                {requests.map((req) => {
                  const isSender = req.senderId === userId
                  return (
                    <tr key={req.id} className="hover:bg-muted/10 transition-colors">
                      <td className="py-3.5 px-4 font-medium">
                        {isSender ? (
                          <span className="text-red-400 flex items-center gap-1">
                            <ArrowUpRight className="w-3.5 h-3.5" /> Sent
                          </span>
                        ) : (
                          <span className="text-green-400 flex items-center gap-1">
                            <ArrowDownLeft className="w-3.5 h-3.5" /> Received
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {isSender ? (
                          <div>
                            <p className="text-white/95 font-medium">{req.receiver.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {req.receiverId}</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-white/95 font-medium">{req.sender.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {req.senderId}</p>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {formatCurrency(req.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground">
                        {formatCurrency(req.deductionAmount)} ({req.deductionPercent}%)
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-green-400">
                        {formatCurrency(req.finalAmount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`status-badge ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground">
                        {formatDate(req.createdAt)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
