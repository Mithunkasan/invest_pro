import { prisma } from '@/lib/prisma'

export async function checkAndExpireMembership(userId: string) {
  return // Deactivation/expiration is evaluated dynamically to preserve plan records
}
