'use client'

import { motion } from 'framer-motion'
import { UserPlus, CreditCard, TrendingUp, Wallet } from 'lucide-react'

const steps = [
  {
    title: 'Create Account',
    desc: 'Register in minutes with your basic details and join our growing community of investors.',
    icon: UserPlus,
    color: 'border-blue-500/20 bg-blue-500/5'
  },
  {
    title: 'Deposit Funds',
    desc: 'Choose your preferred payment method and add funds to your wallet instantly and securely.',
    icon: CreditCard,
    color: 'border-orange-500/20 bg-orange-500/5'
  },
  {
    title: 'Select Plan',
    desc: 'Pick the investment plan that suits your goals and watch your earnings grow daily.',
    icon: TrendingUp,
    color: 'border-green-500/20 bg-green-500/5'
  },
  {
    title: 'Instant Withdraw',
    desc: 'Withdraw your principal and profits to your bank account anytime without any hassle.',
    icon: Wallet,
    color: 'border-primary/20 bg-primary/5'
  }
]

export function HowItWorks() {
  return (
    <section className="section-container relative overflow-hidden">
      {/* Connector Line (Desktop) */}
      <div className="absolute top-[60%] left-[10%] right-[10%] h-0.5 border-t-2 border-dashed border-border hidden lg:block -z-10" />

      <div className="text-center mb-20">
        <h2 className="section-heading">How It Works</h2>
        <p className="section-subheading">
          Get started with VR Galaxy in four simple steps and start earning daily returns.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col items-center text-center relative"
          >
            {/* Step Number */}
            <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-background border-2 border-primary flex items-center justify-center font-black text-primary z-20 shadow-lg">
              {i + 1}
            </div>

            <div className={`w-24 h-24 rounded-[2.5rem] border-2 ${step.color} flex items-center justify-center mb-6 relative group transition-transform hover:rotate-6`}>
              <step.icon size={40} className="text-foreground group-hover:scale-110 transition-transform" />
            </div>
            
            <h3 className="text-xl font-bold mb-3">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed px-4">
              {step.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
