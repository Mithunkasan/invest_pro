import { PrismaClient } from '@prisma/client'

async function main() {
  const url = process.env.DATABASE_URL_UNPOOLED
  console.log('Testing with DATABASE_URL_UNPOOLED:', url)
  if (!url) {
    console.error('DATABASE_URL_UNPOOLED not set!')
    return
  }
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: url
      }
    }
  })
  try {
    const settings = await prisma.systemSettings.findFirst()
    console.log('Successfully connected to unpooled database! settings:', settings)
  } catch (err) {
    console.error('Failed to connect to unpooled database:', err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
