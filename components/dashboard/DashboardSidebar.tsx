'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Wallet, ArrowDownToLine, ArrowUpFromLine,
  History, Users, Bell, ShieldCheck, Settings, X, ChevronRight, Crown, Gift, ClipboardList, Gamepad2, MessageSquare,
  Send
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SubItem {
  href: string
  label: string
}

interface NavItem {
  href?: string
  label: string
  icon: any
  subItems?: SubItem[]
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard', label: 'Game Section', icon: Gamepad2 },
  { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
  { href: '/dashboard/membership', label: 'Membership', icon: Crown },
  { href: '/dashboard/tasks', label: 'Tasks', icon: ClipboardList },
  { href: '/dashboard/deposit', label: 'Deposit', icon: ArrowDownToLine },
  { href: '/dashboard/withdraw', label: 'Withdraw', icon: ArrowUpFromLine },
  { href: '/dashboard/user-pay', label: 'User Pay', icon: Send },
  { href: '/dashboard/transactions', label: 'Transactions', icon: History },
  { href: '/dashboard/referral', label: 'Referral', icon: Users },
  { href: '/dashboard/tickets', label: 'Support Tickets', icon: MessageSquare },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/kyc', label: 'KYC', icon: ShieldCheck },
  { href: '/dashboard/profile', label: 'Profile', icon: Settings },
]

interface DashboardSidebarProps {
  mobileOpen: boolean
  onClose: () => void
  isKycApproved: boolean
  user: { name: string; email: string; memberType?: 'FREE' | 'BASIC' | 'PREMIUM' }
}

export function DashboardSidebar({ mobileOpen, onClose, isKycApproved, user }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  // Automatically expand folders if their child routes are currently active
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.subItems && item.subItems.some((sub) => pathname === sub.href)) {
        setExpandedItems((prev) => ({ ...prev, [item.label]: true }))
      }
    })
  }, [pathname])

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [label]: !prev[label],
    }))
  }

  const SidebarContent = () => {
    // 1. Determine base nav items depending on member type
    let baseItems = [...navItems]
    const isFree = user?.memberType === 'FREE'

    if (isFree) {
      // Free users can access games, wallet, membership/KYC upgrade, tasks, and profile.
      baseItems = baseItems.filter((item) => 
        item.label !== 'Deposit' && 
        item.label !== 'Referral' &&
        item.label !== 'Overview'
      )
    } else {
      baseItems = baseItems.filter((item) => item.label !== 'Game Section')
      // Premium users see the Gift Section
      const membershipIndex = baseItems.findIndex((item) => item.label === 'Membership')
      if (membershipIndex !== -1) {
        baseItems.splice(membershipIndex + 1, 0, {
          href: '/dashboard/gift',
          label: 'Gift Section',
          icon: Gift
        })
      } else {
        baseItems.push({
          href: '/dashboard/gift',
          label: 'Gift Section',
          icon: Gift
        })
      }
    }

    // 2. Filter out non-KYC / non-Profile if KYC is not approved and user is not FREE
    const filteredItems = isKycApproved
      ? baseItems
      : baseItems.filter((item) => item.label === 'KYC' || item.label === 'Profile')

    return (
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-sidebar-border">
          <div className="w-11 h-11 flex items-center justify-center overflow-hidden">
            <img src="/logo.png" className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(59,130,246,0.3)]" alt="VR Galaxy Logo" />
          </div>
          <span className="font-black tracking-wider text-xl bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">VR Galaxy</span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
          {filteredItems.map((item) => {
          const Icon = item.icon

          // Render collapsible section
          if (item.subItems) {
            const isExpanded = !!expandedItems[item.label]
            const hasActiveChild = item.subItems.some((sub) => pathname === sub.href)

            return (
              <div key={item.label} className="space-y-0.5">
                <button
                  onClick={() => toggleExpand(item.label)}
                  className={cn(
                    'sidebar-link w-full text-left justify-between cursor-pointer focus:outline-none',
                    (isExpanded || hasActiveChild) && 'text-sidebar-foreground bg-sidebar-accent/50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0 text-amber-400 filter drop-shadow-[0_0_4px_rgba(245,158,11,0.3)]" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight
                    className={cn(
                      'ml-auto w-3 h-3 text-sidebar-foreground/50 transition-transform duration-200',
                      isExpanded && 'rotate-90 text-primary'
                    )}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden pl-7 space-y-0.5"
                    >
                      {item.subItems.map((sub) => {
                        const isSubActive = pathname === sub.href
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={onClose}
                            className={cn(
                              'flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60',
                              isSubActive && 'text-primary bg-primary/10 font-bold'
                            )}
                          >
                            <span
                              className={cn(
                                'w-1.5 h-1.5 rounded-full bg-sidebar-foreground/20 transition-colors',
                                isSubActive && 'bg-primary scale-125 shadow-[0_0_6px_rgba(59,130,246,0.5)]'
                              )}
                            />
                            <span>{sub.label}</span>
                          </Link>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          }

          // Render standard link
          const href = item.href || '/dashboard'
          const isActive = href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'sidebar-link',
                isActive && 'active text-primary bg-primary/10 font-semibold'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
              {isActive && <ChevronRight className="ml-auto w-3 h-3 text-primary" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2 text-xs text-sidebar-foreground/40">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>VR Galaxy v1.0.0</span>
        </div>
      </div>
    </div>
  )
}

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-sidebar h-screen sticky top-0 border-r border-sidebar-border">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/75"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-sidebar border-r border-sidebar-border"
            >
              <div className="absolute top-4 right-4">
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
