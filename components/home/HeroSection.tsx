'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { ChevronRight, Play, ShieldCheck, Zap, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
  const t = useTranslations('hero')

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold-500/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-blue-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="section-container grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Invest with Confidence
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] mb-6 tracking-tight">
            {t('title')}{' '}
            <span className="text-primary clip-gradient bg-gradient-to-r from-primary to-blue-400">
              {t('titleHighlight')}
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed">
            {t('subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/register">
              <Button size="lg" className="h-14 px-8 text-lg font-bold shadow-xl shadow-primary/30 group w-full sm:w-auto">
                {t('cta')}
                <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/plans">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold w-full sm:w-auto">
                <Play className="mr-2 fill-current" size={16} />
                {t('ctaSecondary')}
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap gap-6 items-center text-muted-foreground grayscale opacity-60">
            <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-tighter">
              <ShieldCheck className="text-primary" /> Secure Platform
            </div>
            <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-tighter">
              <TrendingUp className="text-primary" /> High ROI
            </div>
            <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-tighter">
              <Zap className="text-primary" /> Instant Payouts
            </div>
          </div>
        </motion.div>

        {/* Hero Image/Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          className="relative hidden lg:block"
        >
          <div className="relative z-10 p-4">
            <div className="glass-card overflow-hidden border-white/20 shadow-2xl relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              {/* Dashboard Mockup Representation */}
              <div className="p-6">
                <div className="flex justify-between items-center mb-8">
                  <div className="h-3 w-32 bg-white/20 rounded-full" />
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/10" />
                    <div className="w-8 h-8 rounded-full bg-white/10" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="h-24 rounded-2xl bg-primary/20 border border-primary/30 p-4">
                    <div className="h-2 w-12 bg-primary/40 rounded-full mb-3" />
                    <div className="h-4 w-20 bg-primary/60 rounded-full" />
                  </div>
                  <div className="h-24 rounded-2xl bg-white/5 border border-white/10 p-4">
                    <div className="h-2 w-12 bg-white/20 rounded-full mb-3" />
                    <div className="h-4 w-20 bg-white/40 rounded-full" />
                  </div>
                </div>
                <div className="h-40 rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col justify-end">
                  <div className="flex items-end gap-1 h-20">
                    {[30, 50, 40, 60, 80, 55, 70, 90, 85].map((h, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-primary/40 rounded-t-sm" 
                        style={{ height: `${h}%` }} 
                      />
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between">
                    <div className="h-2 w-10 bg-white/20 rounded-full" />
                    <div className="h-2 w-10 bg-white/20 rounded-full" />
                    <div className="h-2 w-10 bg-white/20 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/4 -right-8 premium-card p-4 flex items-center gap-3 bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl"
            >
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Growth</p>
                <p className="text-sm font-black">+245.8%</p>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute bottom-1/4 -left-8 premium-card p-4 flex items-center gap-3 bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl"
            >
              <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-500">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Security</p>
                <p className="text-sm font-black">Verified</p>
              </div>
            </motion.div>
          </div>

          {/* Decorative Ring */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-primary/10 rounded-full -z-10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border border-primary/5 rounded-full -z-10" />
        </motion.div>
      </div>
    </section>
  )
}
