'use client'

import { useState } from 'react'
import { User, Lock, Shield, Calendar, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate, formatCurrency } from '@/utils/formatters'
import { logoutAction } from '@/actions/auth'
import { updateProfileAction, uploadProfilePictureAction } from '@/actions/user'

interface ProfileClientProps {
  user: {
    id: string; name: string; email: string; phone: string | null
    status: string; createdAt: string; referralCode: string
    profilePictureUrl?: string | null
    dateOfBirth?: string | null
    addressLine?: string | null
    city?: string | null
    state?: string | null
    pinCode?: string | null
    membershipPlan?: {
      name: string
      price: number
    } | null
    membershipPlanActivatedAt?: string | null
    membershipPlanExpiresAt?: string | null
  }
}

export function ProfileClient({ user }: ProfileClientProps) {
  const [name, setName] = useState(user.name)
  const [phone, setPhone] = useState(user.phone || '')
  const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '')
  const [addressLine, setAddressLine] = useState(user.addressLine || '')
  const [city, setCity] = useState(user.city || '')
  const [state, setState] = useState(user.state || '')
  const [pinCode, setPinCode] = useState(user.pinCode || '')
  const [profilePicUrl, setProfilePicUrl] = useState(user.profilePictureUrl || '')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')

  const initials = user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData()
    formData.set('name', name)
    formData.set('phone', phone)
    formData.set('dateOfBirth', dateOfBirth)
    formData.set('addressLine', addressLine)
    formData.set('city', city)
    formData.set('state', state)
    formData.set('pinCode', pinCode)
    const result = await updateProfileAction(formData)
    setMsg(result.message)
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const fd = new FormData()
    fd.set('profilePic', file)

    try {
      const result = await uploadProfilePictureAction(fd)
      if (result.success && result.data?.profilePictureUrl) {
        setProfilePicUrl(result.data.profilePictureUrl)
        setMsg('Profile picture updated successfully!')
        setTimeout(() => setMsg(''), 3000)
      } else {
        setMsg(result.message || 'Failed to upload profile picture.')
        setTimeout(() => setMsg(''), 3000)
      }
    } catch (err) {
      setMsg('An error occurred during upload.')
      setTimeout(() => setMsg(''), 3000)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Profile Settings</h1>

      {/* Avatar */}
      <div className="premium-card p-6 flex flex-col sm:flex-row items-center gap-4">
        {profilePicUrl ? (
          <img src={profilePicUrl} alt={user.name} className="w-16 h-16 rounded-full object-cover border-2 border-primary shadow-md" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-transparent shadow-md">
            {initials}
          </div>
        )}
        <div className="text-center sm:text-left">
          <h2 className="font-bold text-lg text-white">{user.name}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="flex items-center gap-4 mt-2 justify-center sm:justify-start">
            <label className="text-xs bg-primary/20 hover:bg-primary/30 text-primary font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all border border-primary/25">
              Upload Photo
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploading} />
            </label>
            {uploading && <span className="text-xs text-muted-foreground animate-pulse">Uploading to Cloudinary...</span>}
          </div>
        </div>
        <div className="sm:ml-auto">
          <span className="status-badge text-xs bg-green-500/10 text-green-500">{user.status}</span>
        </div>
      </div>

      {/* Edit Profile */}
      <div className="premium-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold">Personal Information</h2>
        </div>
        {msg && <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm">{msg}</div>}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="form-input" required />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="form-input" required />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Date of Birth</label>
              <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="form-input" required />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Email (Read-only)</label>
              <input type="email" value={user.email} readOnly className="form-input opacity-60 cursor-not-allowed" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium block mb-1.5">Address</label>
              <input type="text" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} className="form-input" required />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">City</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="form-input" required />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">State</label>
              <input type="text" value={state} onChange={(e) => setState(e.target.value)} className="form-input" required />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">PIN Code</label>
              <input type="text" value={pinCode} onChange={(e) => setPinCode(e.target.value)} className="form-input" required />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Referral Code</label>
              <input type="text" value={user.referralCode} readOnly className="form-input opacity-60 cursor-not-allowed font-mono" />
            </div>
          </div>
          <Button type="submit" loading={saving}>Save Changes</Button>
        </form>
      </div>

      {/* Active Membership Details */}
      <div className="premium-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Crown className="w-4 h-4 text-amber-500" />
          <h2 className="font-semibold text-white">Active Membership Details</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-brand-200">
          <div>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Active Plan Name</p>
            <p className="text-base font-bold text-white mt-1">{user.membershipPlan?.name || 'Free Membership'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Plan Amount</p>
            <p className="text-base font-bold text-white mt-1">{formatCurrency(user.membershipPlan?.price || 0)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Plan Activation Date</p>
            <p className="text-base font-bold text-white mt-1">
              {user.membershipPlanActivatedAt ? formatDate(user.membershipPlanActivatedAt) : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Plan Expiry Date</p>
            <p className="text-base font-bold text-white mt-1">
              {user.membershipPlanExpiresAt ? formatDate(user.membershipPlanExpiresAt) : 'N/A'}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Current Plan Status</p>
            <p className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                user.membershipPlanExpiresAt && new Date() > new Date(user.membershipPlanExpiresAt)
                  ? 'bg-red-500/10 text-red-500 border border-red-500/25'
                  : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25'
              }`}>
                {user.membershipPlanExpiresAt && new Date() > new Date(user.membershipPlanExpiresAt) ? 'Expired' : 'Active'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="premium-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold">Security</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
            <div>
              <p className="text-sm font-medium">Change Password</p>
              <p className="text-xs text-muted-foreground">Update your account password</p>
            </div>
            <Button variant="outline" size="sm">Change</Button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
            <div>
              <p className="text-sm font-medium">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Add extra security to your account</p>
            </div>
            <Button variant="outline" size="sm">Enable</Button>
          </div>
        </div>
      </div>


      {/* Danger Zone */}
      <div className="premium-card p-6 border-red-500/20">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-red-500" />
          <h2 className="font-semibold text-red-500">Account Actions</h2>
        </div>
        <Button variant="destructive" onClick={() => logoutAction()} className="w-full sm:w-auto">
          Logout from All Devices
        </Button>
      </div>
    </div>
  )
}
