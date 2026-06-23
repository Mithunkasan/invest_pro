'use client'

import { useState } from 'react'
import { Upload, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateBankDetailsAction } from '@/actions/admin'
import type { SystemSettings } from '@prisma/client'

export function BankDetailsClient({ settings }: { settings: SystemSettings }) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [upiId, setUpiId] = useState(settings.upiId || '')
  const [bankName, setBankName] = useState(settings.bankName || '')
  const [accountName, setAccountName] = useState(settings.accountName || '')
  const [accountNumber, setAccountNumber] = useState(settings.accountNumber || '')
  const [ifscCode, setIfscCode] = useState(settings.ifscCode || '')

  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('upiId', upiId.trim())
      formData.append('bankName', bankName.trim())
      formData.append('accountName', accountName.trim())
      formData.append('accountNumber', accountNumber.trim())
      formData.append('ifscCode', ifscCode.trim())
      
      if (settings.qrCodeUrl) {
        formData.append('existingQrCodeUrl', settings.qrCodeUrl)
      }

      if (qrCodeFile) {
        formData.append('qrCodeImage', qrCodeFile)
      }

      const result = await updateBankDetailsAction(formData)
      
      if (result.success) {
        setMsg({ type: 'success', text: result.message })
        setQrCodeFile(null)
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
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Bank & Payment Details</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update the payment methods that users will see on the Deposit page.
        </p>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-sm ${msg.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-500' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* UPI ID */}
        <div className="premium-card p-6">
          <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">UPI Payment Details</h2>
          <div className="max-w-md">
            <label className="text-sm font-medium block mb-1.5">UPI ID</label>
            <input 
              type="text" 
              value={upiId} 
              onChange={(e) => setUpiId(e.target.value)} 
              placeholder="e.g. yourname@upi" 
              className="form-input" 
            />
          </div>
        </div>

        {/* Bank Details */}
        <div className="premium-card p-6">
          <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Bank Transfer Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Bank Name</label>
              <input 
                type="text" 
                value={bankName} 
                onChange={(e) => setBankName(e.target.value)} 
                placeholder="e.g. State Bank of India" 
                className="form-input" 
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Account Name</label>
              <input 
                type="text" 
                value={accountName} 
                onChange={(e) => setAccountName(e.target.value)} 
                placeholder="e.g. John Doe" 
                className="form-input" 
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Account Number</label>
              <input 
                type="text" 
                value={accountNumber} 
                onChange={(e) => setAccountNumber(e.target.value)} 
                placeholder="Account Number" 
                className="form-input" 
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">IFSC Code</label>
              <input 
                type="text" 
                value={ifscCode} 
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())} 
                placeholder="IFSC Code" 
                className="form-input" 
              />
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="premium-card p-6">
          <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">QR Code Image</h2>
          <div className="grid sm:grid-cols-2 gap-6 items-start">
            <div>
              <label className="text-sm font-medium block mb-1.5">Upload New QR Code Image</label>
              <label className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary cursor-pointer transition-colors bg-muted/30">
                <Upload className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground truncate">
                  {qrCodeFile ? qrCodeFile.name : 'Click to upload image'}
                </span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0]
                      if (file.size > 500 * 1024) {
                        setMsg({ type: 'error', text: 'File size is too large. Please upload an image smaller than 500 KB.' })
                        e.target.value = ''
                        return
                      }
                      setQrCodeFile(file)
                      setMsg(null)
                    }
                  }}
                />
              </label>
              <p className="text-[10px] text-muted-foreground mt-1.5">Image size must be less than 500 KB.</p>
            </div>
            
            {settings.qrCodeUrl && !qrCodeFile && (
              <div>
                <label className="text-sm font-medium block mb-1.5 text-muted-foreground">Current QR Code</label>
                <div className="w-32 h-32 rounded-xl border border-border overflow-hidden bg-white flex items-center justify-center p-2">
                  <img src={settings.qrCodeUrl} alt="Current QR Code" className="max-w-full max-h-full object-contain" />
                </div>
              </div>
            )}
          </div>
        </div>

        <Button type="submit" size="lg" loading={loading} className="w-full sm:w-auto min-w-[200px]">
          <CheckCircle className="w-4 h-4 mr-2" />
          Save Bank Details
        </Button>
      </form>
    </div>
  )
}
