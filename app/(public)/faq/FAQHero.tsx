'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, Headphones } from 'lucide-react'
import Link from 'next/link'

export default function FAQHero() {
  return (
    <section className="relative w-full overflow-hidden bg-[#02040a] flex flex-col justify-center min-h-[90vh] pt-24 pb-16 lg:py-24">
      {/* Background Images */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 hidden lg:block"
        style={{ backgroundImage: "url('/bg.jpeg')" }}
      />
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 block lg:hidden"
        style={{ backgroundImage: "url('/bg1.jpeg')" }}
      />

      {/* Decorative Rotating Planets */}
      <motion.img
        src="/planet3.png"
        alt="Decorative background planet 3"
        className="absolute left-[5%] top-[12%] w-[100px] sm:w-[150px] lg:w-[220px] h-auto pointer-events-none z-10 opacity-40"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 70,
          ease: "linear"
        }}
      />
      <motion.img
        src="/planet4.png"
        alt="Decorative background planet 4"
        className="absolute right-[5%] bottom-[10%] w-[120px] sm:w-[180px] lg:w-[250px] h-auto pointer-events-none z-10 opacity-40"
        animate={{ rotate: -360 }}
        transition={{
          repeat: Infinity,
          duration: 90,
          ease: "linear"
        }}
      />

      {/* Subtle overlay for contrast */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none z-20" />

      {/* Hero content container */}
      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col text-left space-y-6"
          >
            <div>
              <span className="text-xs sm:text-sm font-bold tracking-widest text-slate-400 uppercase block mb-3">
                Frequently Asked Questions
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-[1.08] tracking-tight uppercase">
                Questions <br />
                You Have. <br />
                <span className="bg-gradient-to-r from-violet-400 via-purple-500 to-indigo-500 bg-clip-text text-transparent">Answers</span> <br />
                You Need.
              </h1>
            </div>

            <p className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-lg leading-relaxed">
              Find answers to the most common questions about VR Galaxy Networks, membership, rewards, and more.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/register" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 flex items-center justify-center gap-2 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer">
                  Join Now
                  <ArrowUpRight className="w-4 h-4 shrink-0" />
                </button>
              </Link>
              
              <Link href="/contact" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-extrabold bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white flex items-center justify-center gap-2 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer">
                  <Headphones className="w-4 h-4 shrink-0" />
                  Contact Support
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Right Content - Shield Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center lg:justify-end items-center relative"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{
                repeat: Infinity,
                duration: 6,
                ease: "easeInOut"
              }}
              className="relative w-full max-w-[360px] sm:max-w-[500px] lg:max-w-[580px] aspect-square flex items-center justify-center"
            >
              <img 
                src="/shield1.png" 
                alt="VR Galaxy FAQ Hexagon Shield" 
                className="w-full h-full object-contain filter drop-shadow-[0_0_35px_rgba(59,130,246,0.35)]"
              />
            </motion.div>
          </motion.div>
          
        </div>
      </div>
    </section>
  )
}
