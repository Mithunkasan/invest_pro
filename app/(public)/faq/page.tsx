import type { Metadata } from 'next'
import { FAQSection } from '@/components/home/FAQSection'

export const metadata: Metadata = {
  title: 'FAQ — InvestPro',
  description: 'Frequently asked questions about InvestPro investment platform, plans, withdrawals, and KYC.',
}

export default function FAQPage() {
  return (
    <div className="min-h-screen pt-20">
      <div className="section-container">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black mb-4">Frequently Asked Questions</h1>
        </div>
      </div>
      <FAQSection />
    </div>
  )
}
