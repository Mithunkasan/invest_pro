'use client'

import { motion } from 'framer-motion'
import { Rocket, ShieldCheck, Zap, Users, Trophy, Coins, Compass } from 'lucide-react'

// Custom Ringed Saturn Planet visual element
const SaturnVisual = () => (
  <svg 
    className="w-16 h-16 opacity-35 absolute left-[8%] top-1/2 -translate-y-1/2 pointer-events-none select-none drop-shadow-[0_0_10px_rgba(168,85,247,0.35)]" 
    viewBox="0 0 100 100"
  >
    <defs>
      <radialGradient id="saturn-grad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#d8b4fe" />
        <stop offset="60%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#3b0764" />
      </radialGradient>
      <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c084fc" stopOpacity="0.75" />
        <stop offset="50%" stopColor="#818cf8" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#312e81" stopOpacity="0" />
      </linearGradient>
    </defs>
    {/* RINGS */}
    <ellipse cx="50" cy="50" rx="36" ry="7" transform="rotate(-18 50 50)" fill="url(#ring-grad)" />
    {/* PLANET BODY */}
    <circle cx="50" cy="50" r="14" fill="url(#saturn-grad)" />
  </svg>
)

// Custom Sparkling Star Element
const SparkleStar = ({ className, delay = 0 }: { className: string, delay?: number }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0.1 }}
    animate={{ 
      scale: [1, 1.3, 1], 
      opacity: [0.3, 0.9, 0.3] 
    }}
    transition={{ 
      duration: 3, 
      repeat: Infinity, 
      delay, 
      ease: "easeInOut" 
    }}
    className={`absolute w-1.5 h-1.5 rounded-full bg-white ${className}`}
  />
)

// Custom Blue Ice Planet visual element
const BlueIcePlanetVisual = () => (
  <svg 
    className="w-10 h-10 opacity-30 absolute right-[12%] top-1/2 -translate-y-1/2 pointer-events-none select-none drop-shadow-[0_0_8px_rgba(56,189,248,0.25)]" 
    viewBox="0 0 100 100"
  >
    <defs>
      <radialGradient id="blue-planet-grad" cx="40%" cy="40%" r="50%">
        <stop offset="0%" stopColor="#7dd3fc" />
        <stop offset="70%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#082f49" />
      </radialGradient>
    </defs>
    <circle cx="50" cy="50" r="12" fill="url(#blue-planet-grad)" />
  </svg>
)

// Cosmic Nebula glow element
const CosmicNebula = () => (
  <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-25">
    <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-14 bg-gradient-to-r from-purple-500/15 via-indigo-500/10 to-transparent blur-3xl rounded-full animate-pulse" />
    <div className="absolute top-1/2 right-1/3 -translate-y-1/2 w-80 h-12 bg-gradient-to-l from-blue-500/15 via-pink-500/8 to-transparent blur-3xl rounded-full" />
  </div>
)

// Ticker Items data list
const tickerItems = [
  { text: "HIGH-YIELD DAILY ROI STARTING FROM 1.5% TO 3.0%", Icon: Rocket, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { text: "100% SECURE & TRANSPARENT LEDGER SYSTEM", Icon: ShieldCheck, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { text: "DECENTRALIZED SPACE REWARDS & COMMUNITY", Icon: Coins, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  { text: "UNLOCK LEVEL-INCOME COMMISSIONS UP TO 3 LEVELS", Icon: Users, color: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
  { text: "STAR PERFORMER & TL RANK AUTOMATED BADGES", Icon: Trophy, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { text: "EXPRESS WITHDRAWALS UNDER 2 HOURS FOR ELITE MEMBERS", Icon: Zap, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
  { text: "GROW YOUR WEALTH WITH VR GALAXY NETWORKS", Icon: Compass, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
]

export function ScrollingStatsBar() {
  return (
    <div 
      className="relative w-full overflow-hidden bg-[#030308] border-y border-white/[0.06] backdrop-blur-md flex items-center justify-start py-5 z-20"
      style={{ height: 'clamp(4.25rem, 8vh, 5.25rem)' }}
    >
      {/* 🔮 Cosmic Space Graphics Background */}
      <CosmicNebula />
      <SaturnVisual />
      <BlueIcePlanetVisual />

      {/* Sparkling Twinkling Stars */}
      <SparkleStar className="left-[5%] top-3" delay={0.2} />
      <SparkleStar className="left-[18%] bottom-3" delay={1.4} />
      <SparkleStar className="left-[35%] top-2" delay={0.7} />
      <SparkleStar className="right-[8%] bottom-2" delay={2.1} />
      <SparkleStar className="right-[22%] top-4" delay={0.9} />
      <SparkleStar className="right-[40%] bottom-3" delay={1.7} />

      {/* 🚀 Seamless Infinite Scrolling Content container */}
      <div className="flex w-full overflow-hidden select-none">
        <div className="flex animate-marquee whitespace-nowrap gap-12 sm:gap-16 min-w-full items-center">
          {/* First loop of tickers */}
          {tickerItems.map((item, index) => (
            <div key={`loop1-${index}`} className="flex items-center gap-3 shrink-0">
              <span className={`p-1.5 rounded-full border ${item.color} flex items-center justify-center`}>
                <item.Icon className="w-4 h-4 shrink-0" />
              </span>
              <span className="font-extrabold text-white/95 uppercase tracking-widest text-[10px] sm:text-xs">
                {item.text}
              </span>
              {/* Star separator */}
              <span className="ml-8 sm:ml-12 text-white/20 select-none text-[8px] sm:text-[10px]">✦</span>
            </div>
          ))}

          {/* Second loop of tickers (identical copy for seamless visual illusion) */}
          {tickerItems.map((item, index) => (
            <div key={`loop2-${index}`} className="flex items-center gap-3 shrink-0">
              <span className={`p-1.5 rounded-full border ${item.color} flex items-center justify-center`}>
                <item.Icon className="w-4 h-4 shrink-0" />
              </span>
              <span className="font-extrabold text-white/95 uppercase tracking-widest text-[10px] sm:text-xs">
                {item.text}
              </span>
              {/* Star separator */}
              <span className="ml-8 sm:ml-12 text-white/20 select-none text-[8px] sm:text-[10px]">✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* Marquee Keyframes Injection */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
      `}</style>
    </div>
  )
}
