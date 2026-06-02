'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Rocket, Play } from 'lucide-react'
import Link from 'next/link'

/* ── Social Icons ── */
const TelegramIcon = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.17.17 0 0 0-.07-.2c-.08-.06-.19-.04-.27-.02-.11.02-1.89 1.2-5.33 3.52-.5.35-.96.52-1.37.51-.45-.01-1.32-.25-1.97-.46-.79-.26-1.42-.4-1.36-.85.03-.23.35-.47.96-.71 3.76-1.64 6.27-2.72 7.54-3.25 3.58-1.48 4.32-1.74 4.81-1.75.11 0 .35.03.5.16.13.12.17.29.19.41z" />
  </svg>
)

const TwitterIcon = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const DiscordIcon = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" />
  </svg>
)

interface HeroSectionProps {
  stats?: {
    membersVal?: string | null
    activeVal?: string | null
    paidVal?: string | null
    rateVal?: string | null
  }
}

export function HeroSection({ stats }: HeroSectionProps) {
  const t = useTranslations('hero')

  const membersVal = stats?.membersVal || t('stats.membersVal')
  const activeVal = stats?.activeVal || t('stats.activeVal')
  const paidVal = stats?.paidVal || t('stats.paidVal')
  const rateVal = stats?.rateVal || t('stats.rateVal')

  return (
    <section
      className="relative w-full overflow-hidden bg-[#02040a] flex flex-col min-h-[100svh] lg:h-[100svh] lg:max-h-[100svh]"
      aria-label="VR Galaxy Networks Hero Section"
    >
      {/* Background Videos */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0 hidden lg:block"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/bg4.mp4" type="video/mp4" />
      </video>
      <video
        className="absolute inset-0 w-full h-full object-cover z-0 block lg:hidden"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/bg5.mp4" type="video/mp4" />
      </video>

      {/* Subtle Dark Overlay for Higher Text Contrast */}
      <div className="absolute inset-0 bg-black/15 pointer-events-none select-none z-10" />

      {/* ── Social Sidebar (desktop only) ── */}
      <div
        className="absolute right-6 xl:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-5 z-40 hidden lg:flex"
        aria-label="Social links"
      >
        {[
          { Icon: TelegramIcon, label: 'Telegram', hoverColor: 'hover:text-[#26a5e4] hover:border-[#26a5e4]/40 hover:shadow-[#26a5e4]/30' },
          { Icon: TwitterIcon,  label: 'Twitter',  hoverColor: 'hover:text-[#1d9bf0] hover:border-[#1d9bf0]/40 hover:shadow-[#1d9bf0]/30' },
          { Icon: DiscordIcon,  label: 'Discord',  hoverColor: 'hover:text-[#5865f2] hover:border-[#5865f2]/40 hover:shadow-[#5865f2]/30' },
        ].map(({ Icon, label, hoverColor }) => (
          <motion.button
            key={label}
            aria-label={label}
            whileHover={{ scale: 1.15, x: -3 }}
            className={`w-11 h-11 rounded-full flex items-center justify-center bg-white/[0.03] border border-white/10 text-white/70 shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md cursor-pointer transition-all duration-300 ${hoverColor}`}
          >
            <Icon />
          </motion.button>
        ))}
      </div>

      {/* ── Main Content (vertically + horizontally centered) ── */}
      <div className="relative z-30 flex-1 flex lg:items-center items-start w-full overflow-visible">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-20 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* ── LEFT COLUMN ── */}
            <div className="lg:col-span-7 flex flex-col items-start text-left w-full min-w-0">

              {/* Welcome badge */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                className="flex flex-wrap items-center gap-1 mb-4 font-extrabold uppercase tracking-widest"
                style={{ fontSize: 'clamp(10px,1.2vw,13px)' }}
              >
                <span className="text-white/80">{t('welcomePrefix')}</span>
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {t('welcomeSuffix')}
                </span>
              </motion.div>

              {/* Giant stacked headings (semantic h1 for SEO) */}
              <motion.h1
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.12 }
                  }
                }}
                className="flex flex-col gap-1 mb-5 font-black tracking-tight leading-[0.9] w-full min-w-0"
                style={{ fontSize: 'clamp(2.4rem, 6.2vw, 4.8rem)' }}
              >
                {[
                  { key: 'title1', className: 'text-white' },
                  { key: 'title2', className: 'text-white' },
                  {
                    key: 'title3',
                    className:
                      'bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.55)]',
                  },
                ].map(({ key, className }) => (
                  <motion.span
                    key={key}
                    variants={{
                      hidden: { opacity: 0, x: -25 },
                      visible: { opacity: 1, x: 0, transition: { duration: 0.65 } }
                    }}
                    className={className}
                  >
                    {t(key as 'title1' | 'title2' | 'title3')}
                  </motion.span>
                ))}
              </motion.h1>

              {/* Subtitle (semantic h2 for SEO) */}
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.42 }}
                className="text-slate-300 leading-relaxed font-semibold mb-6 max-w-xl text-balance"
                style={{ fontSize: 'clamp(0.85rem,1.5vw,1.1rem)' }}
              >
                {t('subtitle')}
              </motion.h2>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.52 }}
                className="flex flex-wrap gap-4 w-full mb-8"
              >
                <Link href="/register" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto rounded-full font-extrabold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 transition-all duration-300 shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:shadow-[0_0_35px_rgba(59,130,246,0.65)] border border-white/10 gap-2 cursor-pointer"
                    style={{ height: 'clamp(2.75rem,5.5vh,3.5rem)', fontSize: 'clamp(0.85rem,1.3vw,1rem)', paddingLeft: 'clamp(1.5rem,2.5vw,2.2rem)', paddingRight: 'clamp(1.5rem,2.5vw,2.2rem)' }}
                  >
                    {t('cta')}
                    <Rocket className="w-4.5 h-4.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                  </Button>
                </Link>
                <Link href="/plans" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto rounded-full font-extrabold text-white bg-black/35 border border-white/20 hover:border-white/40 hover:bg-white/10 transition-all duration-300 gap-2 cursor-pointer"
                    style={{ height: 'clamp(2.75rem,5.5vh,3.5rem)', fontSize: 'clamp(0.85rem,1.3vw,1rem)', paddingLeft: 'clamp(1.5rem,2.5vw,2.2rem)', paddingRight: 'clamp(1.5rem,2.5vw,2.2rem)' }}
                  >
                    {t('ctaSecondary')}
                    <Play className="w-4 h-4 fill-white text-white shrink-0" />
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
                <div className="flex items-center gap-2 mb-4">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                  </span>
                  <span
                    className="font-black tracking-widest text-slate-300 uppercase"
                    style={{ fontSize: 'clamp(9px,1vw,11px)' }}
                  >
                    {t('liveStats')}
                  </span>
                </div>

                {/* Clean inline stats row matching the reference layout */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-5 gap-x-0 w-full">
                  {[
                    { val: membersVal, label: t('stats.members') },
                    { val: activeVal,  label: t('stats.active') },
                    { val: paidVal,    label: t('stats.paid') },
                    { val: rateVal,    label: t('stats.rate') },
                  ].map(({ val, label }, i) => (
                    <div
                      key={i}
                      className={`flex flex-col justify-center ${
                        i % 2 === 0 ? 'pr-4' : 'pl-4 border-l border-white/10'
                      } sm:pl-6 sm:pr-6 sm:first:pl-0 sm:border-l-0 sm:border-r sm:border-white/10 sm:last:border-0`}
                    >
                      <span
                        className="font-black text-white leading-none mb-1.5"
                        style={{ fontSize: 'clamp(1.1rem, 2.2vw, 1.6rem)' }}
                      >
                        {val}
                      </span>
                      <span
                        className="text-slate-400 font-bold tracking-wider uppercase"
                        style={{ fontSize: 'clamp(8px, 0.9vw, 10px)' }}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Mobile social icons */}
              <div className="flex items-center gap-4 mt-6 lg:hidden" aria-label="Social links">
                {[
                  { Icon: TelegramIcon, label: 'Telegram' },
                  { Icon: TwitterIcon,  label: 'Twitter' },
                  { Icon: DiscordIcon,  label: 'Discord' },
                ].map(({ Icon, label }) => (
                  <motion.button
                    key={label}
                    aria-label={label}
                    whileTap={{ scale: 0.92 }}
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.05] border border-white/15 text-white/80 backdrop-blur-md"
                  >
                    <Icon />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* ── RIGHT COLUMN (Empty Spacer to reveal the background image pedestal/logo) ── */}
            <div className="lg:col-span-5 hidden lg:block w-full min-w-0" />

          </div>
        </div>
      </div>
    </section>
  )
}
