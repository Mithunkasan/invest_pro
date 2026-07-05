import { createPageMetadata, getSiteUrl, serializeJsonLd, SITE_NAME } from '@/lib/seo'
import { Mail, Send, MapPin, Clock } from 'lucide-react'
import ContactClient from './ContactClient'

export const metadata = createPageMetadata({
  title: 'Contact Support',
  description: 'Contact the VR Galaxy Networks support team for help with accounts, memberships, deposits, withdrawals, wallet questions, and platform access in India.',
  path: '/contact',
  keywords: ['VR Galaxy Networks support', 'contact digital earning platform', 'account support India'],
})

export default function ContactPage() {
  const baseUrl = getSiteUrl()
  const contactJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    'name': `Contact ${SITE_NAME} support`,
    'description': `${SITE_NAME} customer support contact information.`,
    'url': `${baseUrl}/contact`,
    'contactPoint': {
      '@type': 'ContactPoint',
      'contactType': 'customer support',
      'email': 'support@vrgalaxynetwork.com',
      'availableLanguage': 'en'
    }
  }

  return (
    <div className="min-h-screen pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(contactJsonLd) }}
      />
      <div className="section-container">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black mb-4">Contact Us</h1>
          <p className="text-muted-foreground">We are here to help. Reach out to our support team.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            {[
              { icon: Mail, label: 'Email', value: 'vrgalaxynetworksceo@gmail.com', desc: 'We reply within 24 hours' },
              { icon: Send, label: 'Telegram', value: 'https://t.me/vrgalaxyceo', desc: '', href: 'https://t.me/vrgalaxyceo' },
              { icon: MapPin, label: 'Address', value: 'Chennai, Tamil Nadu, India', desc: '' },
              { icon: Clock, label: 'Support Hours', value: '16/7 Online Support', desc: 'Via email and Telegram' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4 premium-card p-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline break-all">
                      {item.value}
                    </a>
                  ) : (
                    <p className="font-semibold">{item.value}</p>
                  )}
                  {item.desc && <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form Client Wrapper */}
          <ContactClient />
        </div>
      </div>
    </div>
  )
}
