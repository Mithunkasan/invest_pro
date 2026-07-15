import { NextRequest } from 'next/server'
import { GET } from '../app/api/timewall/postback/route'
import { prisma } from '../lib/prisma'

async function test() {
  // Let's find Jeevitha V
  const user = await prisma.user.findFirst({
    where: { email: 'rkadirvelan@gmail.com' }
  })
  if (!user) {
    console.error('User Jeevitha V not found')
    return
  }

  // Use their id
  const userId = user.id
  console.log(`Testing with user ID: ${userId}`)

  // Get current timewall postback secret
  const config = await prisma.systemSettings.findUnique({
    where: { id: 'default' }
  })
  // Wait, the secret in .timewall-settings.json is 8b005804fe45684994ea8351431fca40
  const secret = '8b005804fe45684994ea8351431fca40'

  const url = `http://localhost:3000/api/timewall/postback?user_id=${userId}&points=1000&payout=0.10&secret=${secret}&transaction_id=mock_txn_${Date.now()}`
  console.log(`Mocking request to: ${url}`)
  
  const req = new NextRequest(url)
  const res = await GET(req)
  console.log('Response Status:', res.status)
  const body = await res.json()
  console.log('Response Body:', JSON.stringify(body, null, 2))
}

test()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
