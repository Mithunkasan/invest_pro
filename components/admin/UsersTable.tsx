'use client'

import { DataTable } from '@/components/dashboard/DataTable'
import { formatDate, formatCurrency, getStatusColor } from '@/utils/formatters'
import { Button } from '@/components/ui/button'

interface UsersTableProps {
  users: any[]
}

export function UsersTable({ users }: UsersTableProps) {
  const cols = [
    { key: 'name', label: 'Name', sortable: true, render: (v: unknown, row: any) => (
      <div>
        <p className="text-sm font-medium">{String(v)}</p>
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
    { key: 'id', label: 'Actions', render: (id: unknown, row: any) => (
      <div className="flex gap-1">
        <Button size="sm" variant="outline" className="h-7 px-2 text-xs">View</Button>
        <Button size="sm" variant={row.status === 'ACTIVE' ? 'destructive' : 'default'} className="h-7 px-2 text-xs">
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
