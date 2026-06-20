'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

/* ─────────────────────────────────────────────
   SVG Icon Components — custom-drawn to match
   the reference image exactly
   ───────────────────────────────────────────── */

/** Globe / Global Network */
const GlobalNetworkIcon = () => (
  <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" aria-hidden="true">
    <defs>
      <radialGradient id="globe-bg" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="55%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </radialGradient>
    </defs>
    <circle cx="40" cy="40" r="32" fill="url(#globe-bg)" opacity="0.15" />
    {/* Grid lines */}
    <circle cx="40" cy="40" r="30" stroke="#3b82f6" strokeWidth="1.8" opacity="0.7" />
    <ellipse cx="40" cy="40" rx="18" ry="30" stroke="#3b82f6" strokeWidth="1.4" opacity="0.6" />
    <ellipse cx="40" cy="40" rx="30" ry="12" stroke="#3b82f6" strokeWidth="1.4" opacity="0.6" />
    <line x1="10" y1="40" x2="70" y2="40" stroke="#3b82f6" strokeWidth="1.2" opacity="0.5" />
    <line x1="40" y1="10" x2="40" y2="70" stroke="#3b82f6" strokeWidth="1.2" opacity="0.5" />
    <ellipse cx="40" cy="40" rx="30" ry="22" stroke="#60a5fa" strokeWidth="1" opacity="0.35" />
    {/* Highlight arc */}
    <path d="M22 22 Q40 14 58 22" stroke="#93c5fd" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
)

/** Briefcase / Part-Time Jobs */
const PartTimeIcon = () => (
  <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" aria-hidden="true">
    <defs>
      <linearGradient id="brief-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>
    </defs>
    {/* Case body */}
    <rect x="12" y="32" width="56" height="34" rx="5" fill="url(#brief-bg)" opacity="0.9" />
    {/* Handle */}
    <path d="M28 32 L28 24 Q28 18 34 18 L46 18 Q52 18 52 24 L52 32" stroke="#38bdf8" strokeWidth="4" fill="none" strokeLinecap="round" />
    {/* Center band */}
    <rect x="12" y="45" width="56" height="5" rx="0" fill="#0ea5e9" opacity="0.6" />
    {/* Clasp */}
    <rect x="35" y="43" width="10" height="9" rx="2" fill="#7dd3fc" />
    {/* Shine */}
    <path d="M16 36 Q25 33 35 35" stroke="white" strokeWidth="1.5" opacity="0.35" strokeLinecap="round" />
  </svg>
)

/** Gold Coin / Earn Rewards */
const EarnRewardsIcon = () => (
  <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" aria-hidden="true">
    <defs>
      <radialGradient id="coin-face" cx="38%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#fde68a" />
        <stop offset="45%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#b45309" />
      </radialGradient>
      <radialGradient id="coin-edge" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fcd34d" />
        <stop offset="100%" stopColor="#92400e" />
      </radialGradient>
    </defs>
    {/* Outer rim */}
    <circle cx="40" cy="40" r="32" fill="#92400e" />
    {/* Edge shadow */}
    <circle cx="40" cy="42" r="30" fill="#b45309" />
    {/* Coin face */}
    <circle cx="40" cy="38" r="30" fill="url(#coin-face)" />
    {/* Dollar sign */}
    <text x="40" y="47" textAnchor="middle" fontSize="28" fontWeight="900" fill="#78350f" fontFamily="Arial">$</text>
    {/* Highlight */}
    <ellipse cx="30" cy="28" rx="8" ry="5" fill="white" opacity="0.25" transform="rotate(-25 30 28)" />
  </svg>
)

/** Crown / Membership Benefits */
const MembershipIcon = () => (
  <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" aria-hidden="true">
    <defs>
      <linearGradient id="crown-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c084fc" />
        <stop offset="50%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#7c3aed" />
      </linearGradient>
      <linearGradient id="crown-shine" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#e879f9" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
    </defs>
    {/* Base band */}
    <rect x="14" y="54" width="52" height="10" rx="4" fill="url(#crown-grad)" />
    {/* Crown body */}
    <path
      d="M14 56 L14 36 L26 48 L40 22 L54 48 L66 36 L66 56 Z"
      fill="url(#crown-shine)"
    />
    {/* Jewel dots */}
    <circle cx="40" cy="58" r="4" fill="#f0abfc" />
    <circle cx="26" cy="58" r="3" fill="#c084fc" />
    <circle cx="54" cy="58" r="3" fill="#c084fc" />
    {/* Top sparkles */}
    <circle cx="40" cy="22" r="4" fill="#f0abfc" />
    <circle cx="14" cy="36" r="3.5" fill="#c084fc" />
    <circle cx="66" cy="36" r="3.5" fill="#c084fc" />
    {/* Shine */}
    <path d="M18 48 Q28 42 38 44" stroke="white" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
  </svg>
)

/** Trophy / Leadership Recognition */
const LeadershipIcon = () => (
  <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" aria-hidden="true">
    <defs>
      <linearGradient id="trophy-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#ca8a04" />
      </linearGradient>
    </defs>
    <circle cx="40" cy="40" r="32" fill="#eab308" opacity="0.15" />
    {/* Trophy Cup */}
    <path d="M25 22 L55 22 L52 42 Q52 50 40 50 Q28 50 28 42 Z" fill="url(#trophy-grad)" />
    {/* Trophy handles */}
    <path d="M25 26 Q18 28 25 38" stroke="#eab308" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <path d="M55 26 Q62 28 55 38" stroke="#eab308" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    {/* Stem & Base */}
    <rect x="37" y="50" width="6" height="12" fill="url(#trophy-grad)" />
    <rect x="28" y="62" width="24" height="6" rx="2" fill="url(#trophy-grad)" />
    {/* Star inside trophy */}
    <polygon points="40,28 43,34 50,35 45,40 46,47 40,43 34,47 35,40 30,35 37,34" fill="#713f12" />
  </svg>
)

/** Upward Trend / Business Development */
const BusinessIcon = () => (
  <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" aria-hidden="true">
    <defs>
      <linearGradient id="business-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#86efac" />
        <stop offset="100%" stopColor="#15803d" />
      </linearGradient>
    </defs>
    <circle cx="40" cy="40" r="32" fill="#22c55e" opacity="0.15" />
    {/* Trend chart bars */}
    <rect x="22" y="44" width="8" height="18" rx="1.5" fill="url(#business-grad)" />
    <rect x="36" y="32" width="8" height="30" rx="1.5" fill="url(#business-grad)" />
    <rect x="50" y="20" width="8" height="42" rx="1.5" fill="url(#business-grad)" />
    {/* Upward arrow line */}
    <path d="M20 48 L34 32 L48 20 L58 20" stroke="#4ade80" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M52 14 L60 20 L54 28" stroke="#4ade80" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** Group / Community Networking */
const CommunityIcon = () => (
  <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" aria-hidden="true">
    <defs>
      <linearGradient id="comm-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fed7aa" />
        <stop offset="100%" stopColor="#ea580c" />
      </linearGradient>
    </defs>
    <circle cx="40" cy="40" r="32" fill="#f97316" opacity="0.15" />
    {/* Central user */}
    <circle cx="40" cy="32" r="8" fill="url(#comm-grad)" />
    <path d="M28 52 C28 45 33 44 40 44 C47 44 52 45 52 52" fill="url(#comm-grad)" />
    {/* Side user left */}
    <circle cx="24" cy="38" r="6" fill="url(#comm-grad)" opacity="0.75" />
    <path d="M16 54 C16 48 20 48 24 48 C28 48 32 48 32 54" fill="url(#comm-grad)" opacity="0.75" />
    {/* Side user right */}
    <circle cx="56" cy="38" r="6" fill="url(#comm-grad)" opacity="0.75" />
    <path d="M48 54 C48 48 52 48 56 48 C60 48 64 48 64 54" fill="url(#comm-grad)" opacity="0.75" />
  </svg>
)

/** Graduation Cap / Skill Development */
const SkillIcon = () => (
  <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" aria-hidden="true">
    <defs>
      <linearGradient id="skill-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a5f3fc" />
        <stop offset="100%" stopColor="#0891b2" />
      </linearGradient>
    </defs>
    <circle cx="40" cy="40" r="32" fill="#06b6d4" opacity="0.15" />
    {/* Cap diamond */}
    <polygon points="40,20 64,30 40,40 16,30" fill="url(#skill-grad)" />
    {/* Cap base */}
    <path d="M26 36 L26 48 Q26 54 40 54 Q54 54 54 48 L54 36" fill="url(#skill-grad)" opacity="0.8" />
    {/* Tassel */}
    <path d="M52 32 L60 44 L60 48" stroke="#22d3ee" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
)

/* ─────────────────────────────────────────────
   Feature card data — icons + i18n key mapping
   ───────────────────────────────────────────── */
const FEATURES = [
  {
    key:            'networkGrowth',
    Icon:           GlobalNetworkIcon,
    glowColor:      'rgba(59,130,246,0.35)',
    borderColor:    'rgba(59,130,246,0.3)',
    bannerGradient: 'linear-gradient(135deg, rgba(96, 165, 250, 0.45) 0%, rgba(29, 78, 216, 0.75) 100%)',
    delay:          0.0,
  },
  {
    key:            'taskEarnings',
    Icon:           PartTimeIcon,
    glowColor:      'rgba(14,165,233,0.35)',
    borderColor:    'rgba(14,165,233,0.3)',
    bannerGradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.45) 0%, rgba(2, 132, 199, 0.75) 100%)',
    delay:          0.1,
  },
  {
    key:            'referralRewards',
    Icon:           EarnRewardsIcon,
    glowColor:      'rgba(245,158,11,0.4)',
    borderColor:    'rgba(245,158,11,0.3)',
    bannerGradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.45) 0%, rgba(180, 83, 9, 0.75) 100%)',
    delay:          0.2,
  },
  {
    key:            'membershipBenefits',
    Icon:           MembershipIcon,
    glowColor:      'rgba(168,85,247,0.4)',
    borderColor:    'rgba(168,85,247,0.3)',
    bannerGradient: 'linear-gradient(135deg, rgba(192, 132, 252, 0.45) 0%, rgba(124, 58, 237, 0.75) 100%)',
    delay:          0.3,
  },
  {
    key:            'leadershipRecognition',
    Icon:           LeadershipIcon,
    glowColor:      'rgba(234,179,8,0.4)',
    borderColor:    'rgba(234,179,8,0.3)',
    bannerGradient: 'linear-gradient(135deg, rgba(253, 224, 71, 0.45) 0%, rgba(202, 138, 4, 0.75) 100%)',
    delay:          0.4,
  },
  {
    key:            'businessDevelopment',
    Icon:           BusinessIcon,
    glowColor:      'rgba(34,197,94,0.35)',
    borderColor:    'rgba(34,197,94,0.3)',
    bannerGradient: 'linear-gradient(135deg, rgba(134, 239, 172, 0.45) 0%, rgba(21, 128, 61, 0.75) 100%)',
    delay:          0.5,
  },
  {
    key:            'communityNetworking',
    Icon:           CommunityIcon,
    glowColor:      'rgba(249,115,22,0.35)',
    borderColor:    'rgba(249,115,22,0.3)',
    bannerGradient: 'linear-gradient(135deg, rgba(253, 186, 116, 0.45) 0%, rgba(234, 88, 12, 0.75) 100%)',
    delay:          0.6,
  },
  {
    key:            'skillDevelopment',
    Icon:           SkillIcon,
    glowColor:      'rgba(6,182,212,0.35)',
    borderColor:    'rgba(6,182,212,0.3)',
    bannerGradient: 'linear-gradient(135deg, rgba(165, 243, 252, 0.45) 0%, rgba(8, 145, 178, 0.75) 100%)',
    delay:          0.7,
  },
] as const

/* Animation variants */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const cardVariants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
}

/* ─────────────────────────────────────────────
   WhyUsSection Component
   ───────────────────────────────────────────── */
export function WhyUsSection() {
  const t = useTranslations('whyUs')

  return (
    <section
      id="why-us"
      className="relative w-full overflow-hidden bg-transparent"
      aria-labelledby="why-us-heading"
    >
      {/* Subtle top grid lines overlay */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        aria-hidden="true"
      >
        {/* Faint grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">

        {/* ── Section Header ── */}
        <div className="text-center mb-12 sm:mb-14 lg:mb-16 space-y-4">
          {/* Sub-label */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block text-xs sm:text-sm font-black tracking-[0.22em] uppercase bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent"
          >
            {t('label')}
          </motion.p>

          {/* Main heading */}
          <motion.h2
            id="why-us-heading"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="text-white font-extrabold tracking-tight leading-tight"
            style={{ fontSize: 'clamp(1.6rem, 4vw, 2.6rem)' }}
          >
            {t('heading')}
          </motion.h2>

          {/* Business Model Description */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="text-slate-400 text-sm max-w-3xl mx-auto leading-relaxed font-medium pt-2"
          >
            {t('description')}
          </motion.p>
        </div>

        {/* ── Feature Cards Grid ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          role="list"
          aria-label={t('label')}
        >
          {FEATURES.map(({ key, Icon, glowColor, borderColor, bannerGradient }) => (
            <motion.article
              key={key}
              variants={cardVariants}
              role="listitem"
              className="why-us-card group cursor-default"
              style={{
                background: 'linear-gradient(145deg,rgba(13,17,40,0.95) 0%,rgba(8,12,28,0.98) 100%)',
                border: `1px solid ${borderColor}`,
                '--banner-grad': bannerGradient,
              } as React.CSSProperties}
              whileHover={{
                y: -6,
                transition: { duration: 0.25, ease: 'easeOut' },
              }}
            >
              {/* Bottom glow line */}
              <div
                className="absolute bottom-0 left-[15%] right-[15%] h-px opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none z-20"
                style={{ background: `linear-gradient(90deg,transparent,${glowColor},transparent)` }}
                aria-hidden="true"
              />

              {/* Icon container */}
              <div
                className="w-14 h-14 flex items-center justify-center rounded-xl icon-wrapper"
                style={{
                  background: `radial-gradient(ellipse at 40% 35%,${glowColor} 0%,rgba(2,4,20,0.8) 70%)`,
                  boxShadow: `0 0 22px ${glowColor}`,
                }}
                aria-hidden="true"
              >
                <div className="w-8 h-8">
                  <Icon />
                </div>
              </div>

              {/* Card content */}
              <div className="card-info text-center">
                {/* Title */}
                <h3
                  className="text-white font-bold leading-snug mb-2.5"
                  style={{ fontSize: 'clamp(0.85rem,1.4vw,1.05rem)' }}
                >
                  {t(`features.${key}.title` as Parameters<typeof t>[0])}
                </h3>

                {/* Description */}
                <p
                  className="text-slate-400 group-hover:text-slate-100 transition-colors duration-500 leading-relaxed font-medium"
                  style={{ fontSize: 'clamp(0.72rem,1.1vw,0.82rem)' }}
                >
                  {t(`features.${key}.desc` as Parameters<typeof t>[0])}
                </p>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* ── Mobile-Only Highlights & SEO Bullet Points ── */}
        <div className="block sm:hidden mt-10 p-5 rounded-2xl bg-gradient-to-br from-brand-900/90 to-brand-950/90 border border-purple-500/20 space-y-4">
          <h4 className="text-sm font-extrabold tracking-wider uppercase bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
            Why Join VR Galaxy Networks?
          </h4>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
              <span><strong>Digital Earning Platform</strong>: Access multiple income opportunities designed for community development and financial growth.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-1.5 shrink-0" />
              <span><strong>Task-Based Earnings</strong>: Earn daily rewards by participating in simple digital tasks on our online earning platform. No activation plan-based returns required.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <span><strong>Referral & Leadership Rewards</strong>: Unlock multiple tiers of referral rewards and claim leadership recognition as you grow your network.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
              <span><strong>Business Networking Community</strong>: Collaborate with professionals in our skill development program for long-term entrepreneurial success.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
