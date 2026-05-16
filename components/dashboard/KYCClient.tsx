'use client'

import { useState } from 'react'
import { ShieldCheck, ShieldX, Clock, Upload, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getStatusColor } from '@/utils/formatters'
import type { KYC } from '@/types'

const steps = [
  { id: 'aadhaar', label: 'Aadhaar Card', desc: 'Front side of your Aadhaar card', icon: '🪪' },
  { id: 'pan', label: 'PAN Card', desc: 'Your PAN card for tax verification', icon: '💳' },
  { id: 'selfie', label: 'Selfie with ID', desc: 'Hold your ID and take a selfie', icon: '🤳' },
]

export function KYCClient({ kyc }: { kyc: KYC | null }) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [aadhaarNo, setAadhaarNo] = useState(kyc?.aadhaarNo || '')
  const [panNo, setPanNo] = useState(kyc?.panNo || '')

  const statusInfo = {
    APPROVED: { icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-500/10', label: 'KYC Verified ✅', desc: 'Your identity has been verified successfully.' },
    REJECTED: { icon: ShieldX, color: 'text-red-500', bg: 'bg-red-500/10', label: 'KYC Rejected', desc: kyc?.remarks || 'Please resubmit your documents.' },
    PENDING: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Under Review', desc: 'Your documents are being reviewed. This takes 24-48 hours.' },
  }

  if (kyc?.status === 'APPROVED') {
    const info = statusInfo.APPROVED
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">KYC Verification</h1>
        <div className={`premium-card p-8 text-center ${info.bg}`}>
          <info.icon className={`w-16 h-16 ${info.color} mx-auto mb-4`} />
          <h2 className="text-xl font-bold text-green-500 mb-2">{info.label}</h2>
          <p className="text-muted-foreground">{info.desc}</p>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    // In production, this would upload files and submit to API
    await new Promise(r => setTimeout(r, 1500)) // Simulate upload
    setMsg({ type: 'success', text: 'KYC documents submitted successfully. Under review within 24-48 hours.' })
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">KYC Verification</h1>

      {kyc?.status === 'PENDING' && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <Clock className="w-5 h-5 text-yellow-500" />
          <div>
            <p className="font-medium text-yellow-500">Under Review</p>
            <p className="text-sm text-muted-foreground">Your documents are being reviewed. 24-48 hours.</p>
          </div>
        </div>
      )}
      {kyc?.status === 'REJECTED' && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <ShieldX className="w-5 h-5 text-red-500" />
          <div>
            <p className="font-medium text-red-500">Rejected — Please Resubmit</p>
            <p className="text-sm text-muted-foreground">{kyc.remarks || 'Contact support'}</p>
          </div>
        </div>
      )}

      {msg && (
        <div className={`p-4 rounded-xl text-sm ${msg.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-500' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          {msg.text}
        </div>
      )}

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${kyc?.status === 'PENDING' || kyc?.status === 'APPROVED' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
              {i + 1}
            </div>
            <span className="text-xs hidden sm:block">{step.label}</span>
            {i < steps.length - 1 && <div className="flex-1 h-px bg-border min-w-[20px]" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Aadhaar */}
        <div className="premium-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🪪</span>
            <div>
              <h3 className="font-semibold">Aadhaar Card</h3>
              <p className="text-xs text-muted-foreground">Upload front side of Aadhaar</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Aadhaar Number</label>
              <input type="text" value={aadhaarNo} onChange={(e) => setAadhaarNo(e.target.value)} placeholder="XXXX-XXXX-XXXX" className="form-input" maxLength={14} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Upload Aadhaar</label>
              <label className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to upload</span>
                <input type="file" accept="image/*,application/pdf" className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* PAN */}
        <div className="premium-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">💳</span>
            <div>
              <h3 className="font-semibold">PAN Card</h3>
              <p className="text-xs text-muted-foreground">Upload your PAN card</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">PAN Number</label>
              <input type="text" value={panNo} onChange={(e) => setPanNo(e.target.value.toUpperCase())} placeholder="ABCDE1234F" className="form-input" maxLength={10} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Upload PAN</label>
              <label className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to upload</span>
                <input type="file" accept="image/*,application/pdf" className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Selfie */}
        <div className="premium-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🤳</span>
            <div>
              <h3 className="font-semibold">Selfie with ID</h3>
              <p className="text-xs text-muted-foreground">Hold your Aadhaar/PAN and take a clear selfie</p>
            </div>
          </div>
          <label className="flex flex-col items-center justify-center gap-2 px-4 py-8 rounded-xl border-2 border-dashed border-border hover:border-primary cursor-pointer transition-colors">
            <Upload className="w-6 h-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Upload selfie with ID card</span>
            <input type="file" accept="image/*" className="hidden" />
          </label>
        </div>

        <Button type="submit" size="lg" loading={loading}>
          <CheckCircle className="w-4 h-4" />
          Submit KYC Documents
        </Button>
      </form>
    </div>
  )
}
