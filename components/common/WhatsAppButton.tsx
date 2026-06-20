'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function WhatsAppButton() {
  const [mounted, setMounted] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Automatically trigger attention tooltip after a brief initial delay
    const attentionTimer = setTimeout(() => {
      setShowTooltip(true)
      // Automatically hide the initial prompt after 5 seconds
      const hideTimer = setTimeout(() => setShowTooltip(false), 5000)
      return () => clearTimeout(hideTimer)
    }, 4000)

    return () => clearTimeout(attentionTimer)
  }, [])

  if (!mounted) {
    return null
  }

  // Support phone number matching Footer contact credentials
  const phoneNumber = '918695890443'
  const supportText = encodeURIComponent("Hi VR Galaxy, I'd like to know more about your activation plans.")
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${supportText}`

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-auto select-none flex items-center gap-3">
      {/* Sleek tool-prompt */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="hidden md:block bg-card/95 border border-border text-foreground px-4 py-2.5 rounded-2xl shadow-premium text-xs font-bold backdrop-blur-md relative"
          >
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
              Chat with Support on WhatsApp
            </p>
            {/* Tooltip triangle tail */}
            <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 border-y-[6px] border-y-transparent border-l-[6px] border-l-card border-l-border" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button with Pulse Glow */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-gradient-to-tr from-[#128C7E] to-[#25D366] text-white shadow-[0_6px_28px_rgba(37,211,102,0.45)] cursor-pointer focus:outline-none"
        aria-label="Chat with us on WhatsApp"
      >
        {/* Pulse Glow Ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-25 animate-ping" style={{ animationDuration: '3s' }} />

        {/* WhatsApp Icon SVG */}
        <svg
          viewBox="0 0 24 24"
          className="w-7 h-7 sm:w-8 sm:h-8 fill-current relative z-10 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12.031 6c-3.314 0-6 2.686-6 6 0 1.258.389 2.422 1.055 3.388L6.2 18.2l2.919-.766A5.962 5.962 0 0 0 12.03 18c3.314 0 6-2.686 6-6 0-3.314-2.686-6-6-6zm3.96 8.528c-.161.455-.94.83-1.29.878-.328.043-.654.218-2.115-.362-1.874-.744-3.057-2.656-3.15-2.78-.093-.125-.769-.99-.769-1.983 0-.994.512-1.483.696-1.674.185-.191.4-.239.533-.239h.375c.125 0 .292-.047.458.343.166.393.57 1.385.62 1.48.05.093.083.203.02.327-.063.125-.094.203-.188.312-.093.109-.197.243-.281.327-.1.1-.205.21-.088.409.117.2.52 1.282.88 1.597.432.378.85.508 1.066.529.215.02.342-.085.452-.2.11-.118.455-.53.58-.707.125-.178.25-.148.423-.085.172.063 1.096.516 1.283.606.188.09.313.136.357.21.045.075.045.436-.117.892z" />
        </svg>
      </motion.a>
    </div>
  )
}
