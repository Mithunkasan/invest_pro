import { NextRequest } from 'next/server'
import { GET } from '../app/api/timewall/postback/route'
import { prisma } from '../lib/prisma'
import { syncWalletMainBalance } from '../actions/walletUtils'

async function test() {
  const user = await prisma.user.findFirst({
    where: { email: 'rkadirvelan@gmail.com' },
    include: { wallet: true, membershipPlan: true }
  })
  if (!user) {
    console.error('User rkadirvelan@gmail.com not found')
    return
  }

  const userId = user.id
  console.log(`Testing with user ID: ${userId}`)
  
  // Ensure wallet mainBalance is fully synced before test starts
  await syncWalletMainBalance(prisma, userId)
  
  const initialUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true }
  })

  console.log('Wallet balances BEFORE postback (fully synced):')
  console.log(`- taskBalance: ${initialUser?.wallet?.taskBalance}`)
  console.log(`- mainBalance: ${initialUser?.wallet?.mainBalance}`)

  // Retrieve current config to check multiplier/conversion value
  const systemSettings = await prisma.systemSettings.findUnique({
    where: { id: 'default' }
  })
  
  // Determine correct multiplier based on membership plan
  const isFree = !user.membershipPlan || user.membershipPlan.price === 0
  const currentMultiplier = isFree
    ? (systemSettings?.timeWallPercentFree ?? 0.005)
    : (user.membershipPlan?.timeWallPercent ?? 0.005)

  console.log(`Multiplier used: ${currentMultiplier} (isFree: ${isFree})`)

  // Set the secret
  const secret = '8b005804fe45684994ea8351431fca40'

  // --- TEST: Exact URL parameters from user screenshot ---
  console.log('\n--- Running Postback Test (userid & reward & txid) ---')
  const mockTxId = `wddc7a6a-133e-41b8-9f7e-direct-${Date.now()}`
  const url = `http://localhost:3000/api/timewall/postback?secret=${secret}&userid=${userId}&reward=0.3031&txid=${mockTxId}`
  console.log(`Mocking request to: ${url}`)

  const req = new NextRequest(url)
  const res = await GET(req)
  console.log('Response Status:', res.status)
  const body = await res.text()
  console.log('Response Body:', body)

  const tx = await prisma.transaction.findFirst({
    where: { reference: `TIMEWALL:${mockTxId}` }
  })
  
  const updatedUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true }
  })

  console.log('\nWallet balances AFTER postback:')
  console.log(`- taskBalance: ${updatedUser?.wallet?.taskBalance}`)
  console.log(`- mainBalance: ${updatedUser?.wallet?.mainBalance}`)

  if (tx && body === '1') {
    console.log('\n--- Transaction Created in Database ---')
    console.log(`Amount: ${tx.amount}, Status: ${tx.status}, WalletType: ${tx.walletType}`)
    
    // Check if taskBalance and mainBalance were correctly incremented
    const expectedIncrement = 3031 * currentMultiplier
    const actualTaskIncrement = (updatedUser?.wallet?.taskBalance || 0) - (initialUser?.wallet?.taskBalance || 0)
    const actualMainIncrement = (updatedUser?.wallet?.mainBalance || 0) - (initialUser?.wallet?.mainBalance || 0)
    
    console.log(`Expected Increment: ${expectedIncrement}`)
    console.log(`Actual Task Balance Increment: ${actualTaskIncrement}`)
    console.log(`Actual Main Balance Increment: ${actualMainIncrement}`)

    const taskMatch = Math.abs(actualTaskIncrement - expectedIncrement) < 0.0001
    const mainMatch = Math.abs(actualMainIncrement - expectedIncrement) < 0.0001

    if (tx.status === 'COMPLETED' && taskMatch && mainMatch) {
      console.log('\nSUCCESS: TimeWall earnings credited directly to Task Wallet and Main Wallet as COMPLETED!');
    } else {
      console.error('\nFAILURE: Wallet increments or transaction status did not match expected values.');
    }
  } else {
    console.error('Test Failed: Transaction not found in database or wrong response body.');
  }
}

test()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
