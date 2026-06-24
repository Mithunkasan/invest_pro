import { createPageMetadata } from '@/lib/seo'

export const metadata = createPageMetadata({
  title: 'Terms & Conditions',
  description: 'Read the VR Galaxy Networks Terms and Conditions covering platform use, earning risks, KYC, withdrawals, referrals, and account security.',
  path: '/terms',
  keywords: ['VR Galaxy Networks terms', 'platform terms and conditions', 'withdrawal policy', 'KYC requirements'],
})

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-black mb-8">Terms & Conditions</h1>
        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-foreground font-bold text-lg mb-2">1. Acceptance of Terms</h2>
            <p>By accessing and using VR Galaxy Networks, you agree to these terms. Please read them carefully before joining an earning plan.</p>
          </section>
          <section>
            <h2 className="text-foreground font-bold text-lg mb-2">2. Activation Plan Risk</h2>
            <p>All digital earning activities carry risk. Past performance does not guarantee future results. Commit only what you can afford to lose. VR Galaxy Networks is not responsible for earning platform losses.</p>
          </section>
          <section>
            <h2 className="text-foreground font-bold text-lg mb-2">3. KYC Requirements</h2>
            <p>All users must complete KYC verification before withdrawing funds. We reserve the right to suspend accounts that do not complete KYC.</p>
          </section>
          <section>
            <h2 className="text-foreground font-bold text-lg mb-2">4. Withdrawal Policy</h2>
            <p>Withdrawals are processed within 24-48 business hours. Minimum withdrawal amount is ₹100. All withdrawals require a verified bank account.</p>
          </section>
          <section>
            <h2 className="text-foreground font-bold text-lg mb-2">5. Referral Program</h2>
            <p>Referral commissions are awarded only when the referred user makes a valid Smart Hybrid Digital Earning. Commission rates are subject to change without notice.</p>
          </section>
          <section>
            <h2 className="text-foreground font-bold text-lg mb-2">6. Account Suspension</h2>
            <p>We reserve the right to suspend accounts involved in fraudulent activities, abuse of the referral system, or violation of these terms.</p>
          </section>
          <p className="text-xs">Last updated: May 2026</p>
        </div>
      </div>
    </div>
  )
}
