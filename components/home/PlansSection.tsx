'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

/* ── Plan Data ─────────────────────────────────────────────────── */
const PLANS = [
  {
    id: 'silver',
    name: 'SILVER',
    price: '₹999',
    period: 'One Time',
    popular: false,
    ctaLabel: 'Join Silver',
    ctaHref: '/register?plan=silver',
    features: [
      'Member ID Activation',
      'Access to Part-Time Jobs',
      'Refer & Earn',
      'Basic Support',
      'Weekly Payouts',
    ],
  },
  {
    id: 'gold',
    name: 'GOLD',
    price: '₹2,499',
    period: 'One Time',
    popular: true,
    ctaLabel: 'Join Gold',
    ctaHref: '/register?plan=gold',
    features: [
      'All Silver Benefits',
      'Higher Referral Rewards',
      'Priority Support',
      'Daily Topup Earnings',
      'Bonus & Incentives',
    ],
  },
  {
    id: 'platinum',
    name: 'PLATINUM',
    price: '₹4,999',
    period: 'One Time',
    popular: false,
    ctaLabel: 'Join Platinum',
    ctaHref: '/register?plan=platinum',
    features: [
      'All Gold Benefits',
      'Maximum Referral Rewards',
      'VIP Support',
      'Exclusive Bonuses',
      'Leadership Rewards',
    ],
  },
]

/* ── SVG Gem Icons ─────────────────────────────────────────────── */

/** Silver Diamond — faceted crystal shape */
const SilverGem = () => (
  <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" aria-hidden="true">
    <defs>
      <linearGradient id="sg-top" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#94a3b8" />
      </linearGradient>
      <linearGradient id="sg-mid" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>
      <linearGradient id="sg-bot" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>
    </defs>
    {/* Outer hexagon */}
    <polygon points="40,6 70,23 70,57 40,74 10,57 10,23" fill="url(#sg-bot)" />
    {/* Mid facet */}
    <polygon points="40,6 70,23 55,40 25,40 10,23" fill="url(#sg-top)" />
    {/* Center diamond */}
    <polygon points="40,14 62,26 55,40 25,40 18,26" fill="url(#sg-mid)" opacity="0.9" />
    {/* Highlight */}
    <polygon points="40,14 55,26 40,30 25,26" fill="white" opacity="0.35" />
    {/* Bottom facets */}
    <polygon points="25,40 55,40 40,74" fill="url(#sg-bot)" opacity="0.7" />
    <line x1="40" y1="40" x2="40" y2="74" stroke="#94a3b8" strokeWidth="0.5" opacity="0.4" />
    {/* Sparkle */}
    <circle cx="30" cy="22" r="2" fill="white" opacity="0.6" />
  </svg>
)

/** Gold Crown/Gem — multi-facet warm gold */
const GoldGem = () => (
  <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" aria-hidden="true">
    <defs>
      <linearGradient id="gg-a" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fde68a" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
      <linearGradient id="gg-b" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fcd34d" />
        <stop offset="100%" stopColor="#92400e" />
      </linearGradient>
      <linearGradient id="gg-c" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fef3c7" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
    {/* Base octagon */}
    <polygon points="28,8 52,8 68,28 68,52 52,72 28,72 12,52 12,28" fill="url(#gg-b)" />
    {/* Upper facets */}
    <polygon points="28,8 52,8 58,20 40,26 22,20" fill="url(#gg-a)" />
    {/* Mid band */}
    <polygon points="22,20 58,20 64,40 16,40" fill="url(#gg-c)" opacity="0.85" />
    {/* Lower facets */}
    <polygon points="16,40 64,40 52,72 28,72" fill="url(#gg-b)" opacity="0.8" />
    {/* Center shine */}
    <polygon points="32,14 48,14 54,28 40,32 26,28" fill="white" opacity="0.2" />
    {/* Inner star */}
    <polygon points="40,22 44,32 54,32 46,38 50,50 40,44 30,50 34,38 26,32 36,32" fill="#fcd34d" opacity="0.7" />
    {/* Highlight */}
    <circle cx="32" cy="18" r="3" fill="white" opacity="0.45" />
    <circle cx="48" cy="15" r="1.5" fill="white" opacity="0.3" />
  </svg>
)

/** Platinum Crystal — purple/violet faceted gem */
const PlatinumGem = () => (
  <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" aria-hidden="true">
    <defs>
      <linearGradient id="pg-a" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e879f9" />
        <stop offset="50%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#6d28d9" />
      </linearGradient>
      <linearGradient id="pg-b" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#c084fc" />
        <stop offset="100%" stopColor="#4c1d95" />
      </linearGradient>
      <linearGradient id="pg-c" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f0abfc" />
        <stop offset="100%" stopColor="#7c3aed" />
      </linearGradient>
    </defs>
    {/* Outer hexagon */}
    <polygon points="40,5 70,22 70,58 40,75 10,58 10,22" fill="url(#pg-b)" />
    {/* Upper facet */}
    <polygon points="40,5 70,22 55,38 25,38 10,22" fill="url(#pg-a)" />
    {/* Center facet */}
    <polygon points="25,38 55,38 48,55 32,55" fill="url(#pg-c)" opacity="0.85" />
    {/* Lower point */}
    <polygon points="32,55 48,55 40,75" fill="url(#pg-b)" opacity="0.7" />
    {/* Highlight */}
    <polygon points="40,5 62,20 40,28 18,20" fill="white" opacity="0.18" />
    {/* Inner glow lines */}
    <line x1="40" y1="5" x2="40" y2="75" stroke="#e879f9" strokeWidth="0.5" opacity="0.3" />
    <line x1="10" y1="22" x2="70" y2="58" stroke="#c084fc" strokeWidth="0.5" opacity="0.25" />
    {/* Sparkles */}
    <circle cx="28" cy="18" r="2.5" fill="white" opacity="0.55" />
    <circle cx="52" cy="12" r="1.5" fill="white" opacity="0.35" />
  </svg>
)

/* ── Gem selector ──────────────────────────────────────────────── */
function PlanGem({ id }: { id: string }) {
  if (id === 'silver')   return <SilverGem />
  if (id === 'gold')     return <GoldGem />
  return <PlatinumGem />
}

/* ── Per-plan style config ─────────────────────────────────────── */
const PLAN_STYLES = {
  silver: {
    nameCls:    'text-slate-200',
    priceCls:   'text-white',
    checkCls:   'text-blue-400',
    borderCls:  'border-slate-600/50',
    bgCls:      'bg-gradient-to-b from-[#0d1225] to-[#080d1a]',
    btnCls:     'border border-blue-400/60 text-white hover:bg-blue-500/10',
    btnStyle:   {} as React.CSSProperties,
    glowStyle:  {} as React.CSSProperties,
  },
  gold: {
    nameCls:    'text-yellow-300',
    priceCls:   'text-yellow-200',
    checkCls:   'text-yellow-400',
    borderCls:  'border-[#4af6f6]/50',
    bgCls:      'bg-gradient-to-b from-[#0a1535] to-[#060e20]',
    btnCls:     'text-[#0a0a0a] font-extrabold',
    btnStyle:   { background: 'linear-gradient(135deg,#fbbf24,#f59e0b,#d97706)' } as React.CSSProperties,
    glowStyle:  { boxShadow: '0 0 0 2px #4af6f6, 0 0 40px rgba(74,246,246,0.25), 0 0 80px rgba(74,246,246,0.12)' } as React.CSSProperties,
  },
  platinum: {
    nameCls:    'text-purple-300',
    priceCls:   'text-white',
    checkCls:   'text-purple-400',
    borderCls:  'border-purple-500/40',
    bgCls:      'bg-gradient-to-b from-[#100d22] to-[#080512]',
    btnCls:     'text-white font-extrabold',
    btnStyle:   { background: 'linear-gradient(135deg,#9333ea,#7c3aed,#6d28d9)' } as React.CSSProperties,
    glowStyle:  {} as React.CSSProperties,
  },
} as const

type PlanId = keyof typeof PLAN_STYLES

/* ── Card Component ────────────────────────────────────────────── */
function PlanCard({
  plan,
  isCenter,
  position,
}: {
  plan: (typeof PLANS)[number]
  isCenter: boolean
  position: 'left' | 'center' | 'right'
}) {
  const s = PLAN_STYLES[plan.id as PlanId]

  return (
    /* Outer wrapper adds top space so the badge overflows above without being clipped */
    <div className={plan.popular ? 'pt-4' : ''}>
    <motion.article
      layout
      initial={false}
      animate={{
        scale:   isCenter ? 1 : 0.9,
        opacity: isCenter ? 1 : 0.6,
        y:       isCenter ? 0 : 20,
      }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      className={`relative flex flex-col rounded-2xl border ${s.borderCls} ${s.bgCls}`}
      style={isCenter && plan.popular ? s.glowStyle : {}}
      aria-label={`${plan.name} membership plan`}
    >
      {/* MOST POPULAR badge — sits above the card top edge, fully visible */}
      {plan.popular && (
        <div className="absolute left-1/2 -translate-x-1/2 z-20" style={{ top: '-14px' }}>
          <span
            className="inline-flex items-center px-5 py-[5px] rounded-full text-[10px] sm:text-xs font-black tracking-[0.18em] uppercase text-white whitespace-nowrap"
            style={{ background: 'linear-gradient(90deg,#a855f7,#6366f1,#3b82f6)' }}
          >
            MOST POPULAR
          </span>
        </div>
      )}

      <div className="flex flex-col flex-1 p-6 sm:p-7 pt-8">
        {/* Icon + Name row */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0">
            <PlanGem id={plan.id} />
          </div>
          <h3
            className={`text-2xl sm:text-3xl font-black tracking-widest ${s.nameCls}`}
            style={{ letterSpacing: '0.12em' }}
          >
            {plan.name}
          </h3>
        </div>

        {/* Price */}
        <div className="mb-5">
          <p className={`text-4xl sm:text-5xl font-black ${s.priceCls} leading-none`}>
            {plan.price}
          </p>
          <p className="text-slate-400 text-sm font-medium mt-1">{plan.period}</p>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/[0.07] mb-5" />

        {/* Features list */}
        <ul className="space-y-3 flex-1 mb-6" role="list">
          {plan.features.map((feat) => (
            <li key={feat} className="flex items-center gap-2.5 text-sm sm:text-[0.9rem] text-slate-300">
              <Check
                className={`w-4 h-4 shrink-0 ${s.checkCls}`}
                strokeWidth={3}
                aria-hidden="true"
              />
              {feat}
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Link href={plan.ctaHref} className="block mt-auto" aria-label={`${plan.ctaLabel} membership`}>
          <button
            className={`w-full py-3.5 rounded-xl text-sm sm:text-base font-bold transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] ${s.btnCls}`}
            style={s.btnStyle}
          >
            {plan.ctaLabel}
          </button>
        </Link>
      </div>
    </motion.article>
    </div>
  )
}

/* ── Main Section ──────────────────────────────────────────────── */
export function PlansSection() {
  const [activeIndex, setActiveIndex] = useState(1) // Gold is center by default

  const prev = useCallback(() =>
    setActiveIndex((i) => (i - 1 + PLANS.length) % PLANS.length), [])
  const next = useCallback(() =>
    setActiveIndex((i) => (i + 1) % PLANS.length), [])

  /* Ordered so active is always in center slot */
  const leftIdx   = (activeIndex - 1 + PLANS.length) % PLANS.length
  const rightIdx  = (activeIndex + 1) % PLANS.length
  const orderedPlans = [PLANS[leftIdx], PLANS[activeIndex], PLANS[rightIdx]]

  return (
    <section
      id="membership-plans"
      className="relative w-full overflow-hidden bg-[#020714] py-16 sm:py-20 lg:py-24"
      aria-labelledby="plans-heading"
    >
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[10%] left-[15%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-blue-700/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[35vw] h-[35vw] max-w-[450px] max-h-[450px] bg-purple-700/10 rounded-full blur-[100px]" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(59,130,246,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.6) 1px,transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section Header ── */}
        <div className="text-center mb-12 sm:mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs sm:text-sm font-black tracking-[0.22em] uppercase mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            CHOOSE YOUR MEMBERSHIP
          </motion.p>
          <motion.h2
            id="plans-heading"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="text-white font-extrabold tracking-tight"
            style={{ fontSize: 'clamp(1.7rem,4vw,2.8rem)' }}
          >
            Unlock Premium Benefits
          </motion.h2>
        </div>

        {/* ── Carousel (desktop 3-up, mobile single) ── */}
        <div className="flex items-center justify-center gap-3 sm:gap-5 lg:gap-6">

          {/* Left Arrow */}
          <button
            onClick={prev}
            aria-label="Previous plan"
            className="shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-white/[0.05] border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/25 transition-all duration-200 z-20"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Cards container */}
          <div className="flex-1 min-w-0">
            {/* ── Mobile: single card ── */}
            <div className="block sm:hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={PLANS[activeIndex].id}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                >
                  <PlanCard
                    plan={PLANS[activeIndex]}
                    isCenter={true}
                    position="center"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── Tablet / Desktop: 3-card layout ── */}
            <div
              className="hidden sm:grid gap-3 lg:gap-5"
              style={{ gridTemplateColumns: '1fr 1.18fr 1fr', alignItems: 'center' }}
            >
              {orderedPlans.map((plan, idx) => {
                const pos = idx === 0 ? 'left' : idx === 2 ? 'right' : 'center'
                return (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    isCenter={idx === 1}
                    position={pos}
                  />
                )
              })}
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={next}
            aria-label="Next plan"
            className="shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-white/[0.05] border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/25 transition-all duration-200 z-20"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* ── Dot indicators (mobile) ── */}
        <div className="flex sm:hidden items-center justify-center gap-2 mt-6" role="tablist" aria-label="Plan navigation">
          {PLANS.map((plan, i) => (
            <button
              key={plan.id}
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Go to ${plan.name} plan`}
              onClick={() => setActiveIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? 'w-6 bg-blue-400'
                  : 'w-1.5 bg-slate-600 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>

        {/* ── Desktop indicator dots ── */}
        <div className="hidden sm:flex items-center justify-center gap-2 mt-8" role="tablist" aria-label="Plan navigation">
          {PLANS.map((plan, i) => (
            <button
              key={plan.id}
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Go to ${plan.name} plan`}
              onClick={() => setActiveIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? 'w-8 bg-gradient-to-r from-blue-400 to-purple-400'
                  : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
