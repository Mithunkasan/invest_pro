'use client'

import { useEffect, useState, useMemo } from 'react'
import { DollarSign, Banknote } from 'lucide-react'

// Custom High-Fidelity Banknote SVG representing a stylized currency bill
function BanknoteSVG({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 36 18"
      className={className}
      style={style}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Bill background with soft translucent fill and solid border */}
      <rect
        x="0.5"
        y="0.5"
        width="35"
        height="17"
        rx="2"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="0.75"
      />
      {/* Inner decorative boundary */}
      <rect
        x="2.5"
        y="2.5"
        width="31"
        height="13"
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeOpacity="0.5"
      />
      {/* Center oval for the bill portrait/seal */}
      <ellipse
        cx="18"
        cy="9"
        rx="5.5"
        ry="4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeOpacity="0.7"
      />
      {/* Mini Central Dollar Sign */}
      <path
        d="M18 7v4M16.8 8.2c.2-.4 1.2-.4 1.4 0c.1.3-.6.6-.7.7s-.5.4-.5.6c0 .1.5.4.7.4c.2 0 .8-.2.7-.6"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeLinecap="round"
      />
      {/* Corner value details */}
      <circle cx="4.5" cy="4.5" r="0.75" fill="currentColor" fillOpacity="0.6" />
      <circle cx="31.5" cy="4.5" r="0.75" fill="currentColor" fillOpacity="0.6" />
      <circle cx="4.5" cy="13.5" r="0.75" fill="currentColor" fillOpacity="0.6" />
      <circle cx="31.5" cy="13.5" r="0.75" fill="currentColor" fillOpacity="0.6" />
    </svg>
  )
}

// Custom High-Fidelity Dollar Sign with soft background aura and dashed glow ring
function DollarSVG({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Soft circular aura background */}
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="currentColor"
        fillOpacity="0.06"
      />
      {/* Outer glow ring */}
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeOpacity="0.3"
        strokeDasharray="2 2"
      />
      {/* Bold styled dollar sign */}
      <path
        d="M12 4v16M9 8.5c0-1.8 1.8-3 3-3s3 1.2 3 3c0 1.5-1.2 2.2-2.5 2.5s-2.5 1-2.5 2.5c0 1.8 1.8 3 3 3s3-1.2 3-3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Custom 3D Tilted Dollar Coin SVG to add perspective variety
function TiltedDollarSVG({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 3D coin shadow ellipse */}
      <ellipse
        cx="12"
        cy="13.5"
        rx="9.5"
        ry="5"
        fill="currentColor"
        fillOpacity="0.05"
      />
      {/* Tilted coin edge outer ring */}
      <ellipse
        cx="12"
        cy="11.5"
        rx="9.5"
        ry="5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeOpacity="0.4"
        fill="currentColor"
        fillOpacity="0.08"
      />
      {/* Inner decorative rim */}
      <ellipse
        cx="12"
        cy="11.5"
        rx="7.5"
        ry="3.8"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeOpacity="0.3"
        strokeDasharray="1.5 1.5"
      />
      {/* Angled Center Dollar Sign */}
      <path
        d="M12 8.5v6M10.5 10.5c0-.8.8-1.3 1.5-1.3s1.5.5 1.5 1.3c0 .6-.6 1-1.5 1.2s-1.5.6-1.5 1.2c0 .8.8 1.3 1.5 1.3s1.5-.5 1.5-1.3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeOpacity="0.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

// Shape of each falling item in the currency shower
interface FloatingItem {
  id: number
  Icon: React.ComponentType<any>
  size: number
  left: string
  opacity: number
  duration: string
  delay: string
  driftX: string
  rotateTo: string
  colorClass: string
  blurClass: string
  responsiveClass: string
  // Sway parameters
  swayAmount: string
  swayDuration: string
  swayDelay: string
  swayRotateStart: string
  swayRotateEnd: string
}

export function FloatingMoneyBackground() {
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by waiting until client-side mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Generate a premium stable items pool once on mount to ensure smooth animations
  const items = useMemo<FloatingItem[]>(() => {
    if (!mounted) return []

    // Premium, dual-mode color palette that is perfectly calibrated for both light and dark backgrounds:
    // - Light mode: Darker, richer tones (600-level) to ensure clean contrast on light backgrounds.
    // - Dark mode: Glowing, vibrant tones (400 to 500-level) to stand out beautifully on dark screens.
    const colors = [
      'text-emerald-600 dark:text-emerald-500', // Wealth/Money green
      'text-amber-600 dark:text-amber-500',     // Premium gold
      'text-teal-600 dark:text-teal-400',       // Elegant teal
      'text-blue-600 dark:text-blue-400',       // Clean financial blue
      'text-indigo-600 dark:text-indigo-400',   // Rich royal indigo
    ]
    
    const poolSize = 32 // Active elements pool size
    const generated: FloatingItem[] = []

    for (let i = 0; i < poolSize; i++) {
      // Segment the pool into 3 distinct layers to achieve a realistic 3D parallax depth of field
      // 0 = Back Layer (40%), 1 = Mid Layer (40%), 2 = Front Layer (20%)
      let layer = 1
      if (i < 13) {
        layer = 0 // Back Layer
      } else if (i < 26) {
        layer = 1 // Mid Layer
      } else {
        layer = 2 // Front Layer
      }

      // Weight selection: 75% Dollar Symbols, 25% Banknotes
      // Creates a rich shower dominated by multiple rotating, glowing, and tilting dollar signs.
      const rand = Math.random()
      let Icon
      if (rand < 0.28) {
        Icon = DollarSVG        // Glowing/Ring Dollar SVG
      } else if (rand < 0.52) {
        Icon = DollarSign       // Lucide Dollar Sign
      } else if (rand < 0.75) {
        Icon = TiltedDollarSVG  // 3D Tilted Dollar Coin SVG
      } else if (rand < 0.90) {
        Icon = BanknoteSVG      // Custom detailed Banknote SVG
      } else {
        Icon = Banknote         // Lucide Banknote
      }

      const colorClass = colors[Math.floor(Math.random() * colors.length)]

      // Layer-specific physical properties
      let size = 24
      let opacity = 0.06
      let duration = '25s'
      let blurClass = 'blur-none'

      if (layer === 0) {
        // Back Layer: Small, slow falling, blurry, very faint background atmosphere
        size = Math.floor(Math.random() * 8) + 12 // 12px - 20px
        opacity = Number((Math.random() * 0.03 + 0.02).toFixed(3)) // 0.02 - 0.05
        duration = `${Math.floor(Math.random() * 15) + 32}s` // Slow: 32s - 47s
        blurClass = Math.random() > 0.5 ? 'blur-[1px]' : 'blur-[1.5px]'
      } else if (layer === 1) {
        // Mid Layer: Standard size, speed, and subtle opacity
        size = Math.floor(Math.random() * 10) + 22 // 22px - 32px
        opacity = Number((Math.random() * 0.03 + 0.05).toFixed(3)) // 0.05 - 0.08
        duration = `${Math.floor(Math.random() * 10) + 22}s` // Medium: 22s - 32s
        blurClass = Math.random() > 0.5 ? 'blur-none' : 'blur-[0.5px]'
      } else {
        // Front Layer: Larger, faster falling, fully crisp, slightly higher opacity
        size = Math.floor(Math.random() * 10) + 34 // 34px - 44px
        opacity = Number((Math.random() * 0.03 + 0.08).toFixed(3)) // 0.08 - 0.11
        duration = `${Math.floor(Math.random() * 8) + 15}s` // Fast: 15s - 23s
        blurClass = 'blur-none'
      }

      // Horizontal spread across the page width
      const left = `${Math.floor(Math.random() * 94) + 3}%`

      // Initial fall delay (negative to pre-populate the screen instantly on page load)
      const delay = `-${Math.floor(Math.random() * 45)}s`

      // Horizontal drift (X-axis offset) during vertical fall
      const driftX = `${Math.floor(Math.random() * 100) - 50}px`

      // Complete rotation: -360deg to 360deg
      const rotateTo = `${Math.floor(Math.random() * 720) - 360}deg`

      // Pure CSS Responsive Performance Optimization:
      // - Mobile (<640px) renders only 10 items to preserve battery and CPU performance.
      // - Tablet (<1024px) renders 20 items.
      // - Desktop (>=1024px) renders all 32 items for a rich visual shower.
      let responsiveClass = 'block'
      if (i >= 10 && i < 20) {
        responsiveClass = 'hidden sm:block'
      } else if (i >= 20) {
        responsiveClass = 'hidden lg:block'
      }

      // Swaying parameters (micro lateral movement and swaying rotation like real paper bills)
      const swayAmount = `${Math.floor(Math.random() * 20) + 15}px` // 15px - 35px
      const swayDuration = `${(Math.random() * 3 + 4).toFixed(1)}s` // 4s - 7s
      const swayDelay = `-${(Math.random() * 8).toFixed(1)}s`
      const swayRotateStart = `-${Math.floor(Math.random() * 20) + 10}deg` // -10deg to -30deg
      const swayRotateEnd = `${Math.floor(Math.random() * 20) + 10}deg`   // 10deg to 30deg

      generated.push({
        id: i,
        Icon,
        size,
        left,
        opacity,
        duration,
        delay,
        driftX,
        rotateTo,
        colorClass,
        blurClass,
        responsiveClass,
        swayAmount,
        swayDuration,
        swayDelay,
        swayRotateStart,
        swayRotateEnd,
      })
    }

    // Interleave the items randomly so layers render in a natural, depth-blended order
    return generated.sort(() => Math.random() - 0.5)
  }, [mounted])

  // Don't render anything during SSR to prevent hydration mismatches
  if (!mounted) {
    return null
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[10] overflow-hidden select-none">
      {items.map((item) => {
        const {
          id,
          Icon,
          size,
          left,
          opacity,
          duration,
          delay,
          driftX,
          rotateTo,
          colorClass,
          blurClass,
          responsiveClass,
          swayAmount,
          swayDuration,
          swayDelay,
          swayRotateStart,
          swayRotateEnd,
        } = item

        return (
          <div
            key={id}
            className={`absolute pointer-events-none animate-float-down ${colorClass} ${blurClass} ${responsiveClass}`}
            style={{
              left,
              // Applies the theme-specific CSS variable multiplier to the item's custom opacity (1.6 on light mode, 1.0 on dark mode)
              '--float-opacity': `calc(${opacity} * var(--theme-opacity-multiplier, 1.0))`,
              '--duration': duration,
              '--delay': delay,
              '--drift-x': driftX,
              '--rotate-to': rotateTo,
            } as React.CSSProperties}
          >
            {/* The inner div handles the organic sway and tilt, while the outer div handles the linear falling */}
            <div
              className="animate-sway"
              style={{
                '--sway-amount': swayAmount,
                '--sway-duration': swayDuration,
                '--sway-delay': swayDelay,
                '--sway-rotate-start': swayRotateStart,
                '--sway-rotate-end': swayRotateEnd,
              } as React.CSSProperties}
            >
              <Icon 
                style={{ 
                  width: `${size}px`, 
                  height: `${size}px`,
                }} 
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
