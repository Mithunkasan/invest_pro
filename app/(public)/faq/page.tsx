import type { Metadata } from 'next'
import { FAQSection } from '@/components/home/FAQSection'

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about VR Galaxy investment rules, returns, withdrawals, KYC validation, and referral system levels.',
  alternates: { canonical: '/faq' },
}

export default function FAQPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'What is the minimum investment amount in VR Galaxy?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'The minimum investment amount is ₹1,000 for the basic Bronze Plan.'
        }
      },
      {
        '@type': 'Question',
        'name': 'How is the referral commission distributed?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Referral commissions are distributed dynamically across configured upline levels: e.g. 10% for Level 1 (direct), 5% for Level 2, and 3% for Level 3.'
        }
      },
      {
        '@type': 'Question',
        'name': 'How can I withdraw my earnings?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'You can submit a withdrawal request directly from your dashboard wallet page. Admin reviews and processes withdrawals to your bank account or UPI within 24-48 hours.'
        }
      }
    ]
  }

  return (
    <div className="min-h-screen pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="section-container">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black mb-4">Frequently Asked Questions</h1>
        </div>
      </div>
      <FAQSection />
    </div>
  )
}
