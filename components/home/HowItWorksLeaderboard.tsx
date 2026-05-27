'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronRight, CheckCircle2 } from 'lucide-react'

// Custom SVGs for Avatars & Badges
const PriyaBadge = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" aria-hidden="true">
    <defs>
      <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="50%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#ca8a04" />
      </linearGradient>
      <linearGradient id="innerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#fef08a" />
      </linearGradient>
    </defs>
    <path
      d="M24 4L8 10v14c0 9.8 6.8 19 16 20 9.2-1 16-10.2 16-20V10L24 4z"
      fill="url(#badgeGrad)"
    />
    <path
      d="M24 8L12 12.5v11.5c0 7.8 5.1 15 12 16 6.9-1 12-8.2 12-16V12.5L24 8z"
      fill="#0d153b"
      opacity="0.9"
    />
    <polygon
      points="24,14 27,20 34,20 28.5,24 31,30 24,26 17,30 19.5,24 14,20 21,20"
      fill="url(#innerGrad)"
    />
  </svg>
)

export function HowItWorksLeaderboard() {
  const leaderboard = [
    {
      rank: 1,
      name: 'Arjun K.',
      amount: '₹12,45,000',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
      isBadge: false,
    },
    {
      rank: 2,
      name: 'Priya S.',
      amount: '₹9,80,000',
      avatar: '',
      isBadge: true,
    },
    {
      rank: 3,
      name: 'Vikram R.',
      amount: '₹7,35,000',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
      isBadge: false,
    },
  ]

  return (
    <section className="relative w-full bg-transparent py-16 sm:py-20 overflow-hidden" aria-label="Decentralized Yield Generation and Top Earners Leaderboard">
      {/* Background container grid lines */}
      <div className="absolute inset-0 pointer-events-none select-none z-0" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(59,130,246,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.5) 1px,transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── Overarching Section Header for SEO & Aesthetics ── */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs sm:text-sm font-black tracking-[0.22em] uppercase mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            DECENTRALIZED COMMUNITY & HIGH-YIELD ROI
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="text-white font-extrabold tracking-tight mb-4"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}
          >
            How to Build Passive Income & Track Your Ranks
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="text-slate-400 max-w-2xl mx-auto font-semibold leading-relaxed"
            style={{ fontSize: 'clamp(0.85rem, 1.5vw, 1.05rem)' }}
          >
            Setup your account, invite your peer network, generate consistent high-frequency daily rewards, and rise to the top of our real-time investor leaderboard.
          </motion.p>
        </div>

        {/* ── Row 1: Fully Responsive Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch mb-10">
          
          {/* Card 1: How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="col-span-1 md:col-span-12 lg:col-span-5 rounded-3xl border border-blue-500/20 bg-[#04081c]/60 backdrop-blur-xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden"
          >
            {/* Top lighting effect */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <p className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-purple-400 mb-2">
                HOW TO EARN
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-8 tracking-tight">
                3 Simple Steps
              </h3>

              {/* Steps Layout */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-8 sm:gap-4 mt-4 relative z-10">
                
                {/* Step 1 */}
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1 min-w-0">
                  <div className="w-16 h-16 rounded-full border border-blue-500/40 bg-[#081235]/50 flex items-center justify-center text-2xl font-black text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-transform hover:scale-105 duration-300 shrink-0">
                    1
                  </div>
                  <h4 className="text-base font-extrabold text-white mt-4">Join</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-[150px] leading-relaxed">
                    Create a secure wallet and activate your plan.
                  </p>
                </div>

                {/* Arrow 1-2 */}
                <div className="text-blue-500/40 font-bold text-xl sm:rotate-0 rotate-90 shrink-0 self-center hidden sm:block">
                  →
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1 min-w-0">
                  <div className="w-16 h-16 rounded-full border border-blue-500/40 bg-[#081235]/50 flex items-center justify-center text-2xl font-black text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-transform hover:scale-105 duration-300 shrink-0">
                    2
                  </div>
                  <h4 className="text-base font-extrabold text-white mt-4">Promote</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-[150px] leading-relaxed">
                    Share your high-yield referral link with peers.
                  </p>
                </div>

                {/* Arrow 2-3 */}
                <div className="text-blue-500/40 font-bold text-xl sm:rotate-0 rotate-90 shrink-0 self-center hidden sm:block">
                  →
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1 min-w-0">
                  <div className="w-16 h-16 rounded-full border border-purple-500/40 bg-[#160a2d]/50 flex items-center justify-center text-2xl font-black text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-transform hover:scale-105 duration-300 shrink-0">
                    3
                  </div>
                  <h4 className="text-base font-extrabold text-white mt-4">Earn</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-[150px] leading-relaxed">
                    Collect daily ROI payouts & task rewards.
                  </p>
                </div>

              </div>
            </div>
          </motion.div>

          {/* Visual 2: Hologram Globe (Center Column) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="col-span-1 md:col-span-5 lg:col-span-3 flex items-center justify-center relative min-h-[300px] lg:min-h-0 py-6 lg:py-0"
          >
            {/* Soft background blue glow behind globe */}
            <div className="absolute w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none" />

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-full max-w-[280px] aspect-square flex items-center justify-center"
            >
              <Image
                src="/hologram_globe.png"
                alt="Glowing Futuristic Holographic Globe representing VR Galaxy P2P community network"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 280px"
                className="object-contain filter drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]"
              />
            </motion.div>
          </motion.div>

          {/* Card 3: 100% Responsive Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="col-span-1 md:col-span-7 lg:col-span-4 rounded-3xl border border-blue-500/20 bg-[#04081c]/60 backdrop-blur-xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden"
          >
            {/* Top lighting effect */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <p className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-purple-400 mb-2">
                TOP EARNERS
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-6 tracking-tight">
                Leaderboard
              </h3>

              {/* Leaderboard Track/List (No overflow, fully responsive) */}
              <div className="flex flex-col gap-3.5 relative z-10 w-full">
                {leaderboard.map((user) => (
                  <div
                    key={user.rank}
                    className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#060b21]/70 border border-blue-950/40 hover:border-blue-700/30 transition-all duration-300 group hover:-translate-y-0.5 w-full min-w-0"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-sm font-bold text-slate-500 w-4 text-center shrink-0">
                        {user.rank}
                      </span>
                      
                      {/* Avatar shrink protection */}
                      <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
                        {user.isBadge ? (
                          <PriyaBadge />
                        ) : (
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-blue-500/30 relative">
                            <Image
                              src={user.avatar}
                              alt={`${user.name} Profile`}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>

                      {/* Truncate name safely on very small widths to avoid layout break */}
                      <span className="text-sm sm:text-base font-extrabold text-slate-200 group-hover:text-white transition-colors truncate">
                        {user.name}
                      </span>
                    </div>

                    {/* Amount padding and shrink protection */}
                    <span className="text-sm sm:text-base font-bold font-mono text-slate-100 group-hover:text-blue-400 transition-colors shrink-0 pl-3">
                      {user.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom View All Link */}
            <div className="text-center mt-6 relative z-10">
              <Link
                href="/register"
                className="inline-flex items-center gap-1 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors group"
              >
                View All Top Earners
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </motion.div>

        </div>

        {/* ── Row 2: Bottom CTA Journey Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 rounded-3xl border border-blue-500/20 bg-gradient-to-r from-[#030616] via-[#050b28] to-[#030616] p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
        >
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(rgba(59,130,246,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.6) 1px,transparent 1px)',
              backgroundSize: '30px 30px',
            }}
          />
          {/* Side glowing lights inside banner */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-48 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-48 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Left: Floating Rocket */}
          <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 text-center sm:text-left">
            <motion.div
              animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-16 h-16 md:w-20 md:h-20 shrink-0"
            >
              <Image
                src="/rocket_cta.png"
                alt="Premium 3D Glowing Space Rocket taking off to indicate high earnings trajectory"
                fill
                sizes="(max-width: 768px) 64px, 80px"
                className="object-contain filter drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]"
              />
            </motion.div>

            {/* Middle: Text Block */}
            <div className="flex flex-col gap-1">
              <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Ready to Start Your Passive Yield Journey?
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
                Deposit funds securely, invite your peer network, and track your consistent daily ROI payouts. Secure your slot today!
              </p>
            </div>
          </div>

          {/* Right: Join Now Button */}
          <div className="w-full md:w-auto relative z-10 shrink-0">
            <Link href="/register" className="block w-full">
              <button
                className="w-full md:w-auto font-bold text-white px-8 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 shadow-[0_0_20px_rgba(168,85,247,0.45)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] cursor-pointer"
              >
                Join Now
                <ArrowRight className="w-5 h-5 shrink-0" />
              </button>
            </Link>
          </div>

        </motion.div>

      </div>
    </section>
  )
}
