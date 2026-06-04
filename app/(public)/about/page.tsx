import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about VR Galaxy, our mission, core values, experienced team, and commitment to transparent, high-yield investment returns in India.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    'name': 'About VR Galaxy',
    'description': 'Learn about VR Galaxy, our mission, core values, experienced team, and commitment to transparent, high-yield investment returns in India.',
    'url': `${baseUrl}/about`,
  }

  return (
    <div className="min-h-screen pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <div className="section-container">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-black mb-4">About InvestPro</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We are building India&apos;s most trusted digital investment platform with transparency, technology, and daily returns.
          </p>
        </div>

        {/* Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              InvestPro was founded with a simple mission: to make smart investments accessible to everyone in India. We believe that financial growth should not be limited to the elite.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our platform offers transparent daily ROI investment plans starting at just ₹1,000, with a referral program that rewards you for growing our community.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '5+', label: 'Years Experience' },
              { value: '10K+', label: 'Active Investors' },
              { value: '₹50Cr+', label: 'Total AUM' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat) => (
              <div key={stat.label} className="premium-card p-6 text-center">
                <div className="text-3xl font-black text-primary">{stat.value}</div>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '🔒', title: 'Security First', desc: 'Enterprise-grade security protecting your investments and personal data at all times.' },
            { icon: '📊', title: 'Transparency', desc: 'Full transparency in returns, fees, and operations. No hidden charges ever.' },
            { icon: '🤝', title: 'Community', desc: 'A thriving community of 10,000+ investors supporting each other to grow.' },
          ].map((val) => (
            <div key={val.title} className="premium-card p-6 text-center">
              <div className="text-4xl mb-4">{val.icon}</div>
              <h3 className="font-bold text-lg mb-2">{val.title}</h3>
              <p className="text-muted-foreground text-sm">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
