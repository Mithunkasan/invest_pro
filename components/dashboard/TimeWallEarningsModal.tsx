'use client'

import { X } from 'lucide-react'
import { ModalPortal } from '@/components/common/ModalPortal'
import { formatCurrency, formatDateTime } from '@/utils/formatters'

export interface TimeWallEarningRow {
  id: string
  name: string
  points: string | null
  amount: number
  payout: string | null
  type: string
  ip: string | null
  country: string | null
  createdAt: string
}

interface TimeWallEarningsModalProps {
  rows: TimeWallEarningRow[]
  total: number
  onClose: () => void
}

function emptyValue(value: string | null) {
  return value && value.trim() ? value : '-'
}

export function TimeWallEarningsModal({ rows, total, onClose }: TimeWallEarningsModalProps) {
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
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
            <div>
              <h3 className="text-sm font-bold text-white sm:text-base">TimeWall Earnings</h3>
              <p className="text-xs text-muted-foreground">Total accumulated: {formatCurrency(total)}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close TimeWall earnings"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[72vh] overflow-auto">
            <table className="w-full min-w-[920px] border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-[#151618]">
                <tr className="border-b border-white/10 text-sm font-bold text-muted-foreground">
                  <th className="px-4 py-4">Name</th>
                  <th className="px-4 py-4">Points</th>
                  <th className="px-4 py-4">Amount</th>
                  <th className="px-4 py-4">Payout</th>
                  <th className="px-4 py-4">Type</th>
                  <th className="px-4 py-4">Ip</th>
                  <th className="px-4 py-4">Country</th>
                  <th className="px-4 py-4">Created at</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {rows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={8}>
                      No TimeWall earnings found.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="text-white/80 transition-colors hover:bg-white/[0.03]">
                      <td className="px-4 py-3 font-medium text-white">{row.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{emptyValue(row.points)}</td>
                      <td className="px-4 py-3 font-bold text-lime-400">{formatCurrency(row.amount)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{emptyValue(row.payout)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.type.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-muted-foreground">{emptyValue(row.ip)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{emptyValue(row.country)}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDateTime(row.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ModalPortal>
  )
}
