const MEMBERSHIP_VALIDITY_DAYS = 1000

export function getMembershipEndDate(activatedAt: string): string {
  if (!activatedAt) return ''

  const datePart = activatedAt.split('T')[0]
  const endDate = new Date(`${datePart}T00:00:00.000Z`)
  endDate.setUTCDate(endDate.getUTCDate() + MEMBERSHIP_VALIDITY_DAYS)
  return endDate.toISOString().split('T')[0]
}
