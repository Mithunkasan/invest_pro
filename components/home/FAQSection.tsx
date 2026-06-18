'use client'

import { motion } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { faqs } from '@/lib/faq-data'
import { CheckCircle2 } from 'lucide-react'

// Selected questions for the landing page
const landingFaqs = faqs.filter(faq => 
  ['faq-1', 'faq-2', 'faq-3', 'faq-4', 'faq-5', 'faq-16'].includes(faq.id)
)

export function FAQSection() {
  return (
    <section className="section-container">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div>
          <h2 className="text-4xl font-black mb-6 leading-tight">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Have questions about VR Galaxy Networks? We have answers. If you don't find what you are looking for, feel free to contact our support team or check our full FAQ page.
          </p>
          <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 mb-6">
            <h4 className="font-bold mb-2">Still have questions?</h4>
            <p className="text-sm text-muted-foreground mb-4">Can't find the answer you're looking for? Please chat to our friendly team.</p>
            <a href="/contact" className="text-primary font-black hover:underline">Get in touch →</a>
          </div>
          <a href="/faq" className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
            View all 16 FAQs on our dedicated FAQ page →
          </a>
        </div>

        <div className="premium-card p-4 sm:p-8">
          <Accordion type="single" collapsible className="w-full">
            {landingFaqs.map((faq, i) => {
              const isChecklist = faq.id === 'faq-16';
              return (
                <AccordionItem key={faq.id} value={`item-${i}`} className="border-border">
                  <AccordionTrigger className="text-left font-bold hover:text-primary transition-colors text-base py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {faq.answer && (
                      <p className="mb-3 text-white/80">{faq.answer}</p>
                    )}
                    {faq.listItems && (
                      <ul className={`space-y-2 mt-2 ${isChecklist ? 'grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 space-y-0' : 'list-none pl-1'}`}>
                        {faq.listItems.map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            {isChecklist ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
                            )}
                            <span className="text-white/70">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
    </section>
  )
}

