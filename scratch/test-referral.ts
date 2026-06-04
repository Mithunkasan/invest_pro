import { prisma } from '../lib/prisma'
import { registerAction } from '../actions/auth'
import { handleDeposit } from '../actions/admin'
import { signToken } from '../lib/auth'

async function runTests() {
  console.log('🧪 Starting referral commission system tests...')

  try {
    // Ensure test admin exists in database to satisfy foreign key constraint
    await prisma.admin.upsert({
      where: { id: 'test-admin-id' },
      update: {},
      create: {
        id: 'test-admin-id',
        username: 'testadmin',
        email: 'testadmin@example.com',
        passwordHash: 'dummyhash',
        role: 'SUPER_ADMIN'
      }
    })

    // 2. Cleanup previous test users
    console.log('🧹 Cleaning up old test data...')
    const testEmails = ['anzil_test@example.com', 'ajith_test@example.com', 'vijay_test@example.com']
    const testUsers = await prisma.user.findMany({
      where: { email: { in: testEmails } }
    })
    const testUserIds = testUsers.map(u => u.id)

    if (testUserIds.length > 0) {
      await prisma.notification.deleteMany({ where: { userId: { in: testUserIds } } })
      await prisma.transaction.deleteMany({ where: { userId: { in: testUserIds } } })
      await prisma.deposit.deleteMany({ where: { userId: { in: testUserIds } } })
      await prisma.wallet.deleteMany({ where: { userId: { in: testUserIds } } })
      await prisma.referral.deleteMany({
        where: {
          OR: [
            { referrerId: { in: testUserIds } },
            { referredId: { in: testUserIds } }
          ]
        }
      })
      await prisma.user.deleteMany({ where: { id: { in: testUserIds } } })
    }

    // 3. Create Anzil (Referrer)
    console.log('👤 Creating referrer (Anzil)...')
    const anzil = await prisma.user.create({
      data: {
        name: 'Anzil Test',
        email: 'anzil_test@example.com',
        phone: '9999999999',
        passwordHash: 'dummyhash',
        referralCode: 'ANZIL_TEST_REF',
        memberType: 'PREMIUM'
      }
    })
    await prisma.wallet.create({ data: { userId: anzil.id } })

    // 4. Test Registration with Invalid Referral Code
    console.log('🚫 Testing registration with invalid referral code...')
    const badFormData = new FormData()
    badFormData.append('name', 'Ajith Test')
    badFormData.append('email', 'ajith_test@example.com')
    badFormData.append('phone', '8888888888')
    badFormData.append('password', 'Password123')
    badFormData.append('confirmPassword', 'Password123')
    badFormData.append('referralCode', 'WRONG_REF_CODE')
    badFormData.append('terms', 'on')

    const badResult = await registerAction(badFormData)
    console.log('Result (expected failure):', badResult)
    if (badResult.success) {
      throw new Error('Registration should have failed with invalid referral code!')
    }
    console.log('✅ Validation worked! Invalid referral code was blocked.')

    // 5. Register Ajith with Anzil's code
    console.log('✅ Registering Ajith with valid code (ANZIL_TEST_REF)...')
    const ajithFormData = new FormData()
    ajithFormData.append('name', 'Ajith Test')
    ajithFormData.append('email', 'ajith_test@example.com')
    ajithFormData.append('phone', '8888888888')
    ajithFormData.append('password', 'Password123')
    ajithFormData.append('confirmPassword', 'Password123')
    ajithFormData.append('referralCode', 'ANZIL_TEST_REF')
    ajithFormData.append('terms', 'on')

    const ajithResult = await registerAction(ajithFormData)
    if (!ajithResult.success) {
      throw new Error(`Ajith registration failed: ${ajithResult.message}`)
    }
    const ajithUser = await prisma.user.findUnique({ where: { email: 'ajith_test@example.com' } })
    if (!ajithUser || ajithUser.referredById !== anzil.id) {
      throw new Error('Ajith was not correctly referred by Anzil!')
    }
    console.log('✅ Ajith registered successfully and referredById is correct.')

    // 6. Register Vijay with Anzil's code
    console.log('✅ Registering Vijay with valid code (ANZIL_TEST_REF)...')
    const vijayFormData = new FormData()
    vijayFormData.append('name', 'Vijay Test')
    vijayFormData.append('email', 'vijay_test@example.com')
    vijayFormData.append('phone', '7777777777')
    vijayFormData.append('password', 'Password123')
    vijayFormData.append('confirmPassword', 'Password123')
    vijayFormData.append('referralCode', 'ANZIL_TEST_REF')
    vijayFormData.append('terms', 'on')

    const vijayResult = await registerAction(vijayFormData)
    if (!vijayResult.success) {
      throw new Error(`Vijay registration failed: ${vijayResult.message}`)
    }
    const vijayUser = await prisma.user.findUnique({ where: { email: 'vijay_test@example.com' } })
    if (!vijayUser || vijayUser.referredById !== anzil.id) {
      throw new Error('Vijay was not correctly referred by Anzil!')
    }
    console.log('✅ Vijay registered successfully and referredById is correct.')

    // 7. Verify Referral records are created in database
    const referrals = await prisma.referral.findMany({ where: { referrerId: anzil.id } })
    if (referrals.length !== 2) {
      throw new Error(`Expected 2 referral records, found ${referrals.length}`)
    }
    console.log('✅ Referral link records stored correctly in the database.')

    // 8. Create and approve Deposit for Ajith (₹10,000)
    console.log('💵 Testing Ajith deposit (₹10,000)...')
    const ajithDeposit = await prisma.deposit.create({
      data: {
        userId: ajithUser.id,
        amount: 10000,
        method: 'UPI',
        utrNumber: 'UTR1111111111',
        status: 'PENDING'
      }
    })

    console.log('⚙️ Approving Ajith deposit via admin handleDeposit...')
    const approveAjithRes = await handleDeposit(ajithDeposit.id, 'APPROVE')
    if (!approveAjithRes.success) {
      throw new Error(`Failed to approve Ajith deposit: ${approveAjithRes.message}`)
    }
    console.log('✅ Ajith deposit approved.')

    // 9. Create and approve Deposit for Vijay (₹5,000)
    console.log('💵 Testing Vijay deposit (₹5,000)...')
    const vijayDeposit = await prisma.deposit.create({
      data: {
        userId: vijayUser.id,
        amount: 5000,
        method: 'UPI',
        utrNumber: 'UTR2222222222',
        status: 'PENDING'
      }
    })

    console.log('⚙️ Approving Vijay deposit via admin handleDeposit...')
    const approveVijayRes = await handleDeposit(vijayDeposit.id, 'APPROVE')
    if (!approveVijayRes.success) {
      throw new Error(`Failed to approve Vijay deposit: ${approveVijayRes.message}`)
    }
    console.log('✅ Vijay deposit approved.')

    // 10. Verify Anzil's wallet and transaction history
    console.log('📊 Verifying referrer wallet balance and history...')
    const anzilWallet = await prisma.wallet.findUnique({ where: { userId: anzil.id } })
    console.log(`Anzil Referral Balance: ₹${anzilWallet?.referralBalance}`)
    
    // Default Level 1 rate is 10%. 10% of 10,000 = 1,000. 10% of 5,000 = 500. Total expected: 1,500.
    if (anzilWallet?.referralBalance !== 1500) {
      throw new Error(`Expected referral balance to be 1500, but got ${anzilWallet?.referralBalance}`)
    }
    console.log('✅ Anzil referral wallet balance is updated correctly (₹1,500).')

    // Verify transaction entries
    const anzilTxList = await prisma.transaction.findMany({
      where: { userId: anzil.id, type: 'REFERRAL_BONUS' }
    })
    console.log('Anzil Transactions count:', anzilTxList.length)
    for (const tx of anzilTxList) {
      console.log(`- Type: ${tx.type}, Wallet: ${tx.walletType}, Amount: ₹${tx.amount}, Desc: ${tx.description}`)
    }
    if (anzilTxList.length !== 2) {
      throw new Error(`Expected 2 referral transaction records, but found ${anzilTxList.length}`)
    }
    console.log('✅ Both referral transactions recorded correctly in referral history/logs.')

    // Verify Referral model commissions
    const updatedReferrals = await prisma.referral.findMany({ where: { referrerId: anzil.id } })
    for (const ref of updatedReferrals) {
      const name = ref.referredId === ajithUser.id ? 'Ajith' : 'Vijay'
      console.log(`Referral commission for ${name}: ₹${ref.commission}`)
      const expected = ref.referredId === ajithUser.id ? 1000 : 500
      if (ref.commission !== expected) {
        throw new Error(`Expected commission for ${name} to be ${expected}, but got ${ref.commission}`)
      }
    }
    console.log('✅ Referral commission logs in database updated correctly.')

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! The referral commission system is working perfectly. 🎉')

  } catch (err) {
    console.error('❌ TEST FAILED:', err)
  } finally {
    // Cleanup admin
    await prisma.admin.deleteMany({ where: { id: 'test-admin-id' } })
    await prisma.$disconnect()
  }
}

runTests()
