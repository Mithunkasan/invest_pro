'use client'

import { motion } from 'framer-motion'

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#090b11] overflow-hidden">
      {/* Orbital Loading Rings & Spinning Logo */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* External Glowing Spin Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-blue-500"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        />

        {/* Internal Reverse Spin Ring */}
        <motion.div
          className="absolute inset-4 rounded-full border-2 border-transparent border-b-purple-500 border-l-cyan-500 opacity-60"
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        />

        {/* Pulsating brand logo - Large Size, No Background Container */}
        <motion.div
          className="w-32 h-32 flex items-center justify-center z-10"
          animate={{
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: 'easeInOut',
          }}
        >
          <img
            src="/logo.png"
            className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]"
            alt="VR Galaxy Networks logo"
          />
        </motion.div>
      </div>

      {/* Dynamic branding below loader */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-center"
      >
        <h2 className="text-xl font-black tracking-widest bg-gradient-to-r from-primary via-purple-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(139,92,246,0.3)]">
          VR GALAXY NETWORKS
        </h2>
      </motion.div>
    </div>
  )
}
