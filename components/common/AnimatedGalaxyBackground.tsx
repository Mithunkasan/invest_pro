'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface Star {
  x: number
  y: number
  size: number
  depth: number
  driftSpeed: number
  alpha: number
  twinkleSpeed: number
  twinkleDir: number
}

export function AnimatedGalaxyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let stars: Star[] = []
    const numStars = 180

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initStars()
    }

    // Initialize stars
    const initStars = () => {
      stars = []
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 0.4, // size between 0.4px and 1.9px
          depth: Math.random() * 0.7 + 0.1, // parallax depth factor (0.1 to 0.8)
          driftSpeed: Math.random() * 0.05 + 0.02, // slow autonomous drift
          alpha: Math.random() * 0.7 + 0.3, // starting opacity
          twinkleSpeed: Math.random() * 0.015 + 0.005, // twinkling frequency
          twinkleDir: Math.random() > 0.5 ? 1 : -1,
        })
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw each star with parallax and drift
      stars.forEach((star) => {
        // Twinkle effect (alpha modulation)
        star.alpha += star.twinkleSpeed * star.twinkleDir
        if (star.alpha >= 1) {
          star.alpha = 1
          star.twinkleDir = -1
        } else if (star.alpha <= 0.2) {
          star.alpha = 0.2
          star.twinkleDir = 1
        }

        // Autonomous drift upward
        star.y -= star.driftSpeed
        if (star.y < 0) {
          star.y = canvas.height
          star.x = Math.random() * canvas.width
        }

        // Parallax calculations (Scroll shifts stars upward based on depth)
        let drawY = (star.y - scrollY * star.depth) % canvas.height
        if (drawY < 0) drawY += canvas.height

        // Draw star
        ctx.beginPath()
        ctx.arc(star.x, drawY, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`
        ctx.fill()
      })

      // Soft white lines for shooting stars (rare event)
      if (Math.random() < 0.0008) {
        drawShootingStar()
      }

      animationFrameId = requestAnimationFrame(draw)
    }

    let shootingStar: { x: number; y: number; dx: number; dy: number; len: number; alpha: number } | null = null

    const drawShootingStar = () => {
      if (!shootingStar) {
        shootingStar = {
          x: Math.random() * canvas.width * 0.6,
          y: Math.random() * canvas.height * 0.4,
          dx: Math.random() * 8 + 6,
          dy: Math.random() * 4 + 3,
          len: Math.random() * 80 + 50,
          alpha: 1,
        }
      }
    }

    const animateShootingStar = () => {
      if (shootingStar && ctx) {
        ctx.beginPath()
        const grad = ctx.createLinearGradient(
          shootingStar.x,
          shootingStar.y,
          shootingStar.x - shootingStar.dx * 5,
          shootingStar.y - shootingStar.dy * 5
        )
        grad.addColorStop(0, `rgba(255, 255, 255, ${shootingStar.alpha})`)
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)')

        ctx.strokeStyle = grad
        ctx.lineWidth = 1.5
        ctx.moveTo(shootingStar.x, shootingStar.y)
        ctx.lineTo(shootingStar.x - shootingStar.dx * 3, shootingStar.y - shootingStar.dy * 3)
        ctx.stroke()

        shootingStar.x += shootingStar.dx
        shootingStar.y += shootingStar.dy
        shootingStar.alpha -= 0.04

        if (shootingStar.alpha <= 0 || shootingStar.x > canvas.width || shootingStar.y > canvas.height) {
          shootingStar = null
        }
      }
    }

    // Wrap the rendering loop
    const tick = () => {
      draw()
      animateShootingStar()
    }

    tick()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [scrollY])

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0 bg-[#020205]">
      {/* ── Fixed Canvas for Twinkling Stars ── */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full z-0 opacity-80"
      />

      {/* ── Pulsing Floating Nebula Glows (using Framer Motion) ── */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen">
        {/* Nebula 1: Top Right Indigo */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 40, 0],
            y: [0, -20, 0],
            opacity: [0.35, 0.55, 0.35],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[-5%] right-[5%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-indigo-600/15 rounded-full blur-[160px]"
        />

        {/* Nebula 2: Mid Left Purple */}
        <motion.div
          animate={{
            scale: [1.1, 0.95, 1.1],
            x: [0, -30, 0],
            y: [0, 50, 0],
            opacity: [0.3, 0.48, 0.3],
          }}
          transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute top-[35%] left-[-10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] bg-purple-700/12 rounded-full blur-[150px]"
        />

        {/* Nebula 3: Bottom Right Deep Blue */}
        <motion.div
          animate={{
            scale: [0.95, 1.1, 0.95],
            x: [0, 50, 0],
            y: [0, -40, 0],
            opacity: [0.32, 0.5, 0.32],
          }}
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
          className="absolute bottom-[10%] right-[-5%] w-[65vw] h-[65vw] max-w-[900px] max-h-[900px] bg-blue-700/12 rounded-full blur-[170px]"
        />

        {/* Nebula 4: Centered Cyan (Faint Glow) */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.28, 0.15],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 10 }}
          className="absolute top-[65%] left-[30%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] bg-cyan-500/8 rounded-full blur-[140px]"
        />
      </div>
    </div>
  )
}
