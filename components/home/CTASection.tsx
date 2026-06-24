'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="section-container">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative rounded-3xl overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-800 to-brand-900" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gold-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 py-16 sm:py-20 px-8 sm:px-12 text-center">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 mb-6"
          >
            <TrendingUp className="w-8 h-8 text-primary" />
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
            Ready to Start Your{' '}
            <span className="bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
              Smart Hybrid Digital Earning Journey?
            </span>
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
            Join 10,000+ members already exploring digital earning opportunities with VR Galaxy Networks. Get started today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="xl" variant="gold">
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="xl" variant="glass">
                Talk to an Expert
              </Button>
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-8 mt-10 pt-8 border-t border-white/10">
            {[
              { value: 'No Hidden Fees', label: '100% Transparent' },
              { value: '24/7', label: 'Customer Support' },
              { value: '₹1,000', label: 'Minimum Start' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-xl font-bold text-white">{item.value}</p>
                <p className="text-sm text-white/50">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
