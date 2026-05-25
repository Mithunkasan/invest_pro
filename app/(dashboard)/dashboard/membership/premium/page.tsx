import { redirect } from 'next/navigation'

export default function PremiumMembershipRedirect() {
  redirect('/dashboard/membership')
}
