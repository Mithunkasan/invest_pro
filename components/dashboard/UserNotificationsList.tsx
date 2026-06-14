'use client'

import { useState, useMemo } from 'react'
import { Bell, Calendar, X } from 'lucide-react'
import { formatRelativeTime } from '@/utils/formatters'
import { Button } from '@/components/ui/button'

interface UserNotificationsListProps {
  notifications: any[]
}

export function UserNotificationsList({ notifications }: UserNotificationsListProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      const created = new Date(n.createdAt)
      
      if (startDate) {
        const filterStart = new Date(startDate + 'T00:00:00')
        if (created < filterStart) return false
      }
      
      if (endDate) {
        const filterEnd = new Date(endDate + 'T23:59:59.999')
        if (created > filterEnd) return false
      }
      
      return true
    })
  }, [notifications, startDate, endDate])

  const typeColors: Record<string, string> = {
    SUCCESS: 'border-l-green-500 bg-green-500/5',
    ERROR: 'border-l-red-500 bg-red-500/5',
    WARNING: 'border-l-yellow-500 bg-yellow-500/5',
    INFO: 'border-l-blue-500 bg-blue-500/5',
  }
  const typeIcons: Record<string, string> = { SUCCESS: '✅', ERROR: '❌', WARNING: '⚠️', INFO: 'ℹ️' }

  const hasActiveFilters = startDate || endDate

  const handleClearFilters = () => {
    setStartDate('')
    setEndDate('')
  }

  return (
    <div className="space-y-4">
      {/* Date Filter Bar */}
      <div className="flex flex-wrap items-end gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 backdrop-blur-sm">
        <div className="space-y-1.5 flex-1 min-w-[200px]">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full h-10 px-3 rounded-lg bg-background/50 border border-border/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
          />
        </div>

        <div className="space-y-1.5 flex-1 min-w-[200px]">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full h-10 px-3 rounded-lg bg-background/50 border border-border/60 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={handleClearFilters}
            className="h-10 px-3 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 font-bold border border-rose-500/20"
          >
            <X className="w-4 h-4 mr-1.5" /> Reset Filters
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="premium-card p-12 text-center">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {hasActiveFilters ? 'No notifications match the selected dates' : 'No notifications yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n: any) => (
            <div
              key={n.id}
              className={`premium-card p-4 border-l-4 transition-all ${typeColors[n.type] || typeColors.INFO}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg shrink-0">{typeIcons[n.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{n.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{formatRelativeTime(n.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
