import { prisma } from '../lib/prisma'

async function main() {
  try {
    const plans = await prisma.membershipPlan.findMany()
    console.log('All membership plans in DB:')
    plans.forEach(plan => {
      console.log({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        durationDays: plan.durationDays,
        isActive: plan.isActive,
      })
    })
  } catch (err) {
    console.error('Error fetching plans:', err)
  }
}

main()
