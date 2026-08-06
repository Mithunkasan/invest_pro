'use client'

import { useState, useEffect, useRef } from 'react'
import { Check, Loader2, Play, Volume2, VolumeX } from 'lucide-react'
import { claimDailyYieldAction } from '@/actions/dailyTask'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

interface DailyTaskViewerProps {
  userId: string
  settings: {
    dailyTaskMediaUrl: string | null
    dailyTaskMediaType: string
    dailyTaskDuration: number
    dailyTaskMessage: string
    activeTaskId?: string
  }
  onComplete?: () => void
  isPopup?: boolean
}

export function DailyTaskViewer({ userId, settings, onComplete, isPopup = false }: DailyTaskViewerProps) {
  const { dailyTaskMediaUrl, dailyTaskMediaType, dailyTaskDuration, dailyTaskMessage, activeTaskId } = settings
  const duration = dailyTaskDuration || 30
  
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [completed, setCompleted] = useState(false)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Extract YouTube ID if it's a YouTube URL
  function getYouTubeId(url: string | null) {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const ytId = dailyTaskMediaType === 'VIDEO' ? getYouTubeId(dailyTaskMediaUrl) : null



  // 1. Timer Loop
  useEffect(() => {
    if (completed) return

    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 1
          if (next >= duration) {
            setCompleted(true)
            if (timerRef.current) clearInterval(timerRef.current)
            return duration
          }
          return next
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isPlaying, completed, duration])

  // 3. Claim Yield Action
  const handleClaim = async () => {
    setClaiming(true)
    try {
      const res = await claimDailyYieldAction(activeTaskId)
      if (res.success) {
        toast({ title: 'Yield Credited', description: res.message })
        if (onComplete) {
          onComplete()
        } else {
          window.location.reload()
        }
      } else {
        toast({ title: 'Error', description: res.message, variant: 'destructive' })
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to claim yield', variant: 'destructive' })
    } finally {
      setClaiming(false)
    }
  }

  const remaining = duration - progress
  const percent = Math.min(100, Math.floor((progress / duration) * 100))

  return (
    <div className="space-y-4">
      {/* Custom Instruction Message */}
      <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary font-medium leading-relaxed">
        {dailyTaskMessage || "You must watch this image/video for the full duration set by the admin to qualify for today's daily yield reward."}
      </div>

      {/* Media Box */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border bg-black flex items-center justify-center shadow-inner">
        {dailyTaskMediaType === 'IMAGE' ? (
          dailyTaskMediaUrl ? (
            <img
              src={dailyTaskMediaUrl}
              alt="Daily Task Image"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-sm text-muted-foreground">No image configured.</div>
          )
        ) : (
          dailyTaskMediaUrl ? (
            ytId ? (
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&playlist=${ytId}&loop=1&controls=0&modestbranding=1&rel=0`}
                className="w-full h-full border-0 pointer-events-none select-none"
                allow="autoplay; encrypted-media"
                allowFullScreen
                tabIndex={-1}
              />
            ) : (
              <video
                src={dailyTaskMediaUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-contain pointer-events-none select-none"
                tabIndex={-1}
              />
            )
          ) : (
            <div className="text-sm text-muted-foreground">No video configured.</div>
          )
        )}
      </div>

      {/* Progress Bar & Countdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
          <span>{percent}% Completed</span>
          <span>
            {completed ? 'Completed' : `Remaining: ${remaining}s`}
          </span>
        </div>

        <div className="h-2 w-full rounded-full bg-muted/30 overflow-hidden border border-border/40">
          <div
            className="h-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-1000"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Action Area */}
      <div className="flex justify-end pt-2">
        {completed ? (
          <Button
            onClick={handleClaim}
            disabled={claiming}
            className="w-full sm:w-auto px-8 py-5 text-sm font-extrabold rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/20 gap-2 active:scale-95 transition-all"
          >
            {claiming ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Crediting Reward...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Agree & Claim Daily Yield
              </>
            )}
          </Button>
        ) : (
          <Button
            disabled
            className="w-full sm:w-auto px-8 text-sm font-bold bg-muted text-muted-foreground"
          >
            Watch for {remaining} more seconds...
          </Button>
        )}
      </div>
    </div>
  )
}
