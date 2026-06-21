export function isUplineEligibleForLevel(
  level: number,
  activeDirectReferralCount: number
): boolean {
  if (!Number.isInteger(level) || level < 1) return false
  return level === 1 || activeDirectReferralCount >= level
}
