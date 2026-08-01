'use client'

import { useState } from 'react'
import { AlertCircle, Check, Save, Upload } from 'lucide-react'
import { saveDailyTaskSettingsAction } from '@/actions/dailyTask'
import { Button } from '@/components/ui/button'

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`flex h-10 w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 ${props.className || ''}`}
  />
)

const Label = (props: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label
    {...props}
    className={`text-sm font-semibold text-white/80 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${props.className || ''}`}
  />
)

interface DailyTaskSettingsFormProps {
  initialSettings: {
    dailyTaskEnabled: boolean
    dailyTaskMediaUrl: string | null
    dailyTaskMediaType: string
    dailyTaskDuration: number
    dailyTaskMessage: string
  }
}

export function DailyTaskSettingsForm({ initialSettings }: DailyTaskSettingsFormProps) {
  const [enabled, setEnabled] = useState(initialSettings.dailyTaskEnabled)
  const [mediaType, setMediaType] = useState(initialSettings.dailyTaskMediaType)
  const [mediaUrl, setMediaUrl] = useState(initialSettings.dailyTaskMediaUrl || '')
  const [duration, setDuration] = useState(initialSettings.dailyTaskDuration)
  const [message, setMessage] = useState(initialSettings.dailyTaskMessage)
  const [imageFile, setImageFile] = useState<File | null>(null)
  
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setStatusMessage(null)

    try {
      const formData = new FormData()
      formData.append('dailyTaskEnabled', String(enabled))
      formData.append('dailyTaskMediaType', mediaType)
      formData.append('dailyTaskDuration', String(duration))
      formData.append('dailyTaskMessage', message)
      formData.append('dailyTaskMediaUrl', mediaUrl)

      if (mediaType === 'IMAGE' && imageFile) {
        formData.append('dailyTaskImage', imageFile)
      }

      const result = await saveDailyTaskSettingsAction(formData)
      
      if (result.success) {
        setStatusMessage({ type: 'success', text: result.message })
        setImageFile(null)
        // Refresh the page or fetch updated settings to show new image URL
        if (mediaType === 'IMAGE') {
          window.location.reload()
        }
      } else {
        setStatusMessage({ type: 'error', text: result.message })
      }
    } catch (error: any) {
      setStatusMessage({ type: 'error', text: error.message || 'An unexpected error occurred.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="premium-card p-6 space-y-6 max-w-4xl">
      <h2 className="text-xl font-bold border-b border-border pb-3 flex items-center gap-2">
        Daily Task Configuration
      </h2>

      {statusMessage && (
        <div
          className={`flex items-center gap-2.5 p-4 rounded-xl text-sm ${
            statusMessage.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-500'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Enabled Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/40">
        <div>
          <Label className="text-base font-bold">Enable Daily Task Eligibility Requirement</Label>
          <p className="text-xs text-muted-foreground mt-1">
            When enabled, users must complete the daily task before claiming their daily yield reward.
          </p>
        </div>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="w-5 h-5 accent-primary cursor-pointer"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Media Type */}
        <div className="space-y-2">
          <Label htmlFor="dailyTaskMediaType">Task Media Type</Label>
          <select
            id="dailyTaskMediaType"
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value)}
            className="flex h-10 w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="IMAGE">Image View Task</option>
            <option value="VIDEO">Video Watch Task (YouTube or raw video URL)</option>
          </select>
        </div>

        {/* View Duration */}
        <div className="space-y-2">
          <Label htmlFor="dailyTaskDuration">Required Watch/View Duration (seconds)</Label>
          <Input
            id="dailyTaskDuration"
            type="number"
            min="1"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value, 10) || 0)}
            required
          />
        </div>
      </div>

      {/* Conditionally render inputs depending on Media Type */}
      {mediaType === 'IMAGE' ? (
        <div className="grid sm:grid-cols-2 gap-6 items-start">
          <div className="space-y-2">
            <Label>Upload Daily Task Image</Label>
            <label className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary cursor-pointer transition-colors bg-muted/10">
              <Upload className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground truncate">
                {imageFile ? imageFile.name : 'Click to select image file'}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setImageFile(e.target.files[0])
                  }
                }}
              />
            </label>
            <p className="text-[10px] text-muted-foreground">Max file size: 1 MB. Re-saving will upload and overwrite.</p>
          </div>

          {initialSettings.dailyTaskMediaType === 'IMAGE' && initialSettings.dailyTaskMediaUrl && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">Current Configured Image Preview</Label>
              <div className="w-full max-h-40 rounded-xl overflow-hidden border border-border bg-muted/20">
                <img
                  src={initialSettings.dailyTaskMediaUrl}
                  alt="Daily task preview"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="dailyTaskMediaUrl">Video URL (YouTube or Direct Link)</Label>
          <Input
            id="dailyTaskMediaUrl"
            type="text"
            placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            required={mediaType === 'VIDEO'}
          />
          <p className="text-[11px] text-muted-foreground">
            Supports YouTube videos and direct links to MP4, WebM, etc.
          </p>
        </div>
      )}

      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="dailyTaskMessage">Custom Task Instructions Message</Label>
        <textarea
          id="dailyTaskMessage"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          className="flex w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
          placeholder="You must watch this image/video for the full duration set by the admin to qualify for today's daily yield reward."
        />
      </div>

      <div className="pt-2 border-t border-border/40 flex justify-end">
        <Button type="submit" disabled={loading} className="gap-2 px-6">
          <Save className="w-4 h-4" />
          {loading ? 'Saving configuration...' : 'Save Configuration'}
        </Button>
      </div>
    </form>
  )
}
