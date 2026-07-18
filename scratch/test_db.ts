import { prisma } from '../lib/prisma'

async function main() {
  try {
    const settings = await prisma.systemSettings.findFirst()
    console.log('Successfully fetched settings! settings:', settings)
  } catch (err) {
    console.error('Failed to fetch settings:', err)
  }
}

main()
