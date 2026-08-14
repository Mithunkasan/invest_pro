import { prisma } from '../lib/prisma'

async function main() {
  try {
    const email = 'asarahamed138@gmail.com'
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.log(`User with email ${email} not found!`)
      return
    }

    console.log(`Found user: ${user.name} (${user.email})`)
    console.log(`Old memberType: ${user.memberType}`)

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        memberType: 'BASIC',
      },
    })

    console.log(`New memberType: ${updatedUser.memberType}`)
    console.log('Database updated successfully!')
  } catch (err) {
    console.error('Error updating user membership type:', err)
  }
}

main()
