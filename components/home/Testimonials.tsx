'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Rajesh Kumar',
    role: 'Real Estate Developer',
    text: 'VR Galaxy has completely changed how I manage my passive income. The daily ROI is consistent and the instant withdrawals are a lifesaver.',
    avatar: 'RK',
    rating: 5
  },
  {
    name: 'Priya Sharma',
    role: 'IT Professional',
    text: 'I was skeptical at first, but after 3 months, I can say this is the most transparent platform I have ever used. Highly recommended!',
    avatar: 'PS',
    rating: 5
  },
  {
    name: 'Vijay Singh',
    role: 'Business Owner',
    text: 'The referral program is incredible. I have built a team and now my referral income is more than my direct investment returns.',
    avatar: 'VS',
    rating: 5
  }
]

export function Testimonials() {
  return (
    <section className="section-container bg-muted/30">
      <div className="text-center mb-16">
        <h2 className="section-heading">What Our Investors Say</h2>
        <p className="section-subheading">
          Join over 25,000 satisfied investors who are growing their wealth with VR Galaxy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className="premium-card p-8 relative"
          >
            <Quote className="absolute top-6 right-8 text-primary/10 w-12 h-12" />
            
            <div className="flex gap-1 mb-4">
              {[...Array(t.rating)].map((_, i) => (
                <Star key={i} size={16} className="fill-gold-500 text-gold-500" />
              ))}
            </div>

            <p className="text-muted-foreground mb-8 italic leading-relaxed">
              "{t.text}"
            </p>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-black text-primary border border-primary/20">
                {t.avatar}
              </div>
              <div>
                <h4 className="font-bold">{t.name}</h4>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
