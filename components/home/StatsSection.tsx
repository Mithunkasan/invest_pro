'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Users, Landmark, Globe, HeartPulse } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'

interface StatsSectionProps {
  stats: {
    users: number
    aum: number
    returns: string
    experience: string
  }
}

export function StatsSection({ stats: data }: StatsSectionProps) {
  const t = useTranslations('hero.stats')

  const stats = [
    { label: t('aum'), value: `₹${(data.aum / 1000000).toFixed(1)}M+`, icon: Landmark, color: 'text-primary' },
    { label: t('users'), value: `${(data.users / 1000).toFixed(1)}K+`, icon: Users, color: 'text-gold-500' },
    { label: t('returns'), value: data.returns, icon: HeartPulse, color: 'text-green-500' },
    { label: t('experience'), value: data.experience, icon: Globe, color: 'text-blue-500' },
  ]

  return (
    <section className="py-12 bg-muted/30 border-y border-border">
      <div className="section-container !py-0">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 lg:justify-center"
            >
              <div className={`p-3 rounded-2xl bg-white dark:bg-card shadow-sm border border-border`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-black">{stat.value}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
