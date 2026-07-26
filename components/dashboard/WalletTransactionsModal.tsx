'use client'

import { X } from 'lucide-react'
import { ModalPortal } from '@/components/common/ModalPortal'
import { formatCurrency, formatDate, getStatusColor } from '@/utils/formatters'

interface Transaction {
  id: string
  type: string
  amount: number
  status: string
  description: string | null
  createdAt: string
  walletType: string
  reference?: string | null
}

interface WalletTransactionsModalProps {
  isOpen: boolean
  onClose: () => void
  walletName: string
  transactions: Transaction[]
  balance: number
}

export function WalletTransactionsModal({
  isOpen,
  onClose,
  walletName,
  transactions,
  balance,
}: WalletTransactionsModalProps) {
  if (!isOpen) return null

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      >
        <div
          className="w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-[#101113]/95 shadow-2xl animate-in fade-in zoom-in-95"
          onClick={(event) => event.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
            <div>
              <h3 className="text-sm font-bold text-white sm:text-base">{walletName} Transaction History</h3>
              <p className="text-xs text-muted-foreground">Current Balance: {formatCurrency(balance)}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-white"
              aria-label={`Close ${walletName} history`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Table Container */}
          <div className="max-h-[72vh] overflow-auto">
            <table className="w-full min-w-[800px] border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-[#151618]">
                <tr className="border-b border-white/10 text-sm font-bold text-muted-foreground">
                  <th className="px-4 py-4">Type</th>
                  <th className="px-4 py-4">Description</th>
                  <th className="px-4 py-4">Amount</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {transactions.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={5}>
                      No transactions found for this wallet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((row) => {
                    let label = String(row.type).replace(/_/g, ' ')
                    if (row.type === 'INVESTMENT') label = 'SMART HYBRID DIGITAL EARNING'
                    if (row.type === 'USER_PAY_SENT') label = 'MONEY SENT'
                    if (row.type === 'USER_PAY_RECEIVED') label = 'MONEY RECEIVED'
                    
                    const isDebit = row.type === 'WITHDRAWAL' || row.type === 'INVESTMENT' || row.type === 'USER_PAY_SENT'
                    
                    let desc = String(row.description || '—')
                      .replace(/\bROI\b/gi, 'Earning Platform')
                      .replace(/\bInvestment\b/gi, 'Earning Platform')

                    if (row.reference?.startsWith('TIMEWALL:')) {
                      desc = `TimeWall Reward: ₹${Number(row.amount).toFixed(2)}`
                    }

                    return (
                      <tr key={row.id} className="text-white/80 transition-colors hover:bg-white/[0.03]">
                        <td className="px-4 py-3 font-medium text-white capitalize text-xs">
                          {label.toLowerCase()}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {desc}
                        </td>
                        <td className={`px-4 py-3 font-semibold text-sm ${isDebit ? 'text-red-500' : 'text-green-500'}`}>
                          {isDebit ? '-' : '+'}{formatCurrency(row.amount)}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <span className={`status-badge ${getStatusColor(row.status)}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(row.createdAt)}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ModalPortal>
  )
}
