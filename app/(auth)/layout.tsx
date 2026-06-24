import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#02040a] bg-cover bg-center bg-no-repeat bg-[url('/bg3.jpeg')] lg:bg-[url('/bg2.jpeg')]">
      {/* Subtle overlay for form contrast */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none select-none z-0" />

      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
