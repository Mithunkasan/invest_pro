'use client'

import { useTransition, useState, useMemo } from 'react'
import { DataTable } from '@/components/dashboard/DataTable'
import { formatDate, formatCurrency } from '@/utils/formatters'
import { Button } from '@/components/ui/button'
import { processMembershipUpgradeAction } from '@/actions/admin'
import { toast } from '@/hooks/use-toast'
import { Search, X, Check, Ban, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ModalPortal } from '@/components/common/ModalPortal'

interface UpgradeRequestsTableProps {
  requests: any[]
}

export function UpgradeRequestsTable({ requests }: UpgradeRequestsTableProps) {
  const [isPending, startTransition] = useTransition()
  const [filterQuery, setFilterQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [rejectionRequestId, setRejectionRequestId] = useState<string | null>(null)
  const [remarks, setRemarks] = useState('')
  const router = useRouter()

  const handleProcessRequest = (requestId: string, action: 'APPROVED' | 'REJECTED', note?: string) => {
    startTransition(async () => {
      try {
        const res = await processMembershipUpgradeAction(requestId, action, note)
        if (res.success) {
          toast({
            title: `Request ${action === 'APPROVED' ? 'Approved' : 'Rejected'}`,
            description: res.message,
          })
          setRejectionRequestId(null)
          setRemarks('')
          router.refresh()
        } else {
          toast({
            title: 'Action Failed',
            description: res.message,
            variant: 'destructive',
          })
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'An unexpected error occurred.',
          variant: 'destructive',
        })
      }
    })
  }

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (filterStatus !== 'ALL' && req.status !== filterStatus) return false
      
      if (filterQuery) {
        const q = filterQuery.toLowerCase()
        const userMatch = req.user?.name?.toLowerCase().includes(q) || req.user?.email?.toLowerCase().includes(q)
        const planMatch = req.plan?.name?.toLowerCase().includes(q)
        if (!userMatch && !planMatch) return false
      }
      return true
    })
  }, [requests, filterQuery, filterStatus])

  const cols = [
    {
      key: 'user',
      label: 'User Info',
      render: (v: any) => (
        <div>
          <p className="text-sm font-semibold text-white/90">{v?.name || 'Unknown User'}</p>
          <p className="text-xs text-muted-foreground">{v?.email || ''}</p>
        </div>
      ),
    },
    {
      key: 'plan',
      label: 'Requested Plan',
      render: (v: any) => (
        <div>
          <p className="text-xs font-black text-amber-400">{v?.name || 'N/A'}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Price: {formatCurrency(v?.price || 0)}</p>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date Requested',
      sortable: true,
      render: (v: any) => <span className="text-xs text-muted-foreground">{formatDate(String(v))}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (v: any, row: any) => {
        const status = String(v)
        let colors = 'bg-slate-500/10 text-slate-400 border-slate-500/20'
        if (status === 'APPROVED') colors = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        if (status === 'REJECTED') colors = 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        if (status === 'PENDING') colors = 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse'
        
        return (
          <div className="space-y-1">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${colors}`}>
              {status}
            </span>
            {row.remarks && (
              <p className="text-[10px] text-rose-300 max-w-[150px] truncate" title={row.remarks}>
                Note: {row.remarks}
              </p>
            )}
          </div>
        )
      },
    },
    {
      key: 'id',
      label: 'Actions',
      render: (id: string, row: any) => {
        if (row.status !== 'PENDING') {
          return (
            <span className="text-[11px] text-muted-foreground italic">Processed</span>
          )
        }
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => handleProcessRequest(id, 'APPROVED')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] h-7 px-2.5 rounded-lg flex items-center gap-1 shadow-md"
            >
              <Check className="w-3.5 h-3.5" />
              Approve
            </Button>
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => setRejectionRequestId(id)}
              className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] h-7 px-2.5 rounded-lg flex items-center gap-1 shadow-md"
            >
              <Ban className="w-3.5 h-3.5" />
              Reject
            </Button>
          </div>
        )
      },
    },
  ]

  const hasActiveFilters = filterQuery || filterStatus !== 'ALL'

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-brand-900/20 border border-brand-800/40 backdrop-blur-sm">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search request by user name, email, or plan name..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-3 rounded-lg bg-background border border-brand-800 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 h-10 px-3 rounded-lg bg-background border border-brand-800 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={() => {
                setFilterQuery('')
                setFilterStatus('ALL')
              }}
              className="h-10 px-3 font-semibold shrink-0"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      <DataTable
        data={filteredRequests}
        columns={cols as any}
        rowKey="id"
        searchable={false}
        emptyMessage="No membership upgrade requests found matching criteria"
      />

      {/* Rejection Remarks Modal */}
      <AnimatePresence>
        {rejectionRequestId && (
          <ModalPortal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80"
              onClick={() => setRejectionRequestId(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-brand-950 border border-brand-800 rounded-2xl p-6 shadow-2xl relative text-left"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start border-b border-brand-800 pb-3">
                  <h3 className="text-base font-black text-white flex items-center gap-1.5">
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                    Reject Membership Upgrade
                  </h3>
                  <button
                    onClick={() => setRejectionRequestId(null)}
                    className="rounded-lg p-1 text-muted-foreground hover:bg-brand-900 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-4 space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Please provide rejection remarks. This will be sent as a notification to the user, and the on-hold wallet balance will be refunded.
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-brand-200 mb-1.5">Rejection Remarks</label>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      rows={3}
                      placeholder="e.g. Insufficient wallet source, plan upgrade window closed, etc."
                      className="w-full p-2.5 rounded-lg bg-background border border-brand-850 text-xs text-white placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2 border-t border-brand-800 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setRejectionRequestId(null)}
                    disabled={isPending}
                    className="h-8.5 px-3.5 text-xs font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={isPending}
                    onClick={() => handleProcessRequest(rejectionRequestId, 'REJECTED', remarks)}
                    className="h-8.5 px-4 text-xs font-black bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md"
                  >
                    {isPending ? 'Rejecting...' : 'Reject Request'}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </ModalPortal>
        )}
      </AnimatePresence>
    </div>
  )
}
