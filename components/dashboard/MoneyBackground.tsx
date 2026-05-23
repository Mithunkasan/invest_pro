'use client'

import React, { useEffect, useState } from 'react'

interface Particle {
  id: number
  symbol: string | React.ReactNode
  left: number
  delay: number
  duration: number
  scale: number
  rotateTo: number
  driftX: number
  opacity: number
  className: string
}

export function MoneyBackground() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    // Generate particles on the client side to avoid SSR mismatch issues
    const items = ['$', '₹', '💰', '💵', '🪙', '📈']
    const generated: Particle[] = Array.from({ length: 25 }).map((_, i) => {
      const isUp = i % 2 === 0
      const duration = 18 + Math.random() * 15 // 18s to 33s
      const delay = Math.random() * -30 // negative delay so they start immediately at different stages of the loop
      const left = Math.random() * 100 // 0% to 100%
      const scale = 0.5 + Math.random() * 0.8 // 0.5 to 1.3
      const rotateTo = (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 360) // rotation direction and amount
      const driftX = (Math.random() > 0.5 ? 1 : -1) * (30 + Math.random() * 60) // horizontal drift
      const opacity = 0.02 + Math.random() * 0.05 // 2% to 7% opacity for a very subtle, modern feel
      const symbol = items[Math.floor(Math.random() * items.length)]

      return {
        id: i,
        symbol,
        left,
        delay,
        duration,
        scale,
        rotateTo,
        driftX,
        opacity,
        className: isUp ? 'animate-float-up' : 'animate-float-down',
      }
    })
    setParticles(generated)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 min-h-full w-full">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute text-2xl font-black ${p.className}`}
          style={{
            left: `${p.left}%`,
            transform: `scale(${p.scale})`,
            '--duration': `${p.duration}s`,
            '--delay': `${p.delay}s`,
            '--drift-x': `${p.driftX}px`,
            '--rotate-to': `${p.rotateTo}deg`,
            '--float-opacity': p.opacity,
            opacity: p.opacity,
          } as React.CSSProperties}
        >
          {p.symbol}
        </div>
      ))}
    </div>
  )
}
