'use client'

import { useState } from 'react'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { DashboardNavbar } from '@/components/dashboard/DashboardNavbar'

interface DashboardLayoutClientProps {
  children: React.ReactNode
  user: { name: string; email: string }
  notificationCount: number
}

export function DashboardLayoutClient({ children, user, notificationCount }: DashboardLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
          notificationCount={notificationCount}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
