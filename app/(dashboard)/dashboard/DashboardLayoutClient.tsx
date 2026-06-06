'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { DashboardNavbar } from '@/components/dashboard/DashboardNavbar'
import { MoneyBackground } from '@/components/dashboard/MoneyBackground'
import { markProfilePicturePopupAsSeenAction } from '@/actions/user'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardLayoutClientProps {
  children: React.ReactNode
  user: { 
    name: string
    email: string
    memberType?: 'FREE' | 'PREMIUM'
    profilePictureUrl?: string | null
    hasSeenProfilePicturePopup?: boolean
  }
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
  const [showPopup, setShowPopup] = useState(false)
  const [isFirstTime, setIsFirstTime] = useState(false)
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

  // Profile Picture popup trigger check:
  // Show popup if user doesn't have a profile picture url and hasn't dismissed it in this session.
  useEffect(() => {
    if (!user.profilePictureUrl) {
      const dismissed = sessionStorage.getItem('has_dismissed_profile_reminder')
      if (!dismissed) {
        setShowPopup(true)
        setIsFirstTime(!user.hasSeenProfilePicturePopup)
      }
    }
  }, [user.profilePictureUrl, user.hasSeenProfilePicturePopup])

  const handleGoToProfile = async () => {
    if (isFirstTime) {
      await markProfilePicturePopupAsSeenAction()
    }
    sessionStorage.setItem('has_dismissed_profile_reminder', 'true')
    setShowPopup(false)
    router.push('/dashboard/profile')
  }

  const handleSkip = async () => {
    if (isFirstTime) {
      await markProfilePicturePopupAsSeenAction()
    }
    sessionStorage.setItem('has_dismissed_profile_reminder', 'true')
    setShowPopup(false)
  }

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

      {/* Profile Picture Popup Modal */}
      <AnimatePresence>
        {showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="premium-card p-6 w-full max-w-md bg-card/95 border border-border shadow-2xl relative overflow-hidden text-center space-y-4"
            >
              {/* Decorative background blur */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-primary mb-2 relative">
                <span className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
                {isFirstTime ? <Camera className="w-8 h-8 relative z-10" /> : <AlertCircle className="w-8 h-8 relative z-10" />}
              </div>

              <h3 className="text-xl font-extrabold text-white tracking-tight">
                {isFirstTime ? 'Upload Profile Picture 📸' : 'Set Your Profile Picture 👤'}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isFirstTime 
                  ? "Welcome to VR Galaxy! Let's personalize your profile. Upload a profile picture so you stand out in the system." 
                  : "You haven't uploaded a profile picture yet. Set one now to personalize your dashboard settings."}
              </p>

              <div className="flex flex-col gap-2 pt-2">
                <Button 
                  onClick={handleGoToProfile} 
                  className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/95 hover:to-blue-600/95 font-bold shadow-lg shadow-primary/20"
                >
                  Go to Profile Settings
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleSkip} 
                  className="w-full text-muted-foreground hover:text-white"
                >
                  {isFirstTime ? 'Skip for now' : 'Remind me later'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
