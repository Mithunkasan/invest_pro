'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Wallet, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'

export function Navbar() {
  const t = useTranslations('nav')
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: t('home'), href: '/' },
    { name: t('plans'), href: '/membership-plans' },
    { name: t('about'), href: '/about' },
    { name: t('faq'), href: '/faq' },
    { name: t('contact'), href: '/contact' },
  ]

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-background/80 backdrop-blur-lg border-b border-border py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="section-container !py-0 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-12 h-12 flex items-center justify-center overflow-hidden group-hover:scale-115 transition-transform duration-300">
            <img src="/logo3.png" className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(59,130,246,0.3)]" alt="VR Galaxy Logo" />
          </div>
          <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent">VR Galaxy</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-sm font-semibold text-white/80 hover:text-white transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="font-semibold text-white/80 hover:text-white hover:bg-white/5">{t('login')}</Button>
          </Link>
          <Link href="/register">
            <Button className="rounded-full font-extrabold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.45)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] border border-white/10 px-6 gap-1 cursor-pointer">
              {t('register')} <ChevronRight size={16} className="ml-0.5 shrink-0" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden items-center gap-3">
          <button 
            className="p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="block text-lg font-bold text-white/90 hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 flex flex-col gap-3">
                <Link href="/login" className="w-full">
                  <Button variant="outline" className="w-full py-6 text-lg">{t('login')}</Button>
                </Link>
                <Link href="/register" className="w-full">
                  <Button className="w-full rounded-full font-extrabold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.45)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] border border-white/10 py-6 text-base cursor-pointer">
                    {t('register')}
                  </Button>
                </Link>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
