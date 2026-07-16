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
  const mockTxnId = `mock_txn_points_${Date.now()}`

  // Mock postback URL parameters with points=650 and payout=0.055
  const url = `http://localhost:3000/api/timewall/postback?user_id=${userId}&points=650&payout=0.055&secret=${secret}&transaction_id=${mockTxnId}`
  console.log(`Mocking request to: ${url}`)
  
  const req = new NextRequest(url)
  const res = await GET(req)
  console.log('Response Status:', res.status)
  const body = await res.json()
  console.log('Response Body:', JSON.stringify(body, null, 2))

  // Find the created transaction in the database
  const tx = await prisma.transaction.findFirst({
    where: { reference: `TIMEWALL:${mockTxnId}` }
  })

  if (tx) {
    console.log('--- Created Transaction in Database ---')
    console.log(`ID: ${tx.id}`)
    console.log(`Amount: ${tx.amount} (Type: ${typeof tx.amount})`)
    console.log(`Status: ${tx.status}`)
    console.log(`WalletType: ${tx.walletType}`)
    console.log(`Description: "${tx.description}"`)
  } else {
    console.error('Error: Transaction was not found in the database!')
  }
}

test()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
