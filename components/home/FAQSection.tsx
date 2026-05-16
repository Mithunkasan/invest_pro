'use client'

import { motion } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    q: 'How safe is my investment?',
    a: 'We use bank-grade security protocols and secure our funds with diversified assets to ensure maximum safety and consistent returns for our investors.'
  },
  {
    q: 'What is the minimum deposit?',
    a: 'The minimum deposit starts at just ₹1,000 for our Bronze plan, making it accessible for everyone to start their investment journey.'
  },
  {
    q: 'When can I withdraw my earnings?',
    a: 'You can request a withdrawal of your daily earnings anytime. Withdrawal requests are usually processed within 24 hours.'
  },
  {
    q: 'How does the referral program work?',
    a: 'You earn a percentage of every investment made by your direct referrals, and even from their referrals, up to 3 levels deep.'
  },
  {
    q: 'Are there any hidden fees?',
    a: 'No, we believe in complete transparency. There are no registration fees or hidden charges. All fees are clearly mentioned in our terms.'
  }
]

export function FAQSection() {
  return (
    <section className="section-container">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div>
          <h2 className="text-4xl font-black mb-6 leading-tight">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Have questions? We have answers. If you don't find what you are looking for, feel free to contact our support team.
          </p>
          <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10">
            <h4 className="font-bold mb-2">Still have questions?</h4>
            <p className="text-sm text-muted-foreground mb-4">Can't find the answer you're looking for? Please chat to our friendly team.</p>
            <a href="/contact" className="text-primary font-black hover:underline">Get in touch →</a>
          </div>
        </div>

        <div className="premium-card p-4 sm:p-8">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="text-left font-bold hover:text-primary transition-colors text-base py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
