'use client'

import { motion } from 'framer-motion'
import { 
  ShieldCheck, Zap, Users, BarChart3, 
  Smartphone, Headphones, Globe, Lock 
} from 'lucide-react'

const features = [
  {
    title: 'Bank-Grade Security',
    desc: 'Your funds and data are protected by industry-leading encryption and multi-layer security protocols.',
    icon: ShieldCheck,
    color: 'bg-blue-500/10 text-blue-500'
  },
  {
    title: 'Instant Withdrawals',
    desc: 'No waiting for days. Request your earnings and get them in your bank account almost instantly.',
    icon: Zap,
    color: 'bg-orange-500/10 text-orange-500'
  },
  {
    title: 'Referral Rewards',
    desc: 'Build your network and earn passive income with our high-paying multi-level referral system.',
    icon: Users,
    color: 'bg-green-500/10 text-green-500'
  },
  {
    title: 'Daily Reward Earnings Tracking',
    desc: 'Watch your wealth grow in real-time with our transparent dashboard and daily return updates.',
    icon: BarChart3,
    color: 'bg-primary/10 text-primary'
  },
  {
    title: 'Mobile-First Design',
    desc: 'Invest on the go with our fully responsive platform optimized for smartphones and tablets.',
    icon: Smartphone,
    color: 'bg-purple-500/10 text-purple-500'
  },
  {
    title: '24/7 Support',
    desc: 'Our dedicated support team is always available to help you with any queries or issues.',
    icon: Headphones,
    color: 'bg-red-500/10 text-red-500'
  },
  {
    title: 'Global Accessibility',
    desc: 'Access your account and manage your Smart Hybrid Digital Earnings from anywhere in the world, any time.',
    icon: Globe,
    color: 'bg-cyan-500/10 text-cyan-500'
  },
  {
    title: 'Data Privacy',
    desc: 'We strictly adhere to data protection regulations and never share your info with third parties.',
    icon: Lock,
    color: 'bg-gold-500/10 text-gold-500'
  }
]

export function FeaturesSection() {
  return (
    <section className="section-container bg-transparent">
      <div className="text-center mb-16">
        <h2 className="section-heading">Why Choose VR Galaxy Networks?</h2>
        <p className="section-subheading">
          We combine cutting-edge technology with Smart Hybrid Digital Earning strategies to provide the best platform for our users.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            viewport={{ once: true }}
            className="relative w-full h-[300px] group cursor-pointer"
          >
            {/* The Expanding Background (Flower blooming / Explosion) */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl z-0 transition-all duration-[700ms] ease-[cubic-bezier(0.4,0,0.2,1)] [clip-path:circle(0px_at_50%_34%)] group-hover:[clip-path:circle(150%_at_50%_34%)]" />

            {/* Glowing burst effect */}
            <div className={`absolute inset-0 rounded-2xl z-0 transition-all duration-[700ms] ease-[cubic-bezier(0.4,0,0.2,1)] [clip-path:circle(0px_at_50%_34%)] group-hover:[clip-path:circle(150%_at_50%_34%)] opacity-0 group-hover:opacity-20 ${feature.color.split(' ')[1]?.replace('text-', 'bg-')} blur-2xl pointer-events-none`} />

            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col items-center justify-start pt-[70px] p-6 text-center z-10">
              
              {/* Icon Container */}
              <div className={`relative w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mb-5 transition-all duration-[700ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] group-hover:scale-[1.2] group-hover:rotate-12`}>
                <feature.icon size={32} />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold transition-all duration-[700ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:-translate-y-2">
                {feature.title}
              </h3>

              {/* Description (Hidden initially, blooms on hover) */}
              <div className="grid grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100 transition-all duration-[700ms] ease-[cubic-bezier(0.4,0,0.2,1)] w-full">
                <div className="overflow-hidden">
                  <p className="text-sm text-muted-foreground leading-relaxed px-2 transition-all duration-[700ms] ease-out translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 pt-2">
                    {feature.desc}
                  </p>
                </div>
              </div>

            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
