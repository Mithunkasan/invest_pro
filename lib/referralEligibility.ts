export function isUplineEligibleForLevel(
  level: number,
  activatedDirectReferralCount: number
): boolean {
  if (!Number.isInteger(level) || level < 1) return false
  return level === 1 || activatedDirectReferralCount >= level
}
