import type { Metadata } from 'next'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the VR Galaxy support team. We are available 24/7 online to assist with your investment, deposit, withdrawal, and wallet queries in India.',
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const contactJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    'name': 'Contact VR Galaxy support',
    'description': 'Contact coordinates for VR Galaxy client queries.',
    'url': `${baseUrl}/contact`,
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': '+91-98765-43210',
      'contactType': 'customer support',
      'email': 'support@investpro.com',
      'availableLanguage': 'en'
    }
  }

  return (
    <div className="min-h-screen pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
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
              { icon: Mail, label: 'Email', value: 'support@investpro.com', desc: 'We reply within 24 hours' },
              { icon: Phone, label: 'Phone', value: '+91 98765 43210', desc: 'Mon-Sat, 9AM-6PM IST' },
              { icon: MapPin, label: 'Address', value: 'Chennai, Tamil Nadu, India', desc: '' },
              { icon: Clock, label: 'Support Hours', value: '24/7 Online Support', desc: 'Via email and chat' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4 premium-card p-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="font-semibold">{item.value}</p>
                  {item.desc && <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="premium-card p-6">
            <h2 className="font-bold text-xl mb-4">Send a Message</h2>
            <form className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Full Name</label>
                  <input type="text" placeholder="Arjun Kumar" className="form-input" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Email</label>
                  <input type="email" placeholder="arjun@example.com" className="form-input" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Subject</label>
                <input type="text" placeholder="Investment inquiry" className="form-input" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Message</label>
                <textarea rows={5} placeholder="Describe your query in detail..." className="form-input resize-none" />
              </div>
              <Button type="submit" size="lg" className="w-full">Send Message</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
