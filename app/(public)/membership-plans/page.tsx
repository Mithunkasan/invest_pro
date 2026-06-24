import { createPageMetadata } from '@/lib/seo'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { AnimatedGalaxyBackground } from '@/components/common/AnimatedGalaxyBackground'
import { 
  Users, 
  Zap, 
  Award, 
  Shield, 
  Target, 
  Briefcase, 
  Compass, 
  Heart, 
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  UserCheck,
  Share2,
  ChevronRight
} from 'lucide-react'

export const metadata = createPageMetadata({
  title: 'Membership Plans for Community Growth',
  description: 'Explore VR Galaxy Networks membership plans designed for community growth, business networking, team building, leadership development, and digital earning opportunities.',
  path: '/membership-plans',
  keywords: ['VR Galaxy Networks membership plans', 'community growth membership', 'business networking', 'leadership development', 'referral rewards'],
})

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

export default async function MembershipPlansPage() {
  const plans = await prisma.membershipPlan.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' },
  })

  const heroChecklist = [
    'Access a range of exclusive membership benefits and platforms.',
    'Avail benefits that support community networking and stability.',
    'Simple registration process for eligible individuals.'
  ]

  return (
    <div className="min-h-screen bg-[#03000a] text-white pb-24 relative overflow-hidden">
      {/* ── Galaxy Animated Background ── */}
      <AnimatedGalaxyBackground />

      <div className="relative z-10">
        {/* ── 1. Hero Section Wrapper with background image ── */}
        <div 
          className="relative bg-cover bg-center border-b border-white/5 overflow-hidden" 
          style={{ backgroundImage: "url('/membership_hero1.jpeg')" }}
        >
          {/* Dark radial overlay to ensure readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#03000a]/80 via-[#03000a]/90 to-[#03000a] z-0" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Heading & Content */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-primary/10 border border-primary/20 text-primary uppercase tracking-widest animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                  Community Growth Platform
                </span>
                
                <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-indigo-200 to-blue-200 bg-clip-text text-transparent">
                  Membership Plans
                </h1>
                
                {/* Checklist from reference style */}
                <ul className="space-y-3 pt-2">
                  {heroChecklist.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-white/80 font-medium text-sm sm:text-base">
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-white/60 text-sm sm:text-base leading-relaxed font-medium pt-2 max-w-2xl">
                  Join our business growth platform and thrive within our online community. VR Galaxy Networks offers premier membership plans designed to foster community growth, business networking, team building, and leadership development. Experience enhanced digital earning opportunities and earn generous referral rewards as you build your network.
                </p>

                {/* Action Buttons in a Row */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="#plans" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto px-8 py-3.5 rounded-full font-black text-xs uppercase tracking-widest text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 transition-all duration-300 shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(59,130,246,0.5)] border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer">
                      Join Membership
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </Link>
                  <Link href="#features" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto px-8 py-3.5 rounded-full font-black text-xs uppercase tracking-widest text-white bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer">
                      Explore Features
                    </button>
                  </Link>
                </div>
              </div>

              {/* Right Column: Galaxy Globe Image */}
              <div className="lg:col-span-5 flex justify-center items-center">
                <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-blue-600/20 rounded-full filter blur-3xl opacity-50 animate-pulse" />
                  <Image
                    src="/membership_hero_galaxy.png"
                    width={400}
                    height={400}
                    className="w-full h-full object-contain filter drop-shadow-[0_0_30px_rgba(168,85,247,0.3)] relative z-10" 
                    style={{ animation: 'rotate-slow 40s linear infinite' }}
                    alt="VR Galaxy Networks membership community illustration"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. Membership Plans Section ────────────────────────────────── */}
        <div id="plans" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-wide">
              Types of Membership Plans
            </h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
            <p className="text-white/60 max-w-xl mx-auto text-sm font-medium">
              Select a membership tier that aligns with your community and professional networking goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {plans.map((plan) => {
              const sanitizedFeatures = sanitizeFeatures(plan.features)
              
              const planBenefits = [
                `Active Validity: ${plan.durationDays === -1 ? 'Lifetime' : `${plan.durationDays} Days`}`,
                `Level 1 Commissions: ${plan.referralLevel1}%`,
                plan.referralLevel2 > 0 ? `Level 2 Indirect: ${plan.referralLevel2}%` : null,
                plan.referralLevel3 > 0 ? `Level 3 Indirect: ${plan.referralLevel3}%` : null,
                plan.depositBonus > 0 ? `Engagement Bonus: +${plan.depositBonus}%` : null,
                `Withdrawal: ${plan.withdrawalTime}`,
                `Support: ${plan.support}`
              ].filter(Boolean)

              return (
                <div 
                  key={plan.id} 
                  className="premium-card flex flex-col justify-between overflow-hidden border border-white/5 bg-brand-950/45 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(168,85,247,0.15)] group"
                >
                  <div>
                    {/* Card Top / Header Graphic Block */}
                    <div 
                      className="h-40 relative overflow-hidden flex flex-col justify-center items-center border-b border-white/5"
                      style={{ background: `linear-gradient(135deg, ${plan.color}15, ${plan.color}05)` }}
                    >
                      <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30" style={{ backgroundImage: "url('/membership_hero_galaxy.png')" }} />
                      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full filter blur-2xl opacity-25" style={{ backgroundColor: plan.color }} />
                      <div className="absolute -left-6 -bottom-6 w-16 h-16 rounded-full filter blur-2xl opacity-15" style={{ backgroundColor: plan.color }} />
                      
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

                      {/* Features */}
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-primary" /> Key Features
                        </h4>
                        <ul className="space-y-2.5">
                          {sanitizedFeatures.map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-white/70 leading-relaxed">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Benefits */}
                      <div className="space-y-3 border-t border-white/5 pt-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-primary" /> Rewards & Benefits
                        </h4>
                        <ul className="space-y-2">
                          {planBenefits.map((b, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs text-white/80 font-medium">
                              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: plan.color }} />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Join Action Button */}
                  <div className="p-6 pt-0">
                    <Link href="/register" className="block w-full">
                      <button 
                        className="w-full py-3 px-4 rounded-xl text-center text-xs font-black uppercase tracking-widest text-white transition-all duration-300 hover:scale-[1.02] cursor-pointer hover:shadow-lg flex items-center justify-center gap-1.5"
                        style={{ 
                          background: `linear-gradient(135deg, ${plan.color}, ${plan.color}dd)`,
                          boxShadow: `0 4px 14px ${plan.color}33`
                        }}
                      >
                        Join Tier
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── 3. Features Section ────────────────────────────────────────── */}
        <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-wide">
              Features of Membership Plans
            </h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
            <p className="text-white/60 max-w-xl mx-auto text-sm font-medium">
              Discover the dynamic capabilities built directly into your membership tier.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <div 
                key={idx} 
                className="premium-card p-6 bg-brand-950/40 border border-white/5 space-y-4 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl ${feat.bg} ${feat.color} flex items-center justify-center`}>
                  <feat.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors">
                  {feat.title}
                </h3>
                <ul className="space-y-2.5 text-xs text-white/60 leading-relaxed pt-2">
                  {feat.desc.map((pt, pIdx) => (
                    <li key={pIdx} className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. Benefits Section ────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-wide">
              Benefits of Membership Plans
            </h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
            <p className="text-white/60 max-w-xl mx-auto text-sm font-medium">
              Being a member opens exclusive advantages that support your personal growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <div 
                key={idx} 
                className="premium-card p-6 bg-gradient-to-br from-brand-950/45 to-brand-950/10 border border-white/5 hover:border-primary/20 hover:scale-[1.01] hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-black border border-primary/20">
                    {idx + 1}
                  </div>
                  <h3 className="font-bold text-sm text-white/90 leading-tight">
                    {benefit.title}
                  </h3>
                  <p className="text-xs text-white/60 leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
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
    </div>
  )
}
