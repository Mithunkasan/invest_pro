'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { AnimatedGalaxyBackground } from '@/components/common/AnimatedGalaxyBackground'
import { Users, Award, Shield, Sparkles, BookOpen, Compass, Target, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function AboutClient() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Track scroll progress of the entire page or specifically the hero container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Transforms for split text animation
  // Text will split: "VR Galaxy" goes left, "Network" goes right
  const leftX = useTransform(scrollYProgress, [0, 0.45], [0, -350])
  const rightX = useTransform(scrollYProgress, [0, 0.45], [0, 350])
  const textOpacity = useTransform(scrollYProgress, [0, 0.35, 0.45], [1, 0.8, 0])
  const textScale = useTransform(scrollYProgress, [0, 0.45], [1, 0.9])
  
  // Background parallax scale / fade
  const bgScale = useTransform(scrollYProgress, [0, 0.6], [1, 1.1])
  const bgOpacity = useTransform(scrollYProgress, [0, 0.6], [0.85, 0.5])

  // Subtitle fade
  const subtitleOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0])
  
  return (
    <div ref={containerRef} className="relative min-h-[220vh] bg-[#03000a] text-white overflow-hidden">
      {/* ── Animated Background ── */}
      <AnimatedGalaxyBackground />

      {/* ── 1. Hero Sticky Section ── */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center items-center overflow-hidden z-20">
        
        {/* Galaxy themed background with pan/zoom animation */}
        <motion.div 
          className="absolute inset-0 bg-cover bg-center mix-blend-screen" 
          style={{ 
            backgroundImage: "url('/membership_hero1.jpeg')",
            scale: bgScale,
            opacity: bgOpacity
          }}
        />
        {/* Dark radial overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#03000a]/75 via-[#03000a]/90 to-[#03000a] z-0" />

        {/* Hero content container */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col justify-center items-center h-full pointer-events-none select-none">
          <motion.span 
            style={{ opacity: subtitleOpacity }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-primary/10 border border-primary/20 text-primary uppercase tracking-widest mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Who We Are
          </motion.span>
          
          <motion.h1 
            style={{ opacity: subtitleOpacity }}
            className="text-white/60 text-sm sm:text-base font-black tracking-widest uppercase mb-1"
          >
            About
          </motion.h1>
          
          {/* Main Title that splits */}
          <motion.div 
            style={{ opacity: textOpacity, scale: textScale }}
            className="text-4xl sm:text-7xl md:text-8xl font-black tracking-tight uppercase flex flex-col sm:flex-row items-center justify-center gap-x-6 gap-y-2 leading-none"
          >
            <motion.span style={{ x: leftX }} className="bg-gradient-to-r from-white via-indigo-100 to-indigo-200 bg-clip-text text-transparent">
              VR 
            </motion.span>
            <motion.span style={{ x: rightX }} className="bg-gradient-to-r from-indigo-300 to-blue-400 bg-clip-text text-transparent">
              Galaxy
            </motion.span>
          </motion.div>

          <motion.p 
            style={{ opacity: subtitleOpacity }}
            className="text-white/60 text-sm sm:text-base max-w-xl mx-auto mt-6 leading-relaxed font-semibold"
          >
            Scroll down to explore our story, our vision, and the technology powering our digital community.
          </motion.p>
          
          {/* Scroll Indicator */}
          <motion.div 
            style={{ opacity: subtitleOpacity }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Scroll Down</span>
            <div className="w-5 h-8 border border-white/20 rounded-full flex justify-center p-1">
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-1 h-2 bg-primary rounded-full"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── 2. Content Sections Wrapper (Fades in over sticky background) ── */}
      <div className="relative z-30 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 space-y-36 -mt-20">
        
        {/* ── Section 1: Our Story ── */}
        <section id="our-story" className="scroll-mt-24">
          <div className="premium-card p-8 sm:p-12 bg-brand-950/50 border border-white/5 backdrop-blur-md relative overflow-hidden rounded-3xl shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full filter blur-3xl opacity-30 pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-600/10 rounded-full filter blur-3xl opacity-20 pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-7 space-y-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-purple-500/10 border border-purple-500/20 text-purple-400 uppercase tracking-widest">
                  <BookOpen className="w-3 h-3" />
                  Our Genesis
                </span>
                
                <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-wide bg-gradient-to-r from-white via-indigo-100 to-blue-200 bg-clip-text text-transparent">
                  Our Story
                </h2>
                <div className="h-1 w-16 bg-primary rounded-full" />
                
                <p className="text-white/70 text-sm sm:text-base leading-relaxed font-medium">
                  VR Galaxy Network was conceived by a team of visionary technologists and community builders who recognized a gap in the digital landscape. Traditional social platforms offered connection but lacked collaborative growth frameworks. We set out to create a unified network where community builders, digital enthusiasts, and technology leaders could connect, learn, and grow together.
                </p>
                <p className="text-white/60 text-sm leading-relaxed font-medium">
                  Since our inception, our focus has been entirely on user experience, stability, and digital synergy. By combining secure peer-to-peer systems, verified communication pipelines, and customized growth tiers, we have built a thriving space for individuals to scale their networks and leverage modern collaboration tools.
                </p>
              </div>

              <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                {[
                  { value: '25K+', label: 'Active Members', icon: Users },
                  { value: '5+', label: 'Digital Hubs', icon: Compass },
                  { value: '99.9%', label: 'Platform Uptime', icon: Shield },
                  { value: '100%', label: 'Secure Ledgers', icon: Award },
                ].map((stat, i) => (
                  <div key={i} className="premium-card p-6 bg-brand-950/70 border border-white/5 rounded-2xl text-center flex flex-col items-center justify-center hover:border-primary/20 hover:scale-[1.02] transition-all duration-300">
                    <stat.icon className="w-5 h-5 text-primary mb-2" />
                    <div className="text-2xl sm:text-3xl font-black text-white">{stat.value}</div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 font-bold uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 2: Informative / Vision & Pillars ── */}
        <section id="vision" className="scroll-mt-24">
          <div className="premium-card p-8 sm:p-12 bg-brand-950/50 border border-white/5 backdrop-blur-md relative overflow-hidden rounded-3xl shadow-2xl">
            <div className="absolute top-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full filter blur-3xl opacity-20 pointer-events-none" />
            <div className="absolute -bottom-20 right-0 w-80 h-80 bg-purple-600/10 rounded-full filter blur-3xl opacity-30 pointer-events-none" />

            <div className="space-y-12 relative z-10">
              <div className="text-center max-w-xl mx-auto space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-blue-500/10 border border-blue-500/20 text-blue-400 uppercase tracking-widest mx-auto">
                  <Target className="w-3 h-3" />
                  Our Compass
                </span>
                
                <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-wide">
                  Vision &amp; Core Pillars
                </h2>
                <div className="h-1 w-16 bg-primary mx-auto rounded-full" />
                <p className="text-white/60 text-xs sm:text-sm font-medium">
                  We base our platform evolution on trust, technological excellence, and decentralized collaboration.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Shield,
                    title: "Security First Approach",
                    desc: "We prioritize advanced data protection, encrypted authentication tokens, and direct peer-to-peer verification protocols to keep our community accounts safe."
                  },
                  {
                    icon: Users,
                    title: "Community Synergy",
                    desc: "A collaborative digital ecosystem that empowers members to coordinate networking events, establish leadership status, and scale organizations globally."
                  },
                  {
                    icon: Sparkles,
                    title: "Technological Edge",
                    desc: "Building on responsive frontend layers, reliable database clusters, and secure APIs to ensure seamless page navigation and fast load times."
                  }
                ].map((pillar, i) => (
                  <div key={i} className="premium-card p-6 bg-brand-950/70 border border-white/5 rounded-2xl flex flex-col justify-between hover:border-primary/30 transition-all duration-300 hover:scale-[1.01]">
                    <div className="space-y-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                        <pillar.icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-extrabold text-sm sm:text-base text-white/90">{pillar.title}</h3>
                      <p className="text-xs text-white/60 leading-relaxed font-medium">{pillar.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Call to Action Inside About */}
              <div className="pt-6 text-center">
                <Link href="/membership-plans">
                  <button className="px-8 py-3.5 rounded-full font-black text-xs uppercase tracking-widest text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer mx-auto">
                    Explore Membership Plans
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
