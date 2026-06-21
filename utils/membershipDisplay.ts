export function getMembershipDisplayName(planName?: string | null): string {
  return !planName || planName === 'Free Membership'
    ? 'Standard Membership'
    : planName
}
