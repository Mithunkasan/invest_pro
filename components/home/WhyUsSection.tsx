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

/** Shield / Secure & Transparent */
const SecureIcon = () => (
  <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" aria-hidden="true">
    <defs>
      <linearGradient id="shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="50%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
    </defs>
    {/* Shield body */}
    <path
      d="M40 10 L65 22 L65 42 Q65 60 40 70 Q15 60 15 42 L15 22 Z"
      fill="url(#shield-grad)"
      opacity="0.9"
    />
    {/* Inner shield */}
    <path
      d="M40 17 L59 27 L59 42 Q59 56 40 64 Q21 56 21 42 L21 27 Z"
      fill="none"
      stroke="#7dd3fc"
      strokeWidth="1.5"
      opacity="0.5"
    />
    {/* Checkmark */}
    <path
      d="M28 40 L36 49 L53 31"
      stroke="white"
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Shine */}
    <path d="M22 25 Q32 19 42 22" stroke="white" strokeWidth="1.5" opacity="0.35" strokeLinecap="round" />
  </svg>
)

/** Blockchain Cubes / Web3 Future */
const Web3Icon = () => (
  <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" aria-hidden="true">
    <defs>
      <linearGradient id="cube-top" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#67e8f9" />
        <stop offset="100%" stopColor="#22d3ee" />
      </linearGradient>
      <linearGradient id="cube-left" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0891b2" />
        <stop offset="100%" stopColor="#0e7490" />
      </linearGradient>
      <linearGradient id="cube-right" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#155e75" />
        <stop offset="100%" stopColor="#164e63" />
      </linearGradient>
    </defs>
    {/* Bottom-left cube */}
    <g transform="translate(8, 38)">
      <polygon points="16,0 32,9 32,27 16,36 0,27 0,9" fill="url(#cube-left)" opacity="0.75" />
      <polygon points="16,0 32,9 16,18 0,9" fill="url(#cube-top)" opacity="0.85" />
      <polygon points="32,9 32,27 16,36 16,18" fill="url(#cube-right)" opacity="0.8" />
    </g>
    {/* Top cube */}
    <g transform="translate(30, 10)">
      <polygon points="16,0 32,9 32,27 16,36 0,27 0,9" fill="url(#cube-left)" opacity="0.8" />
      <polygon points="16,0 32,9 16,18 0,9" fill="url(#cube-top)" />
      <polygon points="32,9 32,27 16,36 16,18" fill="url(#cube-right)" opacity="0.85" />
    </g>
    {/* Right cube (partial) */}
    <g transform="translate(46, 42)">
      <polygon points="14,0 28,8 28,24 14,32 0,24 0,8" fill="url(#cube-left)" opacity="0.7" />
      <polygon points="14,0 28,8 14,16 0,8" fill="url(#cube-top)" opacity="0.9" />
      <polygon points="28,8 28,24 14,32 14,16" fill="url(#cube-right)" opacity="0.75" />
    </g>
  </svg>
)

/* ─────────────────────────────────────────────
   Feature card data — icons + i18n key mapping
───────────────────────────────────────────── */
const FEATURES = [
  {
    key:         'globalNetwork',
    Icon:        GlobalNetworkIcon,
    glowColor:   'rgba(59,130,246,0.35)',
    borderColor: 'rgba(59,130,246,0.3)',
    delay:       0.0,
  },
  {
    key:         'partTime',
    Icon:        PartTimeIcon,
    glowColor:   'rgba(14,165,233,0.35)',
    borderColor: 'rgba(14,165,233,0.3)',
    delay:       0.1,
  },
  {
    key:         'earnRewards',
    Icon:        EarnRewardsIcon,
    glowColor:   'rgba(245,158,11,0.4)',
    borderColor: 'rgba(245,158,11,0.3)',
    delay:       0.2,
  },
  {
    key:         'membership',
    Icon:        MembershipIcon,
    glowColor:   'rgba(168,85,247,0.4)',
    borderColor: 'rgba(168,85,247,0.3)',
    delay:       0.3,
  },
  {
    key:         'secure',
    Icon:        SecureIcon,
    glowColor:   'rgba(59,130,246,0.35)',
    borderColor: 'rgba(59,130,246,0.3)',
    delay:       0.4,
  },
  {
    key:         'web3',
    Icon:        Web3Icon,
    glowColor:   'rgba(34,211,238,0.35)',
    borderColor: 'rgba(34,211,238,0.3)',
    delay:       0.5,
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
      className="relative w-full overflow-hidden bg-[#020714]"
      aria-labelledby="why-us-heading"
    >
      {/* Subtle top gradient continuation from HeroSection */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        aria-hidden="true"
      >
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#02040a] to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(30,27,75,0.25)_0%,transparent_70%)]" />
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
        <div className="text-center mb-12 sm:mb-14 lg:mb-16">
          {/* Sub-label */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block text-xs sm:text-sm font-black tracking-[0.22em] uppercase mb-3 bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent"
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
            style={{ fontSize: 'clamp(1.6rem,4vw,2.6rem)' }}
          >
            {t('heading')}
          </motion.h2>
        </div>

        {/* ── Feature Cards Grid ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-3 xl:gap-4"
          role="list"
          aria-label={t('label')}
        >
          {FEATURES.map(({ key, Icon, glowColor, borderColor }) => (
            <motion.article
              key={key}
              variants={cardVariants}
              role="listitem"
              className="group relative flex flex-col items-center text-center rounded-2xl overflow-hidden cursor-default"
              style={{
                background: 'linear-gradient(145deg,rgba(13,17,40,0.95) 0%,rgba(8,12,28,0.98) 100%)',
                border: `1px solid ${borderColor}`,
              }}
              whileHover={{
                y: -6,
                transition: { duration: 0.25, ease: 'easeOut' },
              }}
            >
              {/* Hover glow overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none rounded-2xl"
                style={{
                  background: `radial-gradient(ellipse 80% 60% at 50% 0%,${glowColor} 0%,transparent 70%)`,
                }}
                aria-hidden="true"
              />

              {/* Card content */}
              <div className="relative z-10 flex flex-col items-center px-4 py-7 sm:py-8 w-full">
                {/* Icon container */}
                <div
                  className="w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] mb-4 flex items-center justify-center rounded-xl"
                  style={{
                    background: `radial-gradient(ellipse at 40% 35%,${glowColor} 0%,rgba(2,4,20,0.8) 70%)`,
                    boxShadow: `0 0 22px ${glowColor}`,
                  }}
                  aria-hidden="true"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12">
                    <Icon />
                  </div>
                </div>

                {/* Title */}
                <h3
                  className="text-white font-bold leading-snug mb-2.5"
                  style={{ fontSize: 'clamp(0.82rem,1.4vw,1rem)' }}
                >
                  {t(`features.${key}.title` as Parameters<typeof t>[0])}
                </h3>

                {/* Description */}
                <p
                  className="text-slate-400 leading-relaxed font-medium"
                  style={{ fontSize: 'clamp(0.72rem,1.1vw,0.82rem)' }}
                >
                  {t(`features.${key}.desc` as Parameters<typeof t>[0])}
                </p>
              </div>

              {/* Bottom glow line */}
              <div
                className="absolute bottom-0 left-[15%] right-[15%] h-px opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                style={{ background: `linear-gradient(90deg,transparent,${glowColor},transparent)` }}
                aria-hidden="true"
              />
            </motion.article>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade to next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-[#020714] pointer-events-none"
        aria-hidden="true"
      />
    </section>
  )
}
