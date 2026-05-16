'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AdminActionButtonsProps {
  id: string
  approveAction: (id: string) => Promise<void>
  rejectAction: (id: string) => Promise<void>
  confirmMessage?: string
}

export function AdminActionButtons({ id, approveAction, rejectAction, confirmMessage }: AdminActionButtonsProps) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)

  const handleApprove = async () => {
    setLoading('approve')
    await approveAction(id)
    setLoading(null)
  }

  const handleReject = async () => {
    if (!confirm(confirmMessage || 'Are you sure you want to reject this?')) return
    setLoading('reject')
    await rejectAction(id)
    setLoading(null)
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        size="sm"
        className="h-7 px-2.5 bg-green-500 hover:bg-green-600 text-white"
        onClick={handleApprove}
        loading={loading === 'approve'}
        disabled={!!loading}
      >
        <Check className="w-3 h-3" />
        Approve
      </Button>
      <Button
        size="sm"
        variant="destructive"
        className="h-7 px-2.5"
        onClick={handleReject}
        loading={loading === 'reject'}
        disabled={!!loading}
      >
        <X className="w-3 h-3" />
        Reject
      </Button>
    </div>
  )
}
