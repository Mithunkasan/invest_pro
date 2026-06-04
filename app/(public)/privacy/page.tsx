import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for VR Galaxy. Read how we secure your personal data, KYC documents, and financial transaction records.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-black mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-foreground font-bold text-lg mb-2">Information We Collect</h2>
            <p>We collect your name, email, phone number, and KYC documents (Aadhaar, PAN) for account registration and verification.</p>
          </section>
          <section>
            <h2 className="text-foreground font-bold text-lg mb-2">How We Use Your Data</h2>
            <p>Your data is used to provide investment services, process transactions, verify identity, and send important account notifications.</p>
          </section>
          <section>
            <h2 className="text-foreground font-bold text-lg mb-2">Data Security</h2>
            <p>We use industry-standard encryption and security measures to protect your personal and financial information.</p>
          </section>
          <section>
            <h2 className="text-foreground font-bold text-lg mb-2">Data Sharing</h2>
            <p>We do not sell or share your personal information with third parties except as required by law or for payment processing.</p>
          </section>
          <section>
            <h2 className="text-foreground font-bold text-lg mb-2">Cookies</h2>
            <p>We use secure HTTP-only cookies for authentication. We do not use tracking cookies for advertising.</p>
          </section>
          <p className="text-xs">Last updated: May 2026</p>
        </div>
      </div>
    </div>
  )
}
