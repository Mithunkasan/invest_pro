'use client'

import { useState } from 'react'
import { ShieldCheck, ShieldX, Clock, Upload, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { KYC } from '@/types'
import { submitKYC } from '@/actions/user'

const steps = [
  { id: 'aadhaar', label: 'Aadhaar Card', desc: 'Front side of your Aadhaar card', icon: '🪪' },
  { id: 'pan', label: 'PAN Card', desc: 'Your PAN card for tax verification', icon: '💳' },
]

export function KYCClient({ kyc }: { kyc: KYC | null }) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [aadhaarNo, setAadhaarNo] = useState(kyc?.aadhaarNo || '')
  const [panNo, setPanNo] = useState(kyc?.panNo || '')
  
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null)
  const [panFile, setPanFile] = useState<File | null>(null)

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
    setMsg(null)

    if (!aadhaarNo.trim() || !panNo.trim()) {
      setMsg({ type: 'error', text: 'Please enter both Aadhaar and PAN card numbers.' })
      return
    }

    if (!aadhaarFile) {
      setMsg({ type: 'error', text: 'Please select an image file for your Aadhaar card.' })
      return
    }

    if (!panFile) {
      setMsg({ type: 'error', text: 'Please select an image file for your PAN card.' })
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('aadhaarNo', aadhaarNo.trim())
      formData.append('panNo', panNo.trim())
      formData.append('aadhaarFile', aadhaarFile)
      formData.append('panFile', panFile)

      const result = await submitKYC(formData)
      if (result.success) {
        setMsg({ type: 'success', text: result.message })
        // Clear selected files on success
        setAadhaarFile(null)
        setPanFile(null)
      } else {
        setMsg({ type: 'error', text: result.message })
      }
    } catch (error: any) {
      setMsg({ type: 'error', text: error.message || 'An error occurred during submission.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">KYC Verification</h1>

      {kyc?.status === 'PENDING' && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 animate-pulse">
          <Clock className="w-5 h-5 text-yellow-500" />
          <div>
            <p className="font-medium text-yellow-500">Under Review</p>
            <p className="text-sm text-muted-foreground">Your documents are being reviewed by our administrators. This process typically takes 24-48 hours.</p>
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
      <div className="flex items-center gap-2 max-w-md">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${kyc?.status === 'PENDING' || kyc?.status === 'APPROVED' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
              {i + 1}
            </div>
            <div className="text-left min-w-0">
              <span className="text-xs font-bold block truncate">{step.label}</span>
            </div>
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
              <input 
                type="text" 
                value={aadhaarNo} 
                onChange={(e) => setAadhaarNo(e.target.value)} 
                placeholder="XXXX-XXXX-XXXX" 
                className="form-input" 
                maxLength={14} 
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Upload Aadhaar Image</label>
              <label className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground truncate">
                  {aadhaarFile ? aadhaarFile.name : 'Click to upload'}
                </span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setAadhaarFile(e.target.files[0])
                    }
                  }}
                />
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
              <input 
                type="text" 
                value={panNo} 
                onChange={(e) => setPanNo(e.target.value.toUpperCase())} 
                placeholder="ABCDE1234F" 
                className="form-input" 
                maxLength={10} 
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Upload PAN Image</label>
              <label className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground truncate">
                  {panFile ? panFile.name : 'Click to upload'}
                </span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setPanFile(e.target.files[0])
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        <Button type="submit" size="lg" loading={loading} className="w-full sm:w-auto">
          <CheckCircle className="w-4 h-4 mr-2" />
          Submit KYC Documents
        </Button>
      </form>
    </div>
  )
}
