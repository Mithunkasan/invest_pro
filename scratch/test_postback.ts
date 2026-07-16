import { NextRequest } from 'next/server'
import { GET } from '../app/api/timewall/postback/route'
import { prisma } from '../lib/prisma'

async function test() {
  const user = await prisma.user.findFirst({
    where: { email: 'rkadirvelan@gmail.com' }
  })
  if (!user) {
    console.error('User rkadirvelan@gmail.com not found')
    return
  }

  const userId = user.id
  console.log(`Testing with user ID: ${userId}`)

  // Retrieve current config to check multiplier/conversion value
  const systemSettings = await prisma.systemSettings.findUnique({
    where: { id: 'default' }
  })
  const currentMultiplier = systemSettings?.timeWallPercentFree ?? 0.005
  console.log(`Current free user multiplier in DB: ${currentMultiplier}`)

  // Set the secret
  const secret = '8b005804fe45684994ea8351431fca40'

  // --- TEST 1: Standard Points parameter ---
  console.log('\n--- TEST 1: points & transaction_id ---')
  const mockTxnId1 = `mock_txn_points_${Date.now()}`
  const url1 = `http://localhost:3000/api/timewall/postback?user_id=${userId}&points=650&payout=0.055&secret=${secret}&transaction_id=${mockTxnId1}`
  console.log(`Mocking request to: ${url1}`)
  
  const req1 = new NextRequest(url1)
  const res1 = await GET(req1)
  console.log('Response Status:', res1.status)
  const body1 = await res1.text()
  console.log('Response Body:', body1)

  const tx1 = await prisma.transaction.findFirst({
    where: { reference: `TIMEWALL:${mockTxnId1}` }
  })
  if (tx1 && body1 === '1') {
    console.log('Test 1 Passed: Transaction created successfully.')
    console.log(`Amount: ${tx1.amount}, Status: ${tx1.status}, WalletType: ${tx1.walletType}`)
  } else {
    console.error('Test 1 Failed!')
  }

  // --- TEST 2: Withdrawal style (currency_amount & withdraw_id) ---
  console.log('\n--- TEST 2: currency_amount & withdraw_id ---')
  const mockWithdrawId = `19421578_test_${Date.now()}`
  const url2 = `http://localhost:3000/api/timewall/postback?user_id=${userId}&currency_amount=3031&payout=0.3031&secret=${secret}&withdraw_id=${mockWithdrawId}`
  console.log(`Mocking request to: ${url2}`)

  const req2 = new NextRequest(url2)
  const res2 = await GET(req2)
  console.log('Response Status:', res2.status)
  const body2 = await res2.text()
  console.log('Response Body:', body2)

  const tx2 = await prisma.transaction.findFirst({
    where: { reference: `TIMEWALL:${mockWithdrawId}` }
  })
  if (tx2 && body2 === '1') {
    console.log('Test 2 Passed: Transaction created successfully for withdrawal style.')
    console.log(`Amount: ${tx2.amount}, Status: ${tx2.status}, WalletType: ${tx2.walletType}`)
  } else {
    console.error('Test 2 Failed!')
  }

  // --- TEST 3: Specific parameters from the screenshot (external_user_id & rate_points & withdraw_id) ---
  console.log('\n--- TEST 3: Specific parameters from the screenshot (external_user_id & rate_points & withdraw_id) ---')
  const mockWithdrawId3 = `19421578_sc_${Date.now()}`
  const url3 = `http://localhost:3000/api/timewall/postback?external_user_id=${userId}&rate_points=3031&payout=0.3031&secret=${secret}&withdraw_id=${mockWithdrawId3}`
  console.log(`Mocking request to: ${url3}`)

  const req3 = new NextRequest(url3)
  const res3 = await GET(req3)
  console.log('Response Status:', res3.status)
  const body3 = await res3.text()
  console.log('Response Body:', body3)

  const tx3 = await prisma.transaction.findFirst({
    where: { reference: `TIMEWALL:${mockWithdrawId3}` }
  })
  if (tx3 && body3 === '1') {
    console.log('Test 3 Passed: Transaction created successfully with screenshot parameter keys.')
    console.log(`Amount: ${tx3.amount}, Status: ${tx3.status}, WalletType: ${tx3.walletType}`)
  } else {
    console.error('Test 3 Failed!')
  }

  // --- TEST 4: Duplicate Request ---
  console.log('\n--- TEST 4: Duplicate Request ---')
  console.log(`Re-requesting same duplicate URL: ${url3}`)
  const req4 = new NextRequest(url3)
  const res4 = await GET(req4)
  console.log('Response Status:', res4.status)
  const body4 = await res4.text()
  console.log('Response Body:', body4)
  if (body4 === '1') {
    console.log('Test 4 Passed: Duplicate postback correctly ignored and returned "1".')
  } else {
    console.error('Test 4 Failed!')
  }
}

test()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
