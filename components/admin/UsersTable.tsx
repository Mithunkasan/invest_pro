'use client'

import { useTransition } from 'react'
import { DataTable } from '@/components/dashboard/DataTable'
import { formatDate, formatCurrency, getStatusColor } from '@/utils/formatters'
import { Button } from '@/components/ui/button'
import { toggleUserStatus, toggleUserRankAction } from '@/actions/admin'
import { toast } from '@/hooks/use-toast'

interface UsersTableProps {
  users: any[]
}

export function UsersTable({ users }: UsersTableProps) {
  const [isPending, startTransition] = useTransition()

  const handleToggleStatus = (userId: string) => {
    startTransition(async () => {
      const res = await toggleUserStatus(userId)
      if (res.success) {
        toast({ title: 'Success', description: res.message })
      } else {
        toast({ title: 'Error', description: res.message, variant: 'destructive' })
      }
    })
  }

  const handleToggleRank = (userId: string, rankType: 'starPerformer' | 'tlRank', currentValue: boolean) => {
    startTransition(async () => {
      const res = await toggleUserRankAction(userId, rankType, !currentValue)
      if (res.success) {
        toast({ title: 'Success', description: res.message })
      } else {
        toast({ title: 'Error', description: res.message, variant: 'destructive' })
      }
    })
  }

  const cols = [
    { key: 'name', label: 'Name', sortable: true, render: (v: unknown, row: any) => (
      <div>
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium">{String(v)}</p>
          {row.starPerformer && (
            <span className="text-[10px] bg-amber-500/20 text-amber-500 font-bold px-1 rounded border border-amber-500/20" title="Star Performer">⭐</span>
          )}
          {row.tlRank && (
            <span className="text-[10px] bg-purple-500/20 text-purple-500 font-bold px-1 rounded border border-purple-500/20" title="TL Rank">🏆</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{String(row.email)}</p>
      </div>
    )},
    { key: 'phone', label: 'Phone', render: (v: unknown) => <span className="text-xs font-mono">{String(v || '—')}</span> },
    { key: 'wallet', label: 'Balance', render: (v: unknown) => {
      const w = v as { mainBalance: number } | null
      return <span className="font-semibold text-sm">{formatCurrency(w?.mainBalance || 0)}</span>
    }},
    { key: '_count', label: 'Investments', render: (v: unknown) => {
      const c = v as { investments: number }
      return <span className="text-sm">{c.investments}</span>
    }},
    { key: 'status', label: 'Status', sortable: true, render: (v: unknown) => <span className={`status-badge ${getStatusColor(String(v))}`}>{String(v)}</span> },
    { key: 'createdAt', label: 'Joined', sortable: true, render: (v: unknown) => <span className="text-xs text-muted-foreground">{formatDate(String(v))}</span> },
    { key: 'id', label: 'Actions', render: (id: string, row: any) => (
      <div className="flex flex-wrap gap-1">
        <Button 
          size="sm" 
          variant="outline" 
          className={`h-7 px-1.5 text-[10px] ${row.starPerformer ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : ''}`}
          onClick={() => handleToggleRank(id, 'starPerformer', !!row.starPerformer)}
          disabled={isPending}
        >
          {row.starPerformer ? '- Star' : '+ Star'}
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className={`h-7 px-1.5 text-[10px] ${row.tlRank ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : ''}`}
          onClick={() => handleToggleRank(id, 'tlRank', !!row.tlRank)}
          disabled={isPending}
        >
          {row.tlRank ? '- TL' : '+ TL'}
        </Button>
        <Button 
          size="sm" 
          variant={row.status === 'ACTIVE' ? 'destructive' : 'default'} 
          className="h-7 px-1.5 text-[10px]"
          onClick={() => handleToggleStatus(id)}
          disabled={isPending}
        >
          {row.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
        </Button>
      </div>
    )},
  ]

  return (
    <DataTable 
      data={users} 
      columns={cols as any} 
      rowKey="id" 
      searchPlaceholder="Search users..." 
      emptyMessage="No users found" 
    />
  )
}
