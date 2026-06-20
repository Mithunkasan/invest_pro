'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Rajesh Kumar',
    location: 'Chennai, TN',
    plan: 'Gold Plan',
    profit: '₹37,500',
    invested: '₹50,000',
    rating: 5,
    text: 'VR Galaxy has completely changed my financial life. The daily returns are consistent and the withdrawal process is smooth. Highly recommended!',
    initials: 'RK',
  },
  {
    name: 'Priya Nair',
    location: 'Mumbai, MH',
    plan: 'Silver Plan',
    profit: '₹18,000',
    invested: '₹20,000',
    rating: 5,
    text: 'I was skeptical at first but after seeing consistent daily returns for 2 months, I am now investing more. The support team is very helpful.',
    initials: 'PN',
  },
  {
    name: 'Vikram Patel',
    location: 'Bangalore, KA',
    plan: 'Platinum Plan',
    profit: '₹1,62,000',
    invested: '₹2,00,000',
    rating: 5,
    text: 'The Daily Reward Earnings on the Platinum Plan are exceptional. I have referred 15 friends and the referral income is an added bonus. Great platform!',
    initials: 'VP',
  },
  {
    name: 'Anitha Ramesh',
    location: 'Coimbatore, TN',
    plan: 'Bronze Plan',
    profit: '₹2,250',
    invested: '₹5,000',
    rating: 4,
    text: 'Started small with the Bronze Plan and already seeing great returns. The KYC process was quick and the app is very user-friendly.',
    initials: 'AR',
  },
  {
    name: 'Suresh Menon',
    location: 'Hyderabad, TS',
    plan: 'Gold Plan',
    profit: '₹75,000',
    invested: '₹1,00,000',
    rating: 5,
    text: 'Best activation plan platform I have used. Transparent, reliable, and the returns are exactly as promised. Will continue investing.',
    initials: 'SM',
  },
  {
    name: 'Deepa Krishnan',
    location: 'Madurai, TN',
    plan: 'Silver Plan',
    profit: '₹27,000',
    invested: '₹30,000',
    rating: 5,
    text: 'The referral program is amazing! I earn commission from my team and the main activation plan returns too. Double income!',
    initials: 'DK',
  },
]

export function TestimonialsSection() {
  return (
    <section className="section-container overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="section-heading">What Our Investors Say</h2>
        <p className="section-subheading">
          Join thousands of satisfied investors who are growing their wealth with VR Galaxy.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="premium-card p-6 flex flex-col gap-4 hover:shadow-lg transition-all duration-300"
          >
            <Quote className="w-6 h-6 text-primary/40" />
            <p className="text-sm text-muted-foreground leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>

            <div className="flex gap-0.5">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 text-gold-400 fill-current" />
              ))}
            </div>

            <div className="border-t border-border pt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{t.plan}</p>
                <p className="text-sm font-bold text-green-500">{t.profit}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
