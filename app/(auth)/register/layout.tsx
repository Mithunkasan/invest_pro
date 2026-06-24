import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create your VR Galaxy Networks account to explore membership benefits, digital earnings, and referral rewards.',
  alternates: {
    canonical: '/register',
  },
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
