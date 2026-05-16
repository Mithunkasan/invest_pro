import type { Metadata } from 'next'
import { getInvestmentPlans } from '@/actions/investment'

export const metadata: Metadata = {
  title: 'Investment Plans — InvestPro',
  description: 'Explore all InvestPro investment plans with daily ROI from 1.5% to 3%. Invest in Bronze, Silver, Gold, or Platinum plans.',
}

export default async function PlansPage() {
  const plans = await getInvestmentPlans()
  return (
    <div className="min-h-screen pt-20">
      <div className="section-container">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black mb-4">Investment Plans</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose a plan that matches your investment goals. All plans offer daily returns with transparent pricing.
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
                  <p className="text-sm text-muted-foreground">Daily ROI</p>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <div className="space-y-2 text-sm">
                  {[
                    ['Duration', `${plan.durationDays} Days`],
                    ['Min Investment', `₹${plan.minAmount.toLocaleString('en-IN')}`],
                    ['Max Investment', `₹${plan.maxAmount.toLocaleString('en-IN')}`],
                    ['Total ROI', `${(plan.roiPercent * plan.durationDays).toFixed(0)}%`],
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
                      <span className="text-green-500">✓</span> {f}
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

        {/* ROI Calculator */}
        <div className="mt-16 premium-card p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Quick ROI Calculator</h2>
          <p className="text-muted-foreground mb-6">See how much you can earn with InvestPro</p>
          <div className="bg-muted/30 rounded-xl p-6 max-w-lg mx-auto">
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { investment: '₹10,000', plan: 'Bronze', roi: '₹4,500', days: '30d' },
                { investment: '₹50,000', plan: 'Gold', roi: '₹75,000', days: '60d' },
                { investment: '₹2,00,000', plan: 'Platinum', roi: '₹5,40,000', days: '90d' },
              ].map((calc: any) => (
                <div key={calc.plan} className="p-3 rounded-lg bg-background">
                  <p className="text-xs text-muted-foreground">{calc.plan}</p>
                  <p className="font-bold text-sm">{calc.investment}</p>
                  <p className="text-xs text-muted-foreground">{calc.days}</p>
                  <p className="text-green-500 font-bold mt-1">{calc.roi}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
