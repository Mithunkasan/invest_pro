'use client'

import { useState, useEffect } from 'react'
import { X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { checkUserDailyTaskEligibilityAction } from '@/actions/dailyTask'
import { DailyTaskViewer } from './DailyTaskViewer'
import { ModalPortal } from '@/components/common/ModalPortal'

interface DailyTaskPopupProps {
  userId: string
}

export function DailyTaskPopup({ userId }: DailyTaskPopupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    // Check eligibility on first load of the dashboard
    async function checkEligibility() {
      try {
        const res = await checkUserDailyTaskEligibilityAction()
        if (res.eligible && res.settings) {
          // Check if user has closed it in this session to avoid annoying them on every click
          const hasClosedToday = sessionStorage.getItem('dailyTaskPopupClosedToday')
          if (!hasClosedToday) {
            setSettings(res.settings)
            setIsOpen(true)
          }
        }
      } catch (error) {
        console.error('Error checking daily task eligibility:', error)
      }
    }
    checkEligibility()
  }, [userId])

  const handleClose = () => {
    setIsOpen(false)
    sessionStorage.setItem('dailyTaskPopupClosedToday', 'true')
  }

  const handleComplete = () => {
    setIsOpen(false)
    window.location.reload()
  }

  if (!isOpen || !settings) return null

  return (
    <ModalPortal>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-brand-800 bg-brand-950 p-6 shadow-2xl text-left cursor-default my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-brand-800 pb-4 mb-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                Daily Task Required
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Complete this task to claim today's daily reward yield.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="rounded-lg p-1.5 text-brand-300 hover:bg-brand-900 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Daily Task Content */}
          <DailyTaskViewer
            userId={userId}
            settings={settings}
            onComplete={handleComplete}
            isPopup={true}
          />
        </motion.div>
      </motion.div>
    </ModalPortal>
  )
}
