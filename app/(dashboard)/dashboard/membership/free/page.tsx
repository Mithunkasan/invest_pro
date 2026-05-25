import { redirect } from 'next/navigation'

export default function FreeMembershipRedirect() {
  redirect('/dashboard/membership')
}
