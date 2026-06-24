'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/membership-plans', label: 'Membership Plans' },
  { href: '/contact', label: 'Contact' },
  { href: '/faq', label: 'FAQ' },
]

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/95 backdrop-blur-xl border-b border-border shadow-sm'
          : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-black text-2xl group">
            <div className="w-11 h-11 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-115">
              <Image src="/logo3.png" width={44} height={44} className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(59,130,246,0.3)]" alt="VR Galaxy Networks logo" priority />
            </div>
            <span className="bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent font-black tracking-wider">
              VR Galaxy Networks
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-semibold transition-colors',
                  pathname === link.href
                    ? 'text-white bg-white/10'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/5">Login</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="rounded-full font-extrabold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 transition-all duration-300 shadow-[0_0_18px_rgba(168,85,247,0.45)] hover:shadow-[0_0_28px_rgba(59,130,246,0.6)] border border-white/10 px-5 cursor-pointer">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl hover:bg-accent transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-background/98 backdrop-blur-xl border-b border-border"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'block px-4 py-3 rounded-xl text-sm font-bold transition-colors',
                    pathname === link.href
                      ? 'text-white bg-white/10'
                      : 'text-white/80 hover:text-white hover:bg-white/5'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full rounded-full font-extrabold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 transition-all duration-300 shadow-[0_0_18px_rgba(168,85,247,0.45)] hover:shadow-[0_0_28px_rgba(59,130,246,0.6)] border border-white/10 py-3.5 cursor-pointer">Get Started</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
