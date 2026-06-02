'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { DashboardNavbar } from '@/components/dashboard/DashboardNavbar'
import { MoneyBackground } from '@/components/dashboard/MoneyBackground'

interface DashboardLayoutClientProps {
  children: React.ReactNode
  user: { name: string; email: string; memberType?: 'FREE' | 'PREMIUM' }
  notificationCount: number
  isKycApproved: boolean
}

export function DashboardLayoutClient({ 
  children, 
  user, 
  notificationCount,
  isKycApproved 
}: DashboardLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Enforce KYC requirement check:
  // If the user's KYC is NOT approved, redirect them to the KYC page if they attempt to
  // navigate to any other dashboard route (excluding KYC and Profile).
  useEffect(() => {
    if (!isKycApproved) {
      const allowedRoutes = ['/dashboard/kyc', '/dashboard/profile']
      const isAllowed = allowedRoutes.some(route => pathname === route || pathname.startsWith(route))
      
      if (!isAllowed) {
        router.push('/dashboard/kyc')
      }
    }
  }, [isKycApproved, pathname, router])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isKycApproved={isKycApproved}
        user={user}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
          notificationCount={notificationCount}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <MoneyBackground />
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
