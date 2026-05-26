import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed (Safe Catalog Seed)...')

  // ── Admin (Create if not exists) ──────────────────────────────────
  const adminEmail = 'admin@vrgalaxy.com'
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    const adminHash = await bcrypt.hash('Vrgalaxy@4321admin', 10)
    const admin = await prisma.admin.create({
      data: {
        username: adminEmail,
        email: adminEmail,
        passwordHash: adminHash,
        role: 'SUPER_ADMIN',
      },
    })
    console.log('✅ Admin created:', admin.username)
  } else {
    console.log('ℹ️ Admin already exists:', adminEmail)
  }

  // ── System Settings (Upsert default) ──────────────────────
  const settings = await prisma.systemSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      referralPercent: 10.0,
      level1Percent: 10.0,
      level2Percent: 5.0,
      level3Percent: 2.0,
      levelIncomeEnabled: true,
      starPerformerThreshold: 5000.0,
      starPerformerEnabled: true,
      tlRankRequiredReferrals: 5,
      tlRankMaxUsers: 25,
      tlRankEnabled: true,
    }
  })
  console.log('✅ System Settings seeded')

  // ── Membership Plans (Create if not exists) ──────────────────
  const membershipPlansData = [
    {
      name: 'Free Membership',
      price: 0,
      durationDays: -1,
      depositBonus: 0,
      referralLevel1: 10,
      referralLevel2: 0,
      referralLevel3: 0,
      withdrawalTime: '24-48 Hours',
      support: 'Standard Email',
      features: [
        'Standard 1x Referral Commission (10%)',
        'Access to Standard Investment Plans',
        'Full Wallet Overview & Reports',
        'Daily Dividend Accrual & Payouts',
        'Basic Account Support (2-3 business days)',
      ],
      color: '#3B82F6',
      isActive: true,
    },
    {
      name: 'Bronze Membership',
      price: 500,
      durationDays: 365,
      depositBonus: 2,
      referralLevel1: 10,
      referralLevel2: 2,
      referralLevel3: 1,
      withdrawalTime: 'Under 24 Hours',
      support: 'Priority Email Support',
      features: [
        'Unlock Level 2 (2%) and Level 3 (1%) referral commission',
        'Receive a +2.0% yield bonus on all deposit approvals',
        'Standard 24-hour withdrawal processing queue',
        'Priority email support assistance',
      ],
      color: '#CD7F32',
      isActive: true,
    },
    {
      name: 'Silver Membership',
      price: 1500,
      durationDays: 365,
      depositBonus: 5,
      referralLevel1: 12,
      referralLevel2: 4,
      referralLevel3: 2,
      withdrawalTime: 'Under 12 Hours',
      support: '24/7 Priority Email & Chat',
      features: [
        'Unlock Level 2 (4%) and Level 3 (2%) referral commission',
        'Level 1 referral rate increased to 12%',
        'Receive a +5.0% yield bonus on all deposit approvals',
        'Express 12-hour withdrawal processing queue',
        '24/7 Priority support assistance',
      ],
      color: '#C0C0C0',
      isActive: true,
    },
    {
      name: 'Gold Membership',
      price: 5000,
      durationDays: 365,
      depositBonus: 8,
      referralLevel1: 15,
      referralLevel2: 6,
      referralLevel3: 3,
      withdrawalTime: 'Under 6 Hours',
      support: 'Dedicated VIP Support Chat',
      features: [
        'Unlock Level 2 (6%) and Level 3 (3%) referral commission',
        'Level 1 referral rate increased to 15%',
        'Receive a +8.0% yield bonus on all deposit approvals',
        'VIP 6-hour withdrawal processing queue',
        'Access to high-yield VIP investment plans',
        'Dedicated support manager availability',
      ],
      color: '#FFD700',
      isActive: true,
    },
    {
      name: 'Diamond Membership',
      price: 12000,
      durationDays: 365,
      depositBonus: 12,
      referralLevel1: 18,
      referralLevel2: 8,
      referralLevel3: 4,
      withdrawalTime: 'Under 2 Hours',
      support: 'Personal Account Manager',
      features: [
        'Unlock Level 2 (8%) and Level 3 (4%) referral commission',
        'Level 1 referral rate increased to 18%',
        'Receive a +12.0% yield bonus on all deposit approvals',
        'Super-Express 2-hour withdrawal processing queue',
        'Direct personal WhatsApp support chat',
        'Access to exclusive compounding algorithms & elite plans',
      ],
      color: '#06B6D4',
      isActive: true,
    },
    {
      name: 'Platinum Membership',
      price: 25000,
      durationDays: 365,
      depositBonus: 15,
      referralLevel1: 20,
      referralLevel2: 10,
      referralLevel3: 5,
      withdrawalTime: 'Instant Payouts',
      support: '24/7 VIP Hotline & Elite Support',
      features: [
        'Unlock Level 2 (10%) and Level 3 (5%) referral commission',
        'Level 1 referral rate increased to 20%',
        'Receive a +15.0% yield bonus on all deposit approvals',
        'Instant automated withdrawal approvals',
        '24/7 dedicated telephone hotline support',
        'Priority access to corporate equity share pools & badges',
      ],
      color: '#A855F7',
      isActive: true,
    },
  ]

  let seededMembershipsCount = 0
  for (const item of membershipPlansData) {
    const existing = await prisma.membershipPlan.findUnique({
      where: { name: item.name }
    })
    if (!existing) {
      await prisma.membershipPlan.create({ data: item })
      seededMembershipsCount++
    }
  }
  console.log(`✅ Membership plans seeded: ${seededMembershipsCount} new added`)

  // ── Investment Plans (Create if not exists) ──────────────────
  const investmentPlansData = [
    {
      name: 'Bronze Plan',
      description: 'Perfect for beginners entering the investment world',
      minAmount: 1000,
      maxAmount: 9999,
      roiPercent: 1.5,
      durationDays: 30,
      color: '#CD7F32',
      features: ['1.5% Daily ROI', '30 Days Duration', 'Min ₹1,000', 'UPI Deposit', '24/7 Support'],
    },
    {
      name: 'Silver Plan',
      description: 'Balanced returns for moderate investors',
      minAmount: 10000,
      maxAmount: 49999,
      roiPercent: 2.0,
      durationDays: 45,
      color: '#C0C0C0',
      features: ['2.0% Daily ROI', '45 Days Duration', 'Min ₹10,000', 'Priority Support', 'Referral Bonus'],
    },
    {
      name: 'Gold Plan',
      description: 'Premium returns for serious investors',
      minAmount: 50000,
      maxAmount: 199999,
      roiPercent: 2.5,
      durationDays: 60,
      color: '#FFD700',
      features: ['2.5% Daily ROI', '60 Days Duration', 'Min ₹50,000', 'Dedicated Manager', '5% Referral Bonus'],
    },
    {
      name: 'Platinum Plan',
      description: 'Maximum returns for elite investors',
      minAmount: 200000,
      maxAmount: 10000000,
      roiPercent: 3.0,
      durationDays: 90,
      color: '#E5E4E2',
      features: ['3.0% Daily ROI', '90 Days Duration', 'Min ₹2,00,000', 'VIP Support', '10% Referral Bonus'],
    },
  ]

  let seededInvestmentPlansCount = 0
  for (const item of investmentPlansData) {
    const existing = await prisma.investmentPlan.findFirst({
      where: { name: item.name }
    })
    if (!existing) {
      await prisma.investmentPlan.create({ data: item })
      seededInvestmentPlansCount++
    }
  }
  console.log(`✅ Investment plans seeded: ${seededInvestmentPlansCount} new added`)
  console.log('─────────────────────────────────────')
  console.log('📧 Admin Login: admin@vrgalaxy.com / Vrgalaxy@4321admin')
  console.log('─────────────────────────────────────')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
