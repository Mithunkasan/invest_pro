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
      className="premium-card group p-5 sm:p-6 hover:shadow-[0_8px_30px_rgb(var(--primary-rgb),0.12)] hover:-translate-y-1.5 transition-all duration-300 hover:border-primary/30"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <AnimatePresence>
            <motion.p
              key={String(value)}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-blue-400 transition-all duration-300"
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
        <motion.div 
          className={cn('p-3 rounded-xl transition-all duration-300 relative overflow-hidden', iconBg)}
          whileHover={{ scale: 1.15, rotate: [0, -12, 12, 0] }}
          transition={{
            scale: { type: "spring", stiffness: 300, damping: 15 },
            rotate: { duration: 0.4, ease: "easeInOut" }
          }}
        >
          {/* Glowing pulse aura on icon hover */}
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
          <motion.div
            animate={{
              y: [0, -2, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 2.5,
              ease: "easeInOut"
            }}
          >
            {icon}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
