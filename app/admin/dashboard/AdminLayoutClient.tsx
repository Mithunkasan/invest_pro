'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, ArrowDownToLine, ArrowUpFromLine, TrendingUp, ShieldCheck,
  GitBranch, Wallet, Bell, BarChart3, Lock, Settings, X, TrendingUpIcon,
  LogOut, Menu, ChevronRight, Crown, Gift, Coins, ClipboardList, Key, MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { adminLogoutAction } from '@/actions/auth'

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/dashboard/users', label: 'User Management', icon: Users },
  { href: '/admin/dashboard/password-resets', label: 'Password Resets', icon: Key },
  { href: '/admin/dashboard/tickets', label: 'Ticket Management', icon: MessageSquare },
  { href: '/admin/dashboard/bonus', label: 'Admin Bonus', icon: Coins },
  { href: '/admin/dashboard/tasks', label: 'Offline Tasks', icon: ClipboardList },
  { href: '/admin/dashboard/deposits', label: 'Deposits', icon: ArrowDownToLine },
  { href: '/admin/dashboard/withdrawals', label: 'Withdrawals', icon: ArrowUpFromLine },
  { href: '/admin/dashboard/plans', label: 'Investment Plans', icon: TrendingUp },
  { href: '/admin/dashboard/memberships', label: 'Manage Membership', icon: Crown },
  { href: '/admin/dashboard/gifts', label: 'Gifts Management', icon: Gift },
  { href: '/admin/dashboard/kyc', label: 'KYC Management', icon: ShieldCheck },
  { href: '/admin/dashboard/settings', label: 'System Settings', icon: Settings },
  { href: '/admin/dashboard/wallet', label: 'Wallet Management', icon: Wallet },
  { href: '/admin/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/dashboard/reports', label: 'Reports & Analytics', icon: BarChart3 },
  { href: '/admin/dashboard/security', label: 'Security Logs', icon: Lock },
]

function AdminSidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-sidebar-border">
        <div className="w-11 h-11 flex items-center justify-center overflow-hidden">
          <img src="/logo.png" className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(239,68,68,0.3)]" alt="VR Galaxy Logo" />
        </div>
        <div>
          <span className="font-black tracking-wider text-base bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent block">VR Galaxy</span>
          <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-widest">Admin Portal</span>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto no-scrollbar">
        {adminNavItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/admin/dashboard' ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn('sidebar-link', isActive && 'active text-primary bg-primary/10')}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-sm">{label}</span>
              {isActive && <ChevronRight className="ml-auto w-3 h-3 text-primary" />}
            </Link>
          )
        })}
      </nav>
      <div className="px-4 py-4 border-t border-sidebar-border">
        <button onClick={() => adminLogoutAction()} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  )
}

interface AdminLayoutClientProps {
  children: React.ReactNode
  admin: { name: string; email: string }
}

export function AdminLayoutClient({ children, admin }: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const initials = admin.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-sidebar h-screen sticky top-0 border-r border-sidebar-border">
        <AdminSidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="lg:hidden fixed inset-0 z-40 bg-black/75" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-sidebar border-r border-sidebar-border">
              <div className="absolute top-4 right-4">
                <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/60"><X className="w-4 h-4" /></button>
              </div>
              <AdminSidebarContent onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Admin Top Bar */}
        <header className="h-16 border-b border-border bg-background/95 backdrop-blur-xl sticky top-0 z-30 flex items-center px-4 sm:px-6 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-accent">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <span className="text-sm text-muted-foreground">Admin Console</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-accent">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold">{initials}</div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium">{admin.name}</p>
                <p className="text-[10px] text-red-400">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  )
}
