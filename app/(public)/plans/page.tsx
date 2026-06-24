import { createPageMetadata, getSiteUrl, serializeJsonLd } from '@/lib/seo'
import { getInvestmentPlans } from '@/actions/investment'

export const metadata = createPageMetadata({
  title: 'Digital Earning Plans',
  description: 'Compare VR Galaxy Networks digital earning plans, durations, entry ranges, features, and estimated daily reward earnings in one clear overview.',
  path: '/plans',
  keywords: ['digital earning plans', 'VR Galaxy Networks plans', 'daily reward earnings', 'earning platform India'],
})

export default async function PlansPage() {
  const plans = await getInvestmentPlans()
  const baseUrl = getSiteUrl()

  const plansJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'VR Galaxy Networks Digital Earning Plans',
    'description': 'A list of high-yield activation plans offering Daily Reward Earnings with clear entry limits.',
    'url': `${baseUrl}/plans`,
    'numberOfItems': plans.length,
    'itemListElement': plans.map((plan: any, index: number) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'Service',
        'name': plan.name,
        'description': plan.description.replace(/\bROI\b/g, 'Earning Platform').replace(/\bInvestment\b/gi, 'Earning Platform'),
        'offers': {
          '@type': 'Offer',
          'priceCurrency': 'INR',
          'price': String(plan.minAmount),
        },
      }
    }))
  }

  return (
    <div className="min-h-screen pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(plansJsonLd) }}
      />
      <div className="section-container">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black mb-4">Activation Plans</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose a plan that matches your activation plan goals. All plans offer daily returns with transparent pricing.
          </p>
        </div>

        {/* All 4 plans in a grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {plans.map((plan: any, i: number) => (
            <div key={plan.id} className="premium-card overflow-hidden">
              <div className="p-1 rounded-t-2xl" style={{ background: `linear-gradient(135deg, ${plan.color}40, ${plan.color}20)` }}>
                <div className="text-center py-5">
                  <h2 className="text-xl font-bold">{plan.name}</h2>
                  <div className="text-4xl font-black mt-2" style={{ color: plan.color }}>{plan.roiPercent}%</div>
                  <p className="text-sm text-muted-foreground">Daily Reward Earnings</p>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <p className="text-sm text-muted-foreground">{plan.description.replace(/\bROI\b/g, 'Earning Platform').replace(/\bInvestment\b/gi, 'Earning Platform')}</p>
                <div className="space-y-2 text-sm">
                  {[
                    ['Duration', `${plan.durationDays} Days`],
                    ['Min Activation Plan', `₹${plan.minAmount.toLocaleString('en-IN')}`],
                    ['Max Activation Plan', `₹${plan.maxAmount.toLocaleString('en-IN')}`],
                    ['Total Daily Reward Earnings', `${(plan.roiPercent * plan.durationDays).toFixed(0)}%`],
                  ].map(([k, v]: any) => (
                    <div key={k} className="flex justify-between border-b border-border pb-1">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
                <ul className="space-y-1.5">
                  {plan.features.map((f: string) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="text-green-500">✓</span> {f.replace(/\bROI\b/g, 'Earning Platform').replace(/\bInvestment\b/gi, 'Earning Platform')}
                    </li>
                  ))}
                </ul>
                <a href="/register" className="block w-full py-2.5 rounded-xl text-center text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: plan.color }}>
                  Invest Now
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Daily Reward Earnings Calculator */}
        <div className="mt-16 premium-card p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Quick Daily Reward Earnings Calculator</h2>
          <p className="text-muted-foreground mb-6">See how much you can earn with VR Galaxy Networks</p>
          <div className="bg-muted/30 rounded-xl p-6 max-w-lg mx-auto">
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { amount: '₹10,000', plan: 'Bronze', earnings: '₹4,500', days: '30d' },
                { amount: '₹50,000', plan: 'Gold', earnings: '₹75,000', days: '60d' },
                { amount: '₹2,00,000', plan: 'Platinum', earnings: '₹5,40,000', days: '90d' },
              ].map((calc: any) => (
                <div key={calc.plan} className="p-3 rounded-lg bg-background">
                  <p className="text-xs text-muted-foreground">{calc.plan}</p>
                  <p className="font-bold text-sm">{calc.amount}</p>
                  <p className="text-xs text-muted-foreground">{calc.days}</p>
                  <p className="text-green-500 font-bold mt-1">{calc.earnings}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
