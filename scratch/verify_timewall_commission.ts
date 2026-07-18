import { NextRequest } from 'next/server'
import { GET } from '../app/api/timewall/postback/route'
import { prisma } from '../lib/prisma'
import { syncWalletMainBalance } from '../actions/walletUtils'

async function main() {
  console.log('--- STARTING TIMEWALL REFERRAL COMMISSION VERIFICATION ---')

  // 1. Ensure test settings exist and are correct
  const settings = await prisma.systemSettings.upsert({
    where: { id: 'default' },
    update: {
      timeWallReferralCommissionStructure: '15,7,4', // custom percentages to verify it uses our configured setting
      timeWallPercentFree: 0.005,
    },
    create: {
      id: 'default',
      timeWallReferralCommissionStructure: '15,7,4',
      timeWallPercentFree: 0.005,
    }
  })
  console.log('Configured timeWallReferralCommissionStructure:', settings.timeWallReferralCommissionStructure)

  // 2. Set up test referrer and purchaser users
  let referrer = await prisma.user.findUnique({ where: { email: 'test_referrer@example.com' } })
  if (!referrer) {
    referrer = await prisma.user.create({
      data: {
        name: 'Test Referrer',
        email: 'test_referrer@example.com',
        passwordHash: 'dummy-hash',
        referralCode: 'test-referrer-code',
      }
    })
    console.log('Created test referrer:', referrer.email)
  }

  let purchaser = await prisma.user.findUnique({ where: { email: 'test_purchaser@example.com' } })
  if (!purchaser) {
    purchaser = await prisma.user.create({
      data: {
        name: 'Test Purchaser',
        email: 'test_purchaser@example.com',
        passwordHash: 'dummy-hash',
        referredById: referrer.id,
      }
    })
    console.log('Created test purchaser referred by test referrer:', purchaser.email)
  } else if (purchaser.referredById !== referrer.id) {
    purchaser = await prisma.user.update({
      where: { id: purchaser.id },
      data: { referredById: referrer.id }
    })
    console.log('Updated test purchaser upline referrer to:', referrer.email)
  }

  // Ensure wallets are initialized and synced
  await prisma.wallet.upsert({
    where: { userId: referrer.id },
    update: {},
    create: { userId: referrer.id }
  })
  await prisma.wallet.upsert({
    where: { userId: purchaser.id },
    update: {},
    create: { userId: purchaser.id }
  })

  await syncWalletMainBalance(prisma, referrer.id)
  await syncWalletMainBalance(prisma, purchaser.id)

  const referrerWalletBefore = await prisma.wallet.findUnique({ where: { userId: referrer.id } })
  console.log('\nReferrer Wallet BEFORE TimeWall Postback:')
  console.log(`- mainBalance: ${referrerWalletBefore?.mainBalance}`)
  console.log(`- referralBalance: ${referrerWalletBefore?.referralBalance}`)

  // 3. Trigger mock TimeWall postback
  const secret = '8b005804fe45684994ea8351431fca40'
  const mockTxId = `test_txn_${Date.now()}`
  const points = 1000 // e.g. 1000 points
  
  // Calculate expected user reward: 1000 points * 0.005 multiplier = ₹5.00
  const expectedUserAmount = points * 0.005
  // Expected Level 1 commission: 15% of ₹5.00 = ₹0.75
  const expectedCommission = Number(((expectedUserAmount * 15) / 100).toFixed(2))

  console.log(`\nSimulating TimeWall postback for purchaser:`)
  console.log(`- points: ${points}`)
  console.log(`- expected user reward amount: ₹${expectedUserAmount}`)
  console.log(`- expected referrer commission (15%): ₹${expectedCommission}`)

  const url = `http://localhost:3000/api/timewall/postback?secret=${secret}&userid=${purchaser.id}&points=${points}&txid=${mockTxId}`
  console.log(`Mock Request URL: ${url}`)

  const req = new NextRequest(url)
  const res = await GET(req)
  console.log('Response Status:', res.status)
  const body = await res.text()
  console.log('Response Body:', body)

  // 4. Verify results
  const referrerWalletAfter = await prisma.wallet.findUnique({ where: { userId: referrer.id } })
  console.log('\nReferrer Wallet AFTER TimeWall Postback:')
  console.log(`- mainBalance: ${referrerWalletAfter?.mainBalance}`)
  console.log(`- referralBalance: ${referrerWalletAfter?.referralBalance}`)

  const diffReferral = (referrerWalletAfter?.referralBalance || 0) - (referrerWalletBefore?.referralBalance || 0)
  const diffMain = (referrerWalletAfter?.mainBalance || 0) - (referrerWalletBefore?.mainBalance || 0)

  console.log('\nWallet Increments:')
  console.log(`- actual referralBalance increment: ₹${diffReferral}`)
  console.log(`- actual mainBalance increment: ₹${diffMain}`)

  const referralBonusTx = await prisma.transaction.findFirst({
    where: {
      userId: referrer.id,
      type: 'REFERRAL_BONUS',
      reference: { startsWith: `REFERRAL_COMMISSION:TIMEWALL:` }
    },
    orderBy: { createdAt: 'desc' }
  })

  if (referralBonusTx) {
    console.log('\nFound Referral Bonus Transaction in database:')
    console.log(`- amount: ₹${referralBonusTx.amount}`)
    console.log(`- reference: ${referralBonusTx.reference}`)
    console.log(`- description: ${referralBonusTx.description}`)
    console.log(`- status: ${referralBonusTx.status}`)
    console.log(`- walletType: ${referralBonusTx.walletType}`)
  } else {
    console.error('\nERROR: Referral Bonus Transaction NOT found in database!')
  }

  // Clean up test data if needed or leave it for verification
  if (Math.abs(diffReferral - expectedCommission) < 0.001 && referralBonusTx?.amount === expectedCommission) {
    console.log('\n>>> SUCCESS: TimeWall referral commission successfully configured, distributed, and verified! <<<')
  } else {
    console.error('\n>>> FAILURE: Distributed commission amount does not match expected values. <<<')
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
