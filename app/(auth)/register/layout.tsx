import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Sign up for a VR Galaxy account to start earning daily ROI and leverage our multi-level referral commissions.',
  alternates: {
    canonical: '/register',
  },
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
