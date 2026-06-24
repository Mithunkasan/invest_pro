import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Log in to your VR Galaxy Networks account to access your dashboard, manage wallet balances, and track digital earnings.',
  alternates: {
    canonical: '/login',
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
