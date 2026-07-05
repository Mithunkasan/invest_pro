'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import Link from 'next/link'
import { CurrencyClock } from '@/components/common/CurrencyClock'
import { AnimatedGalaxyBackground } from '@/components/common/AnimatedGalaxyBackground'
import { 
  Users, 
  Zap, 
  Award, 
  Shield, 
  Target, 
  Briefcase, 
  Compass, 
  ArrowRight,
  CheckCircle2,
  Layers,
  Sparkles,
  Share2,
  ChevronRight
} from 'lucide-react'

// Configuration for card spring physics
const springValues = {
  damping: 30,
  stiffness: 100,
  mass: 2
}

// Stagger and fadeInUp animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
} as const

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
} as const

// Function to clean features descriptions of prohibited words
function sanitizeFeatures(features: string[]): string[] {
  const prohibitedWords = [
    { regex: /roi/gi, replacement: 'Earning Platform' },
    { regex: /investment/gi, replacement: 'Earning Platform' },
    { regex: /invest/gi, replacement: 'Join' },
    { regex: /return/gi, replacement: 'Reward' },
    { regex: /profit/gi, replacement: 'Reward' },
    { regex: /income/gi, replacement: 'Reward' },
    { regex: /yield/gi, replacement: 'Engagement Reward' },
    { regex: /dividend/gi, replacement: 'Bonus' },
    { regex: /daily/gi, replacement: 'Regular' },
  ]

  return features.map(feature => {
    let sanitized = feature
    for (const { regex, replacement } of prohibitedWords) {
      sanitized = sanitized.replace(regex, replacement)
    }
    return sanitized
  })
}

// Plan Card Component with 3D Tilt effect and custom background image
function MembershipPlanCard({ plan }: { plan: any }) {
  const ref = useRef<HTMLDivElement>(null)

  // Spring values for mouse rotation effect
  const rotateX = useSpring(useMotionValue(0), springValues)
  const rotateY = useSpring(useMotionValue(0), springValues)
  const scale = useSpring(1, springValues)

  const rotateAmplitude = 8
  const scaleOnHover = 1.025

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return
    if (window.innerWidth < 640) return

    const rect = ref.current.getBoundingClientRect()
    const offsetX = e.clientX - rect.left - rect.width / 2
    const offsetY = e.clientY - rect.top - rect.height / 2

    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude

    rotateX.set(rotationX)
    rotateY.set(rotationY)
  }

  function handleMouseEnter() {
    if (window.innerWidth < 640) return
    scale.set(scaleOnHover)
  }

  function handleMouseLeave() {
    scale.set(1)
    rotateX.set(0)
    rotateY.set(0)
  }

  const sanitizedFeatures = sanitizeFeatures(plan.features)

  return (
    <motion.article
      ref={ref}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      variants={fadeInUp}
      style={{
        rotateX,
        rotateY,
        scale,
        transformStyle: 'preserve-3d',
      }}
      className="premium-card flex flex-col justify-between overflow-hidden border border-white/5 bg-brand-950/45 hover:border-primary/45 transition-all duration-300 hover:shadow-[0_12px_35px_rgba(168,85,247,0.2)] group relative min-h-[500px] rounded-2xl"
      aria-label={`${plan.name} Plan Card`}
    >
      <div className="relative z-10 flex flex-col justify-between h-full flex-1">
        <div>
          {/* Card Top / Header Graphic Block */}
          <div 
            className="h-40 relative overflow-hidden flex flex-col justify-center items-center border-b border-white/5"
            style={{ background: `linear-gradient(135deg, ${plan.color}15, ${plan.color}05)` }}
          >
            <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30 pointer-events-none" style={{ backgroundImage: "url('/card.jpeg')" }} />
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full filter blur-2xl opacity-25 pointer-events-none" style={{ backgroundColor: plan.color }} />
            <div className="absolute -left-6 -bottom-6 w-16 h-16 rounded-full filter blur-2xl opacity-15 pointer-events-none" style={{ backgroundColor: plan.color }} />
            
            <div className="absolute top-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-1.5" style={{ backgroundColor: plan.color }} />
            
            <span className="text-[10px] tracking-widest font-black uppercase text-white/40 mb-1">Tier Plan</span>
            <h3 className="text-2xl font-black uppercase tracking-wider text-center px-4" style={{ color: plan.color }}>
              {plan.name}
            </h3>
          </div>

          <div className="p-6 space-y-6">
            {/* Price Section */}
            <div className="flex justify-between items-baseline border-b border-white/5 pb-4">
              <span className="text-[10px] text-white/45 font-black uppercase tracking-wider">Fee Amount</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-sm font-black text-white/70">₹</span>
                <span className="text-3xl font-extrabold text-white">
                  {plan.price.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Features list */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-primary" aria-hidden="true" /> Key Features
              </h4>
              <ul className="space-y-2.5">
                {sanitizedFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-white/70 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Join Action Button */}
        <div className="p-6 pt-0">
          <Link href="/register" className="block w-full" aria-label={`Register for the ${plan.name} tier`}>
            <button 
              className="w-full py-3 px-4 rounded-xl text-center text-xs font-black uppercase tracking-widest text-white transition-all duration-300 hover:scale-[1.02] cursor-pointer hover:shadow-lg flex items-center justify-center gap-1.5"
              style={{ 
                background: `linear-gradient(135deg, ${plan.color}, ${plan.color}dd)`,
                boxShadow: `0 4px 14px ${plan.color}33`
              }}
            >
              Join Tier
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </button>
          </Link>
        </div>
      </div>
    </motion.article>
  )
}

export function MembershipPlansClient({ plans }: { plans: any[] }) {
  const heroChecklist = [
    'Access a range of exclusive membership benefits and platforms.',
    'Avail benefits that support community networking and stability.',
    'Simple registration process for eligible individuals.'
  ]

  return (
    <main className="min-h-screen bg-[#03000a] text-white pb-24 relative overflow-hidden">
      {/* ── Galaxy Animated Background ── */}
      <AnimatedGalaxyBackground />

      <div className="relative z-10">
        {/* ── 1. Hero Section Wrapper with background image ── */}
        <section 
          aria-labelledby="membership-hero-heading"
          className="relative bg-cover bg-center border-b border-white/5 overflow-hidden" 
          style={{ backgroundImage: "url('/membership_hero1.jpeg')" }}
        >
          {/* Dark radial overlay to ensure readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#03000a]/80 via-[#03000a]/90 to-[#03000a] z-0" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
            >
              {/* Left Column: Heading & Content */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <motion.span 
                  variants={fadeInUp}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-primary/10 border border-primary/20 text-primary uppercase tracking-widest animate-pulse"
                >
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  Community Growth Platform
                </motion.span>
                
                <motion.h1 
                  id="membership-hero-heading"
                  variants={fadeInUp}
                  className="text-4xl sm:text-6xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-indigo-200 to-blue-200 bg-clip-text text-transparent"
                >
                  Membership Plans
                </motion.h1>
                
                {/* Checklist from reference style */}
                <motion.ul 
                  variants={staggerContainer}
                  className="space-y-3 pt-2"
                >
                  {heroChecklist.map((item, idx) => (
                    <motion.li 
                      key={idx} 
                      variants={fadeInUp}
                      className="flex items-center gap-3 text-white/80 font-medium text-sm sm:text-base"
                    >
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </div>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </motion.ul>

                <motion.p 
                  variants={fadeInUp}
                  className="text-white/60 text-sm sm:text-base leading-relaxed font-medium pt-2 max-w-2xl"
                >
                  Join our business growth platform and thrive within our online community. VR Galaxy Networks offers premier membership plans designed to foster community growth, business networking, team building, and leadership development. Experience enhanced digital earning opportunities and earn generous referral rewards as you build your network.
                </motion.p>

                {/* Action Buttons in a Row */}
                <motion.div 
                  variants={fadeInUp}
                  className="flex flex-col sm:flex-row gap-4 pt-4"
                >
                  <Link href="#plans" className="w-full sm:w-auto" aria-label="View types of membership plans">
                    <button className="w-full sm:w-auto px-8 py-3.5 rounded-full font-black text-xs uppercase tracking-widest text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 transition-all duration-300 shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(59,130,246,0.5)] border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer">
                      Join Membership
                      <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </Link>
                  <Link href="#features" className="w-full sm:w-auto" aria-label="Explore membership features">
                    <button className="w-full sm:w-auto px-8 py-3.5 rounded-full font-black text-xs uppercase tracking-widest text-white bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer">
                      Explore Features
                    </button>
                  </Link>
                </motion.div>
              </div>

              {/* Right Column: Currency Analog Clock */}
              <motion.div 
                variants={fadeInUp}
                className="lg:col-span-5 flex justify-center items-center"
              >
                <CurrencyClock />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── 2. Membership Plans Section ────────────────────────────────── */}
        <section 
          id="plans" 
          aria-labelledby="plans-title"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 space-y-3"
          >
            <h2 id="plans-title" className="text-3xl sm:text-4xl font-black uppercase tracking-wide">
              Types of Membership Plans
            </h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
            <p className="text-white/60 max-w-xl mx-auto text-sm font-medium">
              Select a membership tier that aligns with your community and professional networking goals.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {plans.map((plan) => (
              <MembershipPlanCard key={plan.id} plan={plan} />
            ))}
          </motion.div>
        </section>

        {/* ── 3. Features Section ────────────────────────────────────────── */}
        <section 
          id="features" 
          aria-labelledby="features-title"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 space-y-3"
          >
            <h2 id="features-title" className="text-3xl sm:text-4xl font-black uppercase tracking-wide">
              Features of Membership Plans
            </h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
            <p className="text-white/60 max-w-xl mx-auto text-sm font-medium">
              Discover the dynamic capabilities built directly into your membership tier.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                title: "Community Networking Opportunities",
                desc: [
                  "Direct coordinates to local, regional, and national networking events.",
                  "Exclusive access to specialized discussion forums and circles.",
                  "Build long-term joint ventures and collaborations with top builders."
                ],
                icon: Users,
                color: "text-blue-500",
                bg: "bg-blue-500/10"
              },
              {
                title: "Digital Earning Activities",
                desc: [
                  "Participate in community tasks and reward-oriented campaigns.",
                  "Help expand community engagement on interactive platform systems.",
                  "Receive regular rewards directly credited based on membership parameters."
                ],
                icon: Zap,
                color: "text-amber-500",
                bg: "bg-amber-500/10"
              },
              {
                title: "Leadership Development Programs",
                desc: [
                  "Unlock high-end corporate training modules and certificates.",
                  "Receive professional executive mentorship from platform directors.",
                  "Qualify for organizational ranks and lead regional networks."
                ],
                icon: Award,
                color: "text-emerald-500",
                bg: "bg-emerald-500/10"
              },
              {
                title: "Referral Reward Opportunities",
                desc: [
                  "Build recurring rewards through direct and indirect community invites.",
                  "Unlock up to three separate reward layers for maximum leveraging.",
                  "Earn commissions credited instantly to your secure reward wallet."
                ],
                icon: Share2,
                color: "text-purple-500",
                bg: "bg-purple-500/10"
              },
              {
                title: "Team Growth Support",
                desc: [
                  "Access promotional templates, landing pages, and business assets.",
                  "Leverage duplicate systems to build large sales and support networks.",
                  "Get team-building assistance from dedicated coaches."
                ],
                icon: Target,
                color: "text-rose-500",
                bg: "bg-rose-500/10"
              },
              {
                title: "Business Expansion Resources",
                desc: [
                  "Unlock tools to launch, publicize, and scale your personal company.",
                  "Showcase products in member directories and exclusive marketplaces.",
                  "Fulfill marketing tasks using advanced platform analytics."
                ],
                icon: Briefcase,
                color: "text-indigo-500",
                bg: "bg-indigo-500/10"
              },
              {
                title: "Member Recognition Programs",
                desc: [
                  "Earn leadership ranks such as Star Performer, Double Star, and Director.",
                  "Get recognition on monthly leaderboard boards and national newsletters.",
                  "Earn invitations to annual VR Galaxy Networks international conventions."
                ],
                icon: Compass,
                color: "text-cyan-500",
                bg: "bg-cyan-500/10"
              },
              {
                title: "Secure & User-Friendly Platform",
                desc: [
                  "Experience a dashboard featuring multi-factor encryption security.",
                  "Track structure growth, rewards, and plans in a beautiful interactive UI.",
                  "Receive instant assistance via advanced chat ticket systems."
                ],
                icon: Shield,
                color: "text-teal-500",
                bg: "bg-teal-500/10"
              }
            ].map((feat, idx) => (
              <motion.article 
                key={idx} 
                variants={fadeInUp}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="premium-card p-6 bg-brand-950/40 border border-white/5 space-y-4 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group rounded-2xl"
              >
                <div className={`w-12 h-12 rounded-xl ${feat.bg} ${feat.color} flex items-center justify-center`}>
                  <feat.icon className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors">
                  {feat.title}
                </h3>
                <ul className="space-y-2.5 text-xs text-white/60 leading-relaxed pt-2">
                  {feat.desc.map((pt, pIdx) => (
                    <li key={pIdx} className="flex gap-2">
                      <span className="text-primary font-bold" aria-hidden="true">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </motion.div>
        </section>

        {/* ── 4. Benefits Section ────────────────────────────────────────── */}
        <section 
          id="benefits" 
          aria-labelledby="benefits-title"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 space-y-3"
          >
            <h2 id="benefits-title" className="text-3xl sm:text-4xl font-black uppercase tracking-wide">
              Benefits of Membership Plans
            </h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
            <p className="text-white/60 max-w-xl mx-auto text-sm font-medium">
              Being a member opens exclusive advantages that support your personal growth.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                title: "Access to Exclusive Member Resources",
                desc: "Gain entry to premium blueprints, digital learning libraries, and private tools specifically reserved to support active community members."
              },
              {
                title: "Enhanced Networking Opportunities",
                desc: "Direct access to high-value networks, monthly mixers, and top builders' circles to connect, collaborate, and expand your business."
              },
              {
                title: "Community Growth Participation",
                desc: "Active members receive regular rewards for participating in and driving community-building campaigns."
              },
              {
                title: "Personal Development Support",
                desc: "Access webinars, soft skills training, public speaking seminars, and financial literacy workshops to accelerate personal development."
              },
              {
                title: "Leadership Recognition Opportunities",
                desc: "Grow your rank to unlock custom titles, direct team assignments, special bonuses, and platform leadership coordination."
              },
              {
                title: "Long-Term Business Development",
                desc: "A stable platform that serves as a long-term catalyst to build networks, promote branding, and expand business opportunities."
              },
              {
                title: "Reward-Based Engagement Activities",
                desc: "Earn regular bonuses and rewards for community engagement, platform feedback, and educational content contribution."
              },
              {
                title: "Strong Member Support System",
                desc: "Dedicated account support managers, priority troubleshooting, and quick assistance channels to ensure a smooth, worry-free platform experience."
              }
            ].map((benefit, idx) => (
              <motion.article 
                key={idx} 
                variants={fadeInUp}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="premium-card p-6 bg-gradient-to-br from-brand-950/45 to-brand-950/10 border border-white/5 hover:border-primary/20 hover:shadow-md transition-all duration-300 flex flex-col justify-between rounded-2xl"
                aria-label={`Benefit ${idx + 1}: ${benefit.title}`}
              >
                <div className="space-y-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-black border border-primary/20" aria-hidden="true">
                    {idx + 1}
                  </div>
                  <h3 className="font-bold text-sm text-white/90 leading-tight">
                    {benefit.title}
                  </h3>
                  <p className="text-xs text-white/60 leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </section>
      </div>

      {/* CSS Animation Keyframes for Float and Rotation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </main>
  )
}
