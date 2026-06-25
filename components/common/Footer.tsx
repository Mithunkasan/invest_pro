import Link from 'next/link'
import Image from 'next/image'
import { Mail, MapPin, Send } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background border-t border-border pt-20 pb-10">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Company Info */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-12 h-12 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-115">
                <Image src="/logo3.png" width={48} height={48} className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(59,130,246,0.3)]" alt="VR Galaxy Networks logo" />
              </div>
              <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent">VR Galaxy Networks</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              VR Galaxy Networks is a digital earning platform for community growth, membership benefits, task rewards, referrals, and professional networking.
            </p>
            <div className="flex gap-4">
              <a
                href="https://t.me/vrgalaxyceo"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open Telegram"
                className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all"
              >
                <Send size={18} />
              </a>
              <a
                href="mailto:vrgalaxynetworksceo@gmail.com"
                aria-label="Send email"
                className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-black mb-6 uppercase tracking-widest text-xs">Quick Links</h4>
            <ul className="space-y-4">
              {['Home', 'Membership Plans', 'About Us', 'FAQ', 'Contact Us'].map((link) => {
                let href = `/${link.toLowerCase().replace(/ /g, '-')}`
                if (link === 'Home') href = '/'
                if (link === 'About Us') href = '/about'
                if (link === 'Contact Us') href = '/contact'
                return (
                  <li key={link}>
                    <Link href={href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-black mb-6 uppercase tracking-widest text-xs">Legal</h4>
            <ul className="space-y-4">
              {[{ label: 'Terms & Conditions', href: '/terms' }, { label: 'Privacy Policy', href: '/privacy' }].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-black mb-6 uppercase tracking-widest text-xs">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm text-muted-foreground">
                <Mail size={18} className="text-primary flex-shrink-0" />
                <span>vrgalaxynetworksceo@gmail.com</span>
              </li>
              <li className="flex gap-3 text-sm text-muted-foreground">
                <MapPin size={18} className="text-primary flex-shrink-0" />
                <span>Nagercoil, Tamil Nadu, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground font-medium">
            © {currentYear} VR Galaxy Networks. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary">Terms</Link>
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
