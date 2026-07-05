import type { Metadata } from 'next'

export const SITE_NAME = 'VR Galaxy Networks'
export const SITE_DESCRIPTION =
  'VR Galaxy Networks is a community growth platform for digital earning opportunities, membership benefits, task rewards, referrals, and professional networking.'
export const CANONICAL_SITE_URL = 'https://www.vrgalaxynetworks.com'

export function getSiteUrl(): string {
  if (process.env.VERCEL_ENV === 'production') {
    return CANONICAL_SITE_URL
  }

  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
  const isLocalConfiguredUrl = configuredUrl?.includes('localhost') || configuredUrl?.includes('127.0.0.1')
  const siteUrl = vercelHost && (!configuredUrl || isLocalConfiguredUrl)
    ? `https://${vercelHost}`
    : configuredUrl || CANONICAL_SITE_URL

  const normalizedSiteUrl = siteUrl.replace(/\/$/, '')

  try {
    const url = new URL(normalizedSiteUrl)
    if (url.hostname === 'vrgalaxynetworks.com') {
      return CANONICAL_SITE_URL
    }
  } catch {
    return normalizedSiteUrl
  }

  return normalizedSiteUrl
}

type PageMetadata = {
  title: string
  description: string
  path: string
  keywords?: string[]
}

export const KEYWORDS_LIST = [
  'VR Galaxy Networks',
  'VR Galaxy',
  'VR Galaxy Login',
  'VR Galaxy Registration',
  'VR Galaxy Official Website',
  'VR Galaxy Dashboard',
  'VR Galaxy Membership',
  'VR Galaxy Investment',
  'VR Galaxy Wallet',
  'VR Galaxy Referral Program',
  'Online Investment Platform',
  'Digital Investment Platform',
  'Smart Investment Platform',
  'Secure Investment Platform',
  'Investment Platform India',
  'Best Investment Platform',
  'Investment Website',
  'Investment Dashboard',
  'Investment Plans',
  'Online Investment Plans',
  'Membership Plans',
  'VIP Membership',
  'Silver Membership',
  'Gold Membership',
  'Platinum Membership',
  'Premium Membership',
  'Membership Benefits',
  'Membership Upgrade',
  'Referral Program',
  'Referral Income',
  'Referral Commission',
  'Multi-Level Referral',
  'MLM Platform',
  'MLM Referral Income',
  'Affiliate Marketing',
  'Affiliate Income',
  'Team Income',
  'Leadership Rewards',
  'Business Growth',
  'Passive Income',
  'Daily Income',
  'Daily Rewards',
  'Daily Earnings',
  'Reward Wallet',
  'Digital Wallet',
  'Main Wallet',
  'Referral Wallet',
  'Bonus Wallet',
  'Deposit Wallet',
  'Share Wallet',
  'Level Income',
  'Wallet Balance',
  'Online Wallet System',
  'Deposit Funds',
  'UPI Deposit',
  'Bank Transfer',
  'Secure Payments',
  'Withdraw Money',
  'Instant Withdrawal',
  'Online Earnings',
  'Earn Money Online',
  'Extra Income',
  'Side Income',
  'Financial Freedom',
  'Wealth Building',
  'Investment Opportunities',
  'Online Business',
  'Digital Business',
  'Network Marketing',
  'Direct Selling Platform',
  'Commission System',
  'Income Opportunities',
  'Trusted Investment Platform',
  'Best Referral Platform',
  'Online Referral System',
  'Referral Bonus',
  'Team Building',
  'User Dashboard',
  'Investment Management',
  'Membership Management',
  'Wallet Management',
  'Financial Management',
  'Investment Tracking',
  'Business Network',
  'Online Registration',
  'User Login',
  'KYC Verification',
  'Secure Account',
  'Financial Dashboard',
  'Income Tracking',
  'Commission Tracking',
  'Business Rewards',
  'Online Community',
  'Digital Finance',
  'FinTech Platform',
  'Wealth Management',
  'Online Financial Services',
  'Passive Income India',
  'Investment Community',
  'Reward System',
  'Business Opportunity',
  'Growth Platform',
  'Referral Network',
  'Online Success Platform',
  'Investment Solutions',
  'Smart Wealth',
  'Secure Wallet',
  'Earn Through Referrals',
  'Daily ROI Platform',
  'Digital Rewards',
  'Investment Membership Platform',
  'Online Membership Platform',
  'Business Income Platform',
  'Next.js Investment Platform',
  'Investment Software',
  'Referral Software',
  'Wallet System',
  'Investment Portal',
  'Financial Platform',
  'Online Finance',
  'Digital Economy',
  'Investment Growth',
  'Long-Term Investment',
  'Online Business Platform',
  'Referral Marketing Platform',
  'Investment Network',
  'Best Passive Income Platform',
  'Best Online Investment Platform',
  'Best Referral Income Platform',
  'Online Income Platform',
  'Investment Opportunities India',
  'Secure Online Investment',
  'Trusted Membership Platform',
  'Business Expansion',
  'Financial Success',
  'Online Rewards Platform',
  'Income Generation Platform',
  'Investment Platform tamilnadu',
  'Online Investment tamilnadu',
  'Referral Income tamilnadu',
  'Digital Investment Company tamilnadu',
  'Best MLM Platform tamilnadu',
  'Best Investment Website tamilnadu',
  'Passive Income tamilnadu',
  'Earn Money Online tamilnadu',
  'Online Membership tamilnadu',
  'Investment Opportunities tamilnadu',
  'Investment Platform Nagercoil',
  'Online Investment Nagercoil',
  'Referral Income Nagercoil',
  'Digital Investment Company Nagercoil',
  'Best MLM Platform Nagercoil',
  'Best Investment Website Nagercoil',
  'Passive Income Nagercoil',
  'Earn Money Online Nagercoil',
  'Online Membership Nagercoil',
  'Investment Opportunities Nagercoil'
]

export function createPageMetadata({ title, description, path, keywords = [] }: PageMetadata): Metadata {
  const canonical = path === '/' ? '/' : path.replace(/\/$/, '')
  const absoluteCanonical = `${CANONICAL_SITE_URL}${canonical === '/' ? '' : canonical}`
  const openGraphImage = `${CANONICAL_SITE_URL}/opengraph-image`

  const mergedKeywords = Array.from(new Set([...keywords, ...KEYWORDS_LIST]))

  return {
    title,
    description,
    keywords: mergedKeywords,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      url: absoluteCanonical,
      siteName: SITE_NAME,
      title,
      description,
      images: [{ url: openGraphImage, width: 1200, height: 630, alt: `${SITE_NAME} digital earning platform` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [openGraphImage],
    },
  }
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}
