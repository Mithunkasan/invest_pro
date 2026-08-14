import { prisma } from '../lib/prisma'

async function main() {
  try {
    const email = 'asarahamed138@gmail.com'
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        kyc: true,
        membershipPlan: true,
        deposits: {
          where: { status: 'APPROVED' }
        }
      }
    })
    if (!user) {
      console.log(`User ${email} not found!`)
      return
    }
    console.log('User details:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      memberType: user.memberType,
      profileCompleted: user.profileCompleted,
      membershipPlanId: user.membershipPlanId,
      membershipPlanActivatedAt: user.membershipPlanActivatedAt,
      membershipPlanExpiresAt: user.membershipPlanExpiresAt,
      membershipPlanName: user.membershipPlan?.name,
      kycStatus: user.kyc?.status,
      approvedDepositsCount: user.deposits.length,
    })
  } catch (err) {
    console.error('Error querying user details:', err)
  }
}

main()
