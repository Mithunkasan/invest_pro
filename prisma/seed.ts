import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // ── Clean up ─────────────────────────────────────────────
  await prisma.notification.deleteMany()
  await prisma.kYC.deleteMany()
  await prisma.referral.deleteMany()
  await prisma.withdrawal.deleteMany()
  await prisma.deposit.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.investment.deleteMany()
  await prisma.wallet.deleteMany()
  await prisma.user.deleteMany()
  await prisma.admin.deleteMany()
  await prisma.investmentPlan.deleteMany()
  await prisma.systemSettings.deleteMany()
  await prisma.membershipPlan.deleteMany()

  // ── Admin ─────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Vrgalaxy@4321admin', 10)
  const admin = await prisma.admin.create({
    data: {
      username: 'admin@vrgalaxy.com',
      email: 'admin@vrgalaxy.com',
      passwordHash: adminHash,
      role: 'SUPER_ADMIN',
    },
  })
  console.log('✅ Admin created:', admin.username)

  // ── System Settings ──────────────────────────────────────
  const settings = await prisma.systemSettings.create({
    data: {
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

  // ── Membership Plans ──────────────────────────────────────
  const membershipPlans = await Promise.all([
    prisma.membershipPlan.create({
      data: {
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
    }),
    prisma.membershipPlan.create({
      data: {
        name: 'Premium Membership',
        price: 1999,
        durationDays: 365,
        depositBonus: 5,
        referralLevel1: 10,
        referralLevel2: 5,
        referralLevel3: 2,
        withdrawalTime: 'Under 2 Hours',
        support: '24/7 Priority VIP Chat Group',
        features: [
          'Unlock Level 2 (5%) and Level 3 (2%) referral payouts',
          'Instant +5.0% yield multiplier on all deposit approvals',
          'Priority express withdrawal queue (processed in under 2 hours)',
          'Full access to VIP compounding algorithms & investment plans',
          'Direct account access to Dedicated Support Chat Manager',
        ],
        color: '#F59E0B',
        isActive: true,
      },
    }),
  ])
  console.log('✅ Membership plans seeded:', membershipPlans.length)

  // ── Investment Plans ──────────────────────────────────────
  const plans = await Promise.all([
    prisma.investmentPlan.create({
      data: {
        name: 'Bronze Plan',
        description: 'Perfect for beginners entering the investment world',
        minAmount: 1000,
        maxAmount: 9999,
        roiPercent: 1.5,
        durationDays: 30,
        color: '#CD7F32',
        features: ['1.5% Daily ROI', '30 Days Duration', 'Min ₹1,000', 'UPI Deposit', '24/7 Support'],
      },
    }),
    prisma.investmentPlan.create({
      data: {
        name: 'Silver Plan',
        description: 'Balanced returns for moderate investors',
        minAmount: 10000,
        maxAmount: 49999,
        roiPercent: 2.0,
        durationDays: 45,
        color: '#C0C0C0',
        features: ['2.0% Daily ROI', '45 Days Duration', 'Min ₹10,000', 'Priority Support', 'Referral Bonus'],
      },
    }),
    prisma.investmentPlan.create({
      data: {
        name: 'Gold Plan',
        description: 'Premium returns for serious investors',
        minAmount: 50000,
        maxAmount: 199999,
        roiPercent: 2.5,
        durationDays: 60,
        color: '#FFD700',
        features: ['2.5% Daily ROI', '60 Days Duration', 'Min ₹50,000', 'Dedicated Manager', '5% Referral Bonus'],
      },
    }),
    prisma.investmentPlan.create({
      data: {
        name: 'Platinum Plan',
        description: 'Maximum returns for elite investors',
        minAmount: 200000,
        maxAmount: 10000000,
        roiPercent: 3.0,
        durationDays: 90,
        color: '#E5E4E2',
        features: ['3.0% Daily ROI', '90 Days Duration', 'Min ₹2,00,000', 'VIP Support', '10% Referral Bonus'],
      },
    }),
  ])
  console.log('✅ Investment plans created:', plans.length)

  // ── Sample Users ──────────────────────────────────────────
  const userHash = await bcrypt.hash('User@123', 10)

  const user1 = await prisma.user.create({
    data: {
      name: 'Arjun Kumar',
      email: 'arjun@example.com',
      phone: '9876543210',
      passwordHash: userHash,
      referralCode: 'ARJUN001',
      status: 'ACTIVE',
    },
  })

  const user2 = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '9876543211',
      passwordHash: userHash,
      referralCode: 'PRIYA001',
      referredById: user1.id,
      status: 'ACTIVE',
    },
  })

  const user3 = await prisma.user.create({
    data: {
      name: 'Vikram Singh',
      email: 'vikram@example.com',
      phone: '9876543212',
      passwordHash: userHash,
      referralCode: 'VIKRAM001',
      referredById: user1.id,
      status: 'ACTIVE',
    },
  })

  const user4 = await prisma.user.create({
    data: {
      name: 'Anitha Rajan',
      email: 'anitha@example.com',
      phone: '9876543213',
      passwordHash: userHash,
      referralCode: 'ANITHA001',
      status: 'ACTIVE',
    },
  })

  console.log('✅ Users created: 4')

  // ── Wallets ───────────────────────────────────────────────
  await prisma.wallet.createMany({
    data: [
      { userId: user1.id, mainBalance: 45000, bonusBalance: 2500, referralBalance: 5000, rewardBalance: 1500, levelBalance: 2500, shareBalance: 0 },
      { userId: user2.id, mainBalance: 18000, bonusBalance: 500, referralBalance: 1000, rewardBalance: 200, levelBalance: 500, shareBalance: 0 },
      { userId: user3.id, mainBalance: 32000, bonusBalance: 1200, referralBalance: 800, rewardBalance: 0, levelBalance: 200, shareBalance: 0 },
      { userId: user4.id, mainBalance: 8000, bonusBalance: 200, referralBalance: 0, rewardBalance: 0, levelBalance: 0, shareBalance: 0 },
    ],
  })

  // ── Investments ───────────────────────────────────────────
  const goldPlan = plans[2]
  const silverPlan = plans[1]
  const bronzePlan = plans[0]

  const invest1 = await prisma.investment.create({
    data: {
      userId: user1.id,
      planId: goldPlan.id,
      amount: 50000,
      status: 'ACTIVE',
      profit: 7500,
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-05-31'),
    },
  })

  const invest2 = await prisma.investment.create({
    data: {
      userId: user2.id,
      planId: silverPlan.id,
      amount: 20000,
      status: 'ACTIVE',
      profit: 1800,
      startDate: new Date('2026-04-15'),
      endDate: new Date('2026-05-30'),
    },
  })

  const invest3 = await prisma.investment.create({
    data: {
      userId: user3.id,
      planId: silverPlan.id,
      amount: 35000,
      status: 'COMPLETED',
      profit: 3150,
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-04-15'),
    },
  })

  const invest4 = await prisma.investment.create({
    data: {
      userId: user4.id,
      planId: bronzePlan.id,
      amount: 5000,
      status: 'ACTIVE',
      profit: 225,
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-05-31'),
    },
  })

  console.log('✅ Investments created: 4')

  // ── Deposits ──────────────────────────────────────────────
  await prisma.deposit.createMany({
    data: [
      { userId: user1.id, amount: 50000, method: 'UPI', utrNumber: 'UTR123456789', status: 'APPROVED', approvedById: admin.id },
      { userId: user1.id, amount: 10000, method: 'BANK_TRANSFER', utrNumber: 'UTR987654321', status: 'APPROVED', approvedById: admin.id },
      { userId: user2.id, amount: 20000, method: 'UPI', utrNumber: 'UTR111222333', status: 'APPROVED', approvedById: admin.id },
      { userId: user3.id, amount: 35000, method: 'QR_CODE', utrNumber: 'UTR444555666', status: 'APPROVED', approvedById: admin.id },
      { userId: user4.id, amount: 5000, method: 'UPI', utrNumber: 'UTR777888999', status: 'APPROVED', approvedById: admin.id },
      { userId: user2.id, amount: 15000, method: 'BANK_TRANSFER', status: 'PENDING' },
    ],
  })

  // ── Withdrawals ───────────────────────────────────────────
  await prisma.withdrawal.createMany({
    data: [
      {
        userId: user1.id,
        amount: 10000,
        walletType: 'MAIN',
        status: 'APPROVED',
        bankDetails: { bankName: 'HDFC Bank', accountNo: '1234567890', ifsc: 'HDFC0001234', accountName: 'Arjun Kumar' },
        approvedById: admin.id,
        processedAt: new Date('2026-05-10'),
      },
      {
        userId: user3.id,
        amount: 5000,
        walletType: 'MAIN',
        status: 'PENDING',
        bankDetails: { bankName: 'SBI', accountNo: '9876543210', ifsc: 'SBIN0001234', accountName: 'Vikram Singh' },
      },
    ],
  })

  // ── Transactions ──────────────────────────────────────────
  await prisma.transaction.createMany({
    data: [
      { userId: user1.id, type: 'DEPOSIT', amount: 50000, status: 'COMPLETED', reference: 'DEP001', description: 'UPI Deposit', walletType: 'MAIN' },
      { userId: user1.id, type: 'INVESTMENT', amount: 50000, status: 'COMPLETED', reference: 'INV001', description: 'Gold Plan Investment', walletType: 'MAIN' },
      { userId: user1.id, type: 'PROFIT', amount: 7500, status: 'COMPLETED', reference: 'PRF001', description: 'Gold Plan ROI', walletType: 'MAIN' },
      { userId: user1.id, type: 'REFERRAL_BONUS', amount: 2000, status: 'COMPLETED', reference: 'REF001', description: 'Referral Commission', walletType: 'REFERRAL' },
      { userId: user1.id, type: 'WITHDRAWAL', amount: 10000, status: 'COMPLETED', reference: 'WTH001', description: 'Bank Withdrawal', walletType: 'MAIN' },
      { userId: user2.id, type: 'DEPOSIT', amount: 20000, status: 'COMPLETED', reference: 'DEP002', description: 'UPI Deposit', walletType: 'MAIN' },
      { userId: user2.id, type: 'INVESTMENT', amount: 20000, status: 'COMPLETED', reference: 'INV002', description: 'Silver Plan Investment', walletType: 'MAIN' },
      { userId: user3.id, type: 'DEPOSIT', amount: 35000, status: 'COMPLETED', reference: 'DEP003', description: 'QR Code Deposit', walletType: 'MAIN' },
      { userId: user3.id, type: 'PROFIT', amount: 3150, status: 'COMPLETED', reference: 'PRF003', description: 'Silver Plan ROI', walletType: 'MAIN' },
      { userId: user4.id, type: 'DEPOSIT', amount: 5000, status: 'COMPLETED', reference: 'DEP004', description: 'UPI Deposit', walletType: 'MAIN' },
    ],
  })

  // ── Referrals ─────────────────────────────────────────────
  await prisma.referral.createMany({
    data: [
      { referrerId: user1.id, referredId: user2.id, commission: 1000, level: 1 },
      { referrerId: user1.id, referredId: user3.id, commission: 1750, level: 1 },
    ],
  })

  // ── KYC ───────────────────────────────────────────────────
  await prisma.kYC.createMany({
    data: [
      { userId: user1.id, aadhaarNo: 'XXXX-XXXX-1234', panNo: 'ABCDE1234F', status: 'APPROVED', reviewedById: admin.id, reviewedAt: new Date() },
      { userId: user2.id, aadhaarNo: 'XXXX-XXXX-5678', panNo: 'FGHIJ5678K', status: 'PENDING' },
      { userId: user3.id, aadhaarNo: 'XXXX-XXXX-9012', panNo: 'LMNOP9012Q', status: 'APPROVED', reviewedById: admin.id, reviewedAt: new Date() },
    ],
  })

  // ── Notifications ─────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      { userId: user1.id, title: 'Deposit Approved', message: 'Your deposit of ₹50,000 has been approved.', type: 'SUCCESS', isRead: true },
      { userId: user1.id, title: 'Investment Active', message: 'Your Gold Plan investment is now active.', type: 'INFO', isRead: true },
      { userId: user1.id, title: 'ROI Credited', message: '₹7,500 profit has been credited to your wallet.', type: 'SUCCESS', isRead: false },
      { userId: user2.id, title: 'Welcome to InvestPro!', message: 'Your account has been created successfully.', type: 'INFO', isRead: true },
      { userId: user2.id, title: 'KYC Pending', message: 'Please complete your KYC verification.', type: 'WARNING', isRead: false },
    ],
  })

  console.log('✅ Sample data seeded successfully!')
  console.log('─────────────────────────────────────')
  console.log('📧 Admin Login: admin@vrgalaxy.com / Vrgalaxy@4321admin')
  console.log('📧 User Login: arjun@example.com / User@123')
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
