'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils/formatters'

interface StatsCardProps {
  title: string
  value: number | string
  isCurrency?: boolean
  change?: number
  changeLabel?: string
  icon: React.ReactNode
  iconBg?: string
  delay?: number
  suffix?: string
}

export function StatsCard({
  title,
  value,
  isCurrency = true,
  change,
  changeLabel,
  icon,
  iconBg = 'bg-primary/10',
  delay = 0,
  suffix,
}: StatsCardProps) {
  const displayValue = isCurrency
    ? formatCurrency(Number(value))
    : `${value}${suffix || ''}`

  const changeIsPositive = change !== undefined && change > 0
  const changeIsNegative = change !== undefined && change < 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="premium-card p-5 sm:p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <AnimatePresence>
            <motion.p
              key={String(value)}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl sm:text-3xl font-bold tracking-tight"
            >
              {displayValue}
            </motion.p>
          </AnimatePresence>
          {change !== undefined && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium',
                changeIsPositive && 'text-green-500',
                changeIsNegative && 'text-red-500',
                !changeIsPositive && !changeIsNegative && 'text-muted-foreground'
              )}
            >
              {changeIsPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : changeIsNegative ? (
                <TrendingDown className="w-3 h-3" />
              ) : (
                <Minus className="w-3 h-3" />
              )}
              <span>
                {changeIsPositive ? '+' : ''}
                {change}% {changeLabel || 'this month'}
              </span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', iconBg)}>{icon}</div>
      </div>
    </motion.div>
  )
}
