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
    title: 'Daily ROI Tracking',
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
    desc: 'Access your account and manage your investments from anywhere in the world, any time.',
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
    <section className="section-container bg-muted/20">
      <div className="text-center mb-16">
        <h2 className="section-heading">Why Choose VR Galaxy?</h2>
        <p className="section-subheading">
          We combine cutting-edge technology with smart investment strategies to provide the best platform for our users.
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
            className="feature-card"
          >
            <div className={`w-12 h-12 rounded-2xl ${feature.color} flex items-center justify-center mb-5`}>
              <feature.icon size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
