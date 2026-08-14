export function getMembershipDisplayName(planName?: string | null): string {
  return !planName || planName === 'Free Membership' || planName === 'Standard'
    ? 'Standard Membership'
    : planName
}
