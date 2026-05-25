'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Rocket, Play } from 'lucide-react'
import Link from 'next/link'

/* ── Pre-computed star data (SSR-safe, no Math.random() at render time) ── */
const STARS = [
  { top: '5%',  left: '8%',  dur: 3.1, delay: 0.2 },
  { top: '12%', left: '22%', dur: 2.4, delay: 1.1 },
  { top: '3%',  left: '45%', dur: 4.0, delay: 0.7 },
  { top: '18%', left: '67%', dur: 2.8, delay: 0.4 },
  { top: '7%',  left: '83%', dur: 3.5, delay: 1.6 },
  { top: '25%', left: '5%',  dur: 2.2, delay: 0.9 },
  { top: '30%', left: '35%', dur: 3.8, delay: 0.3 },
  { top: '22%', left: '55%', dur: 2.6, delay: 1.3 },
  { top: '35%', left: '78%', dur: 4.2, delay: 0.6 },
  { top: '40%', left: '15%', dur: 3.0, delay: 1.8 },
  { top: '45%', left: '30%', dur: 2.9, delay: 0.1 },
  { top: '48%', left: '60%', dur: 3.6, delay: 1.4 },
  { top: '55%', left: '90%', dur: 2.5, delay: 0.8 },
  { top: '60%', left: '42%', dur: 4.1, delay: 0.5 },
  { top: '65%', left: '18%', dur: 3.3, delay: 1.9 },
  { top: '70%', left: '72%', dur: 2.7, delay: 0.2 },
  { top: '75%', left: '50%', dur: 3.9, delay: 1.2 },
  { top: '80%', left: '25%', dur: 2.3, delay: 0.7 },
  { top: '85%', left: '88%', dur: 4.3, delay: 0.4 },
  { top: '90%', left: '10%', dur: 3.2, delay: 1.6 },
  { top: '10%', left: '95%', dur: 2.8, delay: 1.0 },
  { top: '15%', left: '3%',  dur: 3.7, delay: 0.3 },
  { top: '38%', left: '97%', dur: 2.4, delay: 1.7 },
  { top: '52%', left: '2%',  dur: 4.0, delay: 0.9 },
  { top: '68%', left: '48%', dur: 3.1, delay: 1.5 },
  { top: '82%', left: '65%', dur: 2.6, delay: 0.6 },
  { top: '93%', left: '38%', dur: 3.4, delay: 1.1 },
  { top: '2%',  left: '58%', dur: 2.9, delay: 0.8 },
  { top: '44%', left: '82%', dur: 3.8, delay: 0.2 },
  { top: '77%', left: '12%', dur: 2.5, delay: 1.4 },
]

/* ── Hologram particle data (SSR-safe) ── */
const PARTICLES = [
  { x: -35, delay: 0.0, dur: 3.2, scale: 0.8 },
  { x: -20, delay: 0.4, dur: 2.6, scale: 0.5 },
  { x: -10, delay: 0.8, dur: 3.8, scale: 0.9 },
  { x:   0, delay: 1.2, dur: 2.9, scale: 0.6 },
  { x:  10, delay: 0.3, dur: 3.5, scale: 0.7 },
  { x:  20, delay: 0.9, dur: 2.7, scale: 0.4 },
  { x:  32, delay: 0.6, dur: 3.1, scale: 0.8 },
  { x: -28, delay: 1.5, dur: 4.0, scale: 0.5 },
  { x:  25, delay: 1.1, dur: 3.3, scale: 0.6 },
  { x:  -5, delay: 0.2, dur: 2.8, scale: 0.9 },
]

/* ── Social Icons ── */
const TelegramIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.17.17 0 0 0-.07-.2c-.08-.06-.19-.04-.27-.02-.11.02-1.89 1.2-5.33 3.52-.5.35-.96.52-1.37.51-.45-.01-1.32-.25-1.97-.46-.79-.26-1.42-.4-1.36-.85.03-.23.35-.47.96-.71 3.76-1.64 6.27-2.72 7.54-3.25 3.58-1.48 4.32-1.74 4.81-1.75.11 0 .35.03.5.16.13.12.17.29.19.41z" />
  </svg>
)

const TwitterIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const DiscordIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" />
  </svg>
)

export function HeroSection() {
  const t = useTranslations('hero')

  return (
    <section
      className="relative w-full overflow-hidden bg-[#02040a] flex flex-col min-h-[100svh] lg:h-[100svh] lg:max-h-[100svh]"
      aria-label="Hero Section"
    >
      {/* ── Cosmic Background ── */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        {/* Base radial */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_60%_40%,rgba(16,24,80,0.35)_0%,rgba(2,4,10,1)_100%)]" />

        {/* Nebula glow — right */}
        <motion.div
          animate={{ opacity: [0.12, 0.22, 0.12], scale: [1, 1.07, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[-5%] right-[-5%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] bg-blue-600/10 rounded-full blur-[120px]"
        />
        {/* Nebula glow — left bottom */}
        <motion.div
          animate={{ opacity: [0.10, 0.18, 0.10], scale: [1.06, 1, 1.06] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute bottom-[-10%] left-[-5%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] bg-purple-600/10 rounded-full blur-[100px]"
        />

        {/* Stars */}
        {STARS.map((s, i) => (
          <motion.div
            key={i}
            className="absolute w-[2px] h-[2px] bg-white rounded-full"
            style={{ top: s.top, left: s.left }}
            animate={{ opacity: [0.15, 0.9, 0.15] }}
            transition={{ duration: s.dur, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* ── Saturn (top-right decorative) ── */}
      <div
        className="absolute top-[6%] right-[5%] pointer-events-none select-none z-0"
        style={{ width: 'clamp(80px,10vw,160px)', height: 'clamp(80px,10vw,160px)' }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_30px_rgba(147,51,234,0.4)]">
          <defs>
            <radialGradient id="sat-body" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="40%" stopColor="#c084fc" />
              <stop offset="80%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#02040b" />
            </radialGradient>
            <linearGradient id="sat-ring" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(168,85,247,0.8)" />
              <stop offset="50%" stopColor="rgba(59,130,246,0.35)" />
              <stop offset="100%" stopColor="rgba(168,85,247,0.8)" />
            </linearGradient>
            <clipPath id="sat-front-clip">
              <rect x="0" y="90" width="200" height="110" transform="rotate(-15 100 100)" />
            </clipPath>
          </defs>
          <ellipse cx="100" cy="100" rx="90" ry="15" fill="none" stroke="url(#sat-ring)" strokeWidth="9" transform="rotate(-15 100 100)" opacity="0.55" />
          <circle cx="100" cy="100" r="46" fill="url(#sat-body)" />
          <ellipse cx="100" cy="100" rx="90" ry="15" fill="none" stroke="url(#sat-ring)" strokeWidth="9" transform="rotate(-15 100 100)" clipPath="url(#sat-front-clip)" opacity="0.85" />
        </svg>
      </div>

      {/* ── Small dark planet ── */}
      <div
        className="absolute top-[42%] left-[44%] pointer-events-none select-none z-0 hidden lg:block opacity-50"
        style={{ width: 'clamp(50px,5vw,90px)', height: 'clamp(50px,5vw,90px)' }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <radialGradient id="dark-planet" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="60%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#dark-planet)" />
        </svg>
      </div>

      {/* ── Social Sidebar (desktop only) ── */}
      <div
        className="absolute right-4 xl:right-6 top-1/2 -translate-y-1/2 flex-col gap-4 z-40 hidden lg:flex"
        aria-label="Social links"
      >
        {[
          { Icon: TelegramIcon, label: 'Telegram', hoverColor: 'hover:text-sky-400 hover:border-sky-400/40 hover:shadow-sky-400/30' },
          { Icon: TwitterIcon,  label: 'Twitter',  hoverColor: 'hover:text-sky-300 hover:border-sky-300/40 hover:shadow-sky-300/30' },
          { Icon: DiscordIcon,  label: 'Discord',  hoverColor: 'hover:text-indigo-400 hover:border-indigo-400/40 hover:shadow-indigo-400/30' },
        ].map(({ Icon, label, hoverColor }) => (
          <motion.button
            key={label}
            aria-label={label}
            whileHover={{ scale: 1.15, x: -3 }}
            className={`w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.04] border border-white/10 text-slate-400 shadow-[0_0_12px_rgba(0,0,0,0.3)] backdrop-blur-md cursor-pointer transition-all duration-300 ${hoverColor}`}
          >
            <Icon />
          </motion.button>
        ))}
      </div>

      {/* ── Main Content (vertically + horizontally centered, no extra py) ── */}
      <div className="relative z-30 flex-1 flex lg:items-center items-start w-full overflow-visible">
        <div
          className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-32 pb-16 sm:pb-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">

            {/* ── LEFT COLUMN ── */}
            <div className="lg:col-span-7 flex flex-col items-start text-left w-full min-w-0">

              {/* Welcome badge */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                className="flex flex-wrap items-center gap-1 mb-3 font-black uppercase tracking-widest"
                style={{ fontSize: 'clamp(9px,1.2vw,12px)' }}
              >
                <span className="text-slate-400">{t('welcomePrefix')}</span>
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {t('welcomeSuffix')}
                </span>
              </motion.div>

              {/* Giant stacked headings */}
              <div className="flex flex-col gap-0 mb-4 font-extrabold tracking-tighter leading-[0.92] w-full min-w-0">
                {[
                  { key: 'title1', className: 'text-white' },
                  { key: 'title2', className: 'text-white' },
                  {
                    key: 'title3',
                    className:
                      'bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.55)]',
                  },
                ].map(({ key, className }, idx) => (
                  <motion.h1
                    key={key}
                    initial={{ opacity: 0, x: -25 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.65, delay: 0.1 + idx * 0.12 }}
                    className={className}
                    style={{ fontSize: 'clamp(1.7rem,4vw,2.8rem)' }}
                  >
                    {t(key as 'title1' | 'title2' | 'title3')}
                  </motion.h1>
                ))}
              </div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.42 }}
                className="text-slate-300 leading-relaxed font-medium mb-5 max-w-xl"
                style={{ fontSize: 'clamp(0.8rem,1.5vw,1.05rem)' }}
              >
                {t('subtitle')}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.52 }}
                className="flex flex-wrap gap-3 w-full mb-6"
              >
                <Link href="/register" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto rounded-full font-extrabold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 transition-all duration-300 shadow-[0_0_22px_rgba(168,85,247,0.45)] hover:shadow-[0_0_32px_rgba(59,130,246,0.6)] border-0 gap-2"
                    style={{ height: 'clamp(2.5rem,5vh,3.25rem)', fontSize: 'clamp(0.8rem,1.3vw,0.95rem)', paddingLeft: 'clamp(1.2rem,2.5vw,2rem)', paddingRight: 'clamp(1.2rem,2.5vw,2rem)' }}
                  >
                    {t('cta')}
                    <Rocket className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                  </Button>
                </Link>
                <Link href="/plans" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto rounded-full font-extrabold text-white bg-black/40 border border-white/15 hover:border-white/35 hover:bg-white/10 transition-all duration-300 gap-2"
                    style={{ height: 'clamp(2.5rem,5vh,3.25rem)', fontSize: 'clamp(0.8rem,1.3vw,0.95rem)', paddingLeft: 'clamp(1.2rem,2.5vw,2rem)', paddingRight: 'clamp(1.2rem,2.5vw,2rem)' }}
                  >
                    {t('ctaSecondary')}
                    <Play className="w-3.5 h-3.5 fill-white text-white shrink-0" />
                  </Button>
                </Link>
              </motion.div>

              {/* Live Stats */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.62 }}
                className="w-full"
              >
                {/* Live indicator */}
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  <span
                    className="font-black tracking-widest text-slate-400 uppercase"
                    style={{ fontSize: 'clamp(8px,1vw,10px)' }}
                  >
                    {t('liveStats')}
                  </span>
                </div>

                {/* Stats grid — 2 cols on mobile, 4 on sm+ */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 rounded-xl bg-white/[0.025] border border-white/[0.07] backdrop-blur-md overflow-hidden">
                  {[
                    { val: t('stats.membersVal'), label: t('stats.members') },
                    { val: t('stats.activeVal'),  label: t('stats.active') },
                    { val: t('stats.paidVal'),    label: t('stats.paid') },
                    { val: t('stats.rateVal'),    label: t('stats.rate') },
                  ].map(({ val, label }, i) => (
                    <div
                      key={i}
                      className={`flex flex-col px-3 py-3 sm:px-4 sm:py-3.5 ${i > 0 ? 'border-l border-white/[0.07]' : ''} ${i >= 2 ? 'border-t sm:border-t-0 border-white/[0.07]' : ''}`}
                    >
                      <span
                        className="font-black text-white leading-none mb-0.5"
                        style={{ fontSize: 'clamp(0.85rem,1.8vw,1.3rem)' }}
                      >
                        {val}
                      </span>
                      <span
                        className="text-slate-400 font-semibold tracking-tight"
                        style={{ fontSize: 'clamp(7px,0.9vw,10px)' }}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Mobile social icons */}
              <div className="flex items-center gap-3 mt-4 lg:hidden" aria-label="Social links">
                {[
                  { Icon: TelegramIcon, label: 'Telegram' },
                  { Icon: TwitterIcon,  label: 'Twitter' },
                  { Icon: DiscordIcon,  label: 'Discord' },
                ].map(({ Icon, label }) => (
                  <motion.button
                    key={label}
                    aria-label={label}
                    whileTap={{ scale: 0.92 }}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.05] border border-white/10 text-slate-400 backdrop-blur-md"
                  >
                    <Icon />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* ── RIGHT COLUMN (Holographic Badge + Pedestal) ── */}
            <div
              className="lg:col-span-5 flex items-center justify-center relative w-full min-w-0 overflow-visible"
              style={{ height: 'clamp(320px,45vh,520px)' }}
            >
              {/* Pedestal rings */}
              <div
                className="absolute bottom-[5%] left-1/2 -translate-x-1/2 pointer-events-none select-none z-0"
                style={{ width: 'clamp(180px,30vw,380px)', height: 'clamp(180px,30vw,380px)' }}
                aria-hidden="true"
              >
                <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: '900px' }}>
                  {/* Ring 1 */}
                  <div
                    className="absolute w-[88%] h-[88%] rounded-full border-[5px] border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.25),inset_0_0_30px_rgba(59,130,246,0.12)]"
                    style={{ transform: 'rotateX(72deg)' }}
                  />
                  {/* Ring 2 — spinning dashed */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                    className="absolute w-[73%] h-[73%] rounded-full border-[1.5px] border-dashed border-purple-500/30"
                    style={{ transform: 'rotateX(72deg)' }}
                  />
                  {/* Ring 3 — cyan glow */}
                  <div
                    className="absolute w-[60%] h-[60%] rounded-full border-[3px] border-cyan-400/45 shadow-[0_0_35px_rgba(34,211,238,0.45)]"
                    style={{ transform: 'rotateX(72deg)' }}
                  />
                  {/* Ring 4 — inner cap */}
                  <div
                    className="absolute w-[42%] h-[42%] rounded-full border-2 border-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.65)]"
                    style={{ transform: 'rotateX(72deg)' }}
                  />
                  {/* Hologram beam */}
                  <div
                    className="absolute bottom-[48%] w-[42%] blur-sm pointer-events-none"
                    style={{
                      height: 'clamp(80px,18vh,220px)',
                      background: 'linear-gradient(to top,rgba(34,211,238,0.14),rgba(59,130,246,0.04),transparent)',
                      clipPath: 'polygon(15% 0%,85% 0%,100% 100%,0% 100%)',
                    }}
                    aria-hidden="true"
                  />
                  {/* Rising particles */}
                  {PARTICLES.map((p, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-cyan-300 rounded-full"
                      initial={{ x: p.x, y: 60, opacity: 0, scale: p.scale }}
                      animate={{ y: -80, opacity: [0, 0.75, 0], x: p.x + (i % 2 === 0 ? 10 : -10) }}
                      transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'linear' }}
                    />
                  ))}
                </div>
              </div>

              {/* Floating Hexagonal Logo Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.82, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: [0, -12, 0] }}
                transition={{
                  opacity: { duration: 0.8, delay: 0.3 },
                  scale:   { duration: 0.8, delay: 0.3 },
                  y:       { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 },
                }}
                whileHover={{ scale: 1.04, rotateY: 6, rotateX: -3 }}
                className="relative flex items-center justify-center z-10 cursor-pointer"
                style={{
                  width:  'clamp(140px,22vw,280px)',
                  height: 'clamp(158px,25vw,315px)',
                  transformStyle: 'preserve-3d',
                  perspective: '900px',
                }}
              >
                {/* Hexagon SVG frame */}
                <div className="absolute inset-0 drop-shadow-[0_0_28px_rgba(59,130,246,0.5)]">
                  <svg viewBox="0 0 300 340" className="w-full h-full">
                    <defs>
                      <linearGradient id="hex-border" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#22d3ee" />
                      </linearGradient>
                      <linearGradient id="hex-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#080e25" />
                        <stop offset="100%" stopColor="#02040c" />
                      </linearGradient>
                    </defs>
                    <polygon
                      points="150,15 285,92 285,248 150,325 15,248 15,92"
                      fill="url(#hex-fill)"
                      stroke="url(#hex-border)"
                      strokeWidth="6"
                      strokeLinejoin="round"
                    />
                    <polygon
                      points="150,27 272,97 272,243 150,313 28,243 28,97"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="1.5"
                      strokeOpacity="0.35"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                {/* Logo image */}
                <div className="absolute w-[70%] h-[70%] flex items-center justify-center pointer-events-none p-3">
                  <img
                    src="/logo.png"
                    alt="VR Galaxy Networks"
                    className="w-full h-full object-contain drop-shadow-[0_4px_14px_rgba(59,130,246,0.35)]"
                  />
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Rocky terrain bottom ── */}
      <svg
        viewBox="0 0 1440 130"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-full pointer-events-none select-none z-20"
        style={{ height: 'clamp(60px,9vh,130px)' }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="terrain-fill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#080e26" />
            <stop offset="100%" stopColor="#010205" />
          </linearGradient>
          <linearGradient id="terrain-glow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(59,130,246,0)" />
            <stop offset="35%" stopColor="rgba(168,85,247,0.14)" />
            <stop offset="50%" stopColor="rgba(34,211,238,0.22)" />
            <stop offset="65%" stopColor="rgba(168,85,247,0.14)" />
            <stop offset="100%" stopColor="rgba(59,130,246,0)" />
          </linearGradient>
        </defs>
        {/* Glow horizon */}
        <path d="M0 80 C300 50,550 95,840 42 C1100 90,1280 62,1440 75 L1440 130 L0 130 Z" fill="url(#terrain-glow)" />
        {/* Back ridge */}
        <path d="M0 90 C260 65,570 100,870 55 C1130 105,1290 72,1440 88 L1440 130 L0 130 Z" fill="url(#terrain-fill)" stroke="rgba(34,211,238,0.16)" strokeWidth="1" />
        {/* Foreground soil */}
        <path d="M0 108 C360 92,720 118,1080 96 C1260 108,1360 100,1440 105 L1440 130 L0 130 Z" fill="#010206" />
      </svg>
    </section>
  )
}
