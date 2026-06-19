'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { DashboardNavbar } from '@/components/dashboard/DashboardNavbar'
import { MoneyBackground } from '@/components/dashboard/MoneyBackground'
import { Button } from '@/components/ui/button'

interface DashboardLayoutClientProps {
  children: React.ReactNode
  user: {
    name: string
    email: string
    memberType?: 'FREE' | 'BASIC' | 'PREMIUM'
    profilePictureUrl?: string | null
    hasSeenProfilePicturePopup?: boolean
    profileCompleted?: boolean
    isMembershipExpired?: boolean
  }
  notificationCount: number
  isKycApproved: boolean
  hasApprovedDeposit: boolean
  isMembershipActivated: boolean
}

export function DashboardLayoutClient({
  children,
  user,
  notificationCount,
  isKycApproved,
  hasApprovedDeposit,
  isMembershipActivated,
}: DashboardLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const showProfilePopup = !user.profileCompleted && !pathname.startsWith('/dashboard/profile')

  useEffect(() => {
    if (user.isMembershipExpired) {
      const allowedRoutes = ['/dashboard/membership', '/dashboard/withdraw']
      const isAllowed = allowedRoutes.some((route) => pathname === route || pathname.startsWith(route))

      if (!isAllowed) {
        router.push('/dashboard/membership')
      }
      return
    }

    if (!user.profileCompleted) {
      const allowedRoutes = ['/dashboard', '/dashboard/profile']
      const isAllowed = allowedRoutes.some((route) => {
        if (route === '/dashboard') return pathname === '/dashboard'
        return pathname === route || pathname.startsWith(route)
      })

      if (!isAllowed) {
        router.push('/dashboard')
      }
      return
    }

    const adminApproved = hasApprovedDeposit && isMembershipActivated

    if (!adminApproved) {
      const isFree = user.memberType === 'FREE'
      const allowedRoutes = isFree
        ? (hasApprovedDeposit
            ? ['/dashboard', '/dashboard/profile', '/dashboard/deposit', '/dashboard/membership']
            : ['/dashboard', '/dashboard/profile', '/dashboard/deposit'])
        : ['/dashboard', '/dashboard/deposit', '/dashboard/gift', '/dashboard/membership', '/dashboard/withdraw', '/dashboard/profile']

      const isAllowed = allowedRoutes.some((route) => {
        if (route === '/dashboard') return pathname === '/dashboard'
        return pathname === route || pathname.startsWith(route)
      })

      if (!isAllowed) {
        router.push('/dashboard')
      }
      return
    }

    if (!isKycApproved) {
      const allowedRoutes = ['/dashboard/kyc', '/dashboard/profile']
      const isAllowed = allowedRoutes.some((route) => pathname === route || pathname.startsWith(route))

      if (!isAllowed) {
        router.push('/dashboard/kyc')
      }
      return
    }

    const isFullAccess = user.profileCompleted && (hasApprovedDeposit || user.memberType === 'BASIC') && isMembershipActivated && user.memberType !== 'FREE'

    if (!isFullAccess) {
      const isFree = user.memberType === 'FREE'

      const allowedRoutes = isFree
        ? (hasApprovedDeposit
            ? ['/dashboard', '/dashboard/kyc', '/dashboard/profile', '/dashboard/deposit', '/dashboard/membership']
            : ['/dashboard', '/dashboard/kyc', '/dashboard/profile', '/dashboard/deposit'])
        : [
            '/dashboard',
            '/dashboard/deposit',
            '/dashboard/membership',
            '/dashboard/notifications',
            '/dashboard/kyc',
            '/dashboard/profile',
          ]

      const isAllowed = allowedRoutes.some((route) => pathname === route || pathname.startsWith(route))

      if (!isAllowed) {
        router.push('/dashboard')
      }
    }
  }, [
    user.isMembershipExpired,
    isKycApproved,
    pathname,
    router,
    user.profileCompleted,
    hasApprovedDeposit,
    isMembershipActivated,
    user.memberType
  ])

  const openProfileForm = () => {
    router.push('/dashboard/profile')
  }

  useEffect(() => {
    if (showProfilePopup) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [showProfilePopup])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isKycApproved={isKycApproved}
        hasApprovedDeposit={hasApprovedDeposit}
        isMembershipActivated={isMembershipActivated}
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
          <div className="relative z-10">{children}</div>
        </main>
      </div>

      <AnimatePresence>
        {showProfilePopup && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/75 transition-opacity duration-200" />
            <div className="flex min-h-full items-center justify-center p-4 text-center cursor-pointer" onClick={openProfileForm}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="p-6 w-full max-w-md bg-card/95 border border-border rounded-2xl shadow-2xl relative overflow-hidden text-center space-y-4 z-10 cursor-default"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                <div className="mx-auto w-16 h-16 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-primary mb-2 relative">
                  <span className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
                  <AlertCircle className="w-8 h-8 relative z-10" />
                </div>

                <h3 className="text-xl font-extrabold text-white tracking-tight">Please Update Your Profile</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Complete your required profile details to continue.
                </p>

                <Button
                  onClick={openProfileForm}
                  className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/95 hover:to-blue-600/95 font-bold shadow-lg shadow-primary/20"
                >
                  Open Profile Form
                </Button>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
