'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { User, Lock, Globe, Palette, Shield, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/common/ThemeSwitcher'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { formatDate } from '@/utils/formatters'
import { logoutAction } from '@/actions/auth'

interface ProfileClientProps {
  user: {
    id: string; name: string; email: string; phone: string | null
    status: string; createdAt: string; referralCode: string
  }
}

export function ProfileClient({ user }: ProfileClientProps) {
  const [name, setName] = useState(user.name)
  const [phone, setPhone] = useState(user.phone || '')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const initials = user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await new Promise(r => setTimeout(r, 1000))
    setMsg('Profile updated successfully!')
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Profile Settings</h1>

      {/* Avatar */}
      <div className="premium-card p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
          {initials}
        </div>
        <div>
          <h2 className="font-bold text-lg">{user.name}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            Member since {formatDate(user.createdAt)}
          </div>
        </div>
        <div className="ml-auto">
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
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="form-input" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="form-input" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Email (Read-only)</label>
              <input type="email" value={user.email} readOnly className="form-input opacity-60 cursor-not-allowed" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Referral Code</label>
              <input type="text" value={user.referralCode} readOnly className="form-input opacity-60 cursor-not-allowed font-mono" />
            </div>
          </div>
          <Button type="submit" loading={saving}>Save Changes</Button>
        </form>
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

      {/* Appearance */}
      <div className="premium-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold">Appearance & Language</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground">Dark or Light mode</p>
            </div>
            <ThemeSwitcher />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
            <div>
              <p className="text-sm font-medium">Language</p>
              <p className="text-xs text-muted-foreground">English / தமிழ்</p>
            </div>
            <LanguageSwitcher />
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
