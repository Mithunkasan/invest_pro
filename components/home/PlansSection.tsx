'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Check, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const plans = [
  {
    name: 'Bronze',
    roi: '1.5%',
    duration: '30 Days',
    min: '₹1,000',
    max: '₹10,000',
    color: '#cd7f32',
    popular: false,
    features: ['Daily Returns', 'Standard Support', 'Referral Bonus', 'Instant Payouts']
  },
  {
    name: 'Silver',
    roi: '2.0%',
    duration: '45 Days',
    min: '₹10,000',
    max: '₹50,000',
    color: '#c0c0c0',
    popular: false,
    features: ['Daily Returns', 'Priority Support', 'Referral Bonus', 'Instant Payouts', 'Bonus Rewards']
  },
  {
    name: 'Gold',
    roi: '2.5%',
    duration: '60 Days',
    min: '₹50,000',
    max: '₹2,00,000',
    color: '#ffd700',
    popular: true,
    features: ['Highest Returns', 'VIP Support', 'Extra Referral %', 'Instant Payouts', 'Personal Manager']
  },
  {
    name: 'Platinum',
    roi: '3.0%',
    duration: '90 Days',
    min: '₹2,00,000',
    max: '₹10,00,000',
    color: '#e5e4e2',
    popular: false,
    features: ['Maximum Returns', 'Executive Support', 'Highest Referral %', 'Instant Payouts', 'Wealth Consulting']
  }
]

export function PlansSection() {
  const t = useTranslations('plans')

  return (
    <section className="section-container relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-blue-500/10 blur-[120px]" />
      </div>

      <div className="text-center mb-16">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-heading"
        >
          {t('title')}
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="section-subheading"
        >
          {t('subtitle')}
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className={`premium-card relative overflow-hidden group ${plan.popular ? 'border-primary shadow-2xl shadow-primary/10 ring-1 ring-primary/20' : ''}`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl z-20">
                Most Popular
              </div>
            )}

            <div className="p-6 pb-0">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{plan.name} Plan</span>
                <div className="w-2 h-2 rounded-full" style={{ background: plan.color }} />
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">{plan.roi}</span>
                  <span className="text-muted-foreground font-bold text-sm">/ Day</span>
                </div>
                <p className="text-xs font-bold text-primary mt-1">{plan.duration}</p>
              </div>
            </div>

            <div className="p-6 pt-2 space-y-4">
              <div className="space-y-2 py-4 border-y border-border/50">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('minAmount')}</span>
                  <span className="font-bold">{plan.min}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('maxAmount')}</span>
                  <span className="font-bold">{plan.max}</span>
                </div>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-primary" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href="/register" className="block pt-4">
                <Button 
                  className={`w-full h-12 font-bold group ${plan.popular ? '' : 'variant-outline'}`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {t('investNow')}
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
