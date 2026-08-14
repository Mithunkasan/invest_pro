import { prisma } from '../lib/prisma'

async function main() {
  try {
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    })
    console.log(`Found ${adminUsers.length} users with role 'ADMIN':`)
    adminUsers.forEach(u => {
      console.log({ id: u.id, name: u.name, email: u.email, role: u.role, memberType: u.memberType })
    })
  } catch (err) {
    console.error('Error fetching admin users:', err)
  }
}

main()
