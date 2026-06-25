'use client'

import { useEffect, useRef } from 'react'

export function CurrencyClock() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Currency symbols placed at the 12, 3, 6, 9 o'clock positions
    // and filler symbols at remaining hour positions
    const currencySymbols: { [key: number]: string } = {
      12: '€',
      3:  '$',
      6:  '₹',
      9:  '¥',
      1:  '£',
      2:  '₿',
      4:  '₩',
      5:  '₺',
      7:  '₫',
      8:  '₴',
      10: '₱',
      11: '฿',
    }

    function draw() {
      if (!canvas || !ctx) return

      const size = canvas.width
      const cx = size / 2
      const cy = size / 2
      const radius = size * 0.44

      // Clear
      ctx.clearRect(0, 0, size, size)

      // ── Outer glow ring ──────────────────────────────────────────────
      const outerGlow = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius * 1.08)
      outerGlow.addColorStop(0, 'rgba(139, 92, 246, 0)')
      outerGlow.addColorStop(0.5, 'rgba(139, 92, 246, 0.18)')
      outerGlow.addColorStop(1, 'rgba(59, 130, 246, 0)')
      ctx.beginPath()
      ctx.arc(cx, cy, radius * 1.08, 0, Math.PI * 2)
      ctx.fillStyle = outerGlow
      ctx.fill()

      // ── Clock face background ────────────────────────────────────────
      const faceGrad = ctx.createRadialGradient(cx - radius * 0.2, cy - radius * 0.2, radius * 0.1, cx, cy, radius)
      faceGrad.addColorStop(0, '#1a1035')
      faceGrad.addColorStop(0.6, '#0d0820')
      faceGrad.addColorStop(1, '#05030f')
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.fillStyle = faceGrad
      ctx.fill()

      // ── Border ring ──────────────────────────────────────────────────
      const borderGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius)
      borderGrad.addColorStop(0, 'rgba(168, 85, 247, 0.7)')
      borderGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.4)')
      borderGrad.addColorStop(1, 'rgba(59, 130, 246, 0.7)')
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.strokeStyle = borderGrad
      ctx.lineWidth = size * 0.015
      ctx.stroke()

      // ── Inner subtle ring ────────────────────────────────────────────
      ctx.beginPath()
      ctx.arc(cx, cy, radius * 0.82, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)'
      ctx.lineWidth = 1
      ctx.stroke()

      // ── Tick marks ──────────────────────────────────────────────────
      for (let i = 0; i < 60; i++) {
        const angle = (i / 60) * Math.PI * 2 - Math.PI / 2
        const isMajor = i % 5 === 0
        const innerR = isMajor ? radius * 0.82 : radius * 0.88
        const outerR = radius * 0.93

        const x1 = cx + Math.cos(angle) * innerR
        const y1 = cy + Math.sin(angle) * innerR
        const x2 = cx + Math.cos(angle) * outerR
        const y2 = cy + Math.sin(angle) * outerR

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = isMajor ? 'rgba(168, 85, 247, 0.7)' : 'rgba(255, 255, 255, 0.2)'
        ctx.lineWidth = isMajor ? size * 0.005 : size * 0.002
        ctx.stroke()
      }

      // ── Currency symbol labels ───────────────────────────────────────
      const labelRadius = radius * 0.68
      const fontSize = size * 0.065

      for (let hour = 1; hour <= 12; hour++) {
        const angle = (hour / 12) * Math.PI * 2 - Math.PI / 2
        const x = cx + Math.cos(angle) * labelRadius
        const y = cy + Math.sin(angle) * labelRadius

        const isPrimary = [12, 3, 6, 9].includes(hour)
        const symbol = currencySymbols[hour] || hour.toString()

        ctx.save()
        ctx.font = `${isPrimary ? 'bold' : ''} ${fontSize * (isPrimary ? 1.1 : 0.85)}px Arial, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        if (isPrimary) {
          // Glowing effect for primary symbols
          ctx.shadowColor = 'rgba(168, 85, 247, 0.9)'
          ctx.shadowBlur = 12
          const symGrad = ctx.createLinearGradient(x - 10, y - 10, x + 10, y + 10)
          symGrad.addColorStop(0, '#c084fc')
          symGrad.addColorStop(1, '#60a5fa')
          ctx.fillStyle = symGrad
        } else {
          ctx.shadowColor = 'rgba(99, 102, 241, 0.5)'
          ctx.shadowBlur = 6
          ctx.fillStyle = 'rgba(200, 180, 255, 0.55)'
        }

        ctx.fillText(symbol, x, y)
        ctx.restore()
      }

      // ── Current time ─────────────────────────────────────────────────
      const now = new Date()
      const hrs = now.getHours() % 12
      const min = now.getMinutes()
      const sec = now.getSeconds()
      const ms  = now.getMilliseconds()

      const secAngle = ((sec + ms / 1000) / 60) * Math.PI * 2 - Math.PI / 2
      const minAngle = ((min + (sec + ms / 1000) / 60) / 60) * Math.PI * 2 - Math.PI / 2
      const hrAngle  = ((hrs + min / 60) / 12) * Math.PI * 2 - Math.PI / 2

      // ── Hour hand ────────────────────────────────────────────────────
      drawHand(ctx, cx, cy, hrAngle, radius * 0.46, size * 0.016, {
        color: '#e2e8f0',
        glow: 'rgba(226, 232, 240, 0.6)',
        glowBlur: 10,
        capRadius: size * 0.018,
      })

      // ── Minute hand ──────────────────────────────────────────────────
      drawHand(ctx, cx, cy, minAngle, radius * 0.62, size * 0.011, {
        color: '#a78bfa',
        glow: 'rgba(167, 139, 250, 0.7)',
        glowBlur: 12,
        capRadius: size * 0.014,
      })

      // ── Second hand ──────────────────────────────────────────────────
      // Tail
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(
        cx + Math.cos(secAngle + Math.PI) * radius * 0.18,
        cy + Math.sin(secAngle + Math.PI) * radius * 0.18
      )
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)'
      ctx.lineWidth = size * 0.006
      ctx.lineCap = 'round'
      ctx.shadowColor = 'rgba(251, 191, 36, 0.4)'
      ctx.shadowBlur = 6
      ctx.stroke()
      ctx.restore()

      // Main shaft
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(
        cx + Math.cos(secAngle) * radius * 0.76,
        cy + Math.sin(secAngle) * radius * 0.76
      )
      ctx.strokeStyle = '#fbbf24'
      ctx.lineWidth = size * 0.006
      ctx.lineCap = 'round'
      ctx.shadowColor = 'rgba(251, 191, 36, 0.9)'
      ctx.shadowBlur = 14
      ctx.stroke()
      ctx.restore()

      // ── Center pivot dot ─────────────────────────────────────────────
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, size * 0.022, 0, Math.PI * 2)
      const pivotGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.022)
      pivotGrad.addColorStop(0, '#fbbf24')
      pivotGrad.addColorStop(0.5, '#a78bfa')
      pivotGrad.addColorStop(1, '#6d28d9')
      ctx.fillStyle = pivotGrad
      ctx.shadowColor = 'rgba(168, 85, 247, 0.8)'
      ctx.shadowBlur = 10
      ctx.fill()
      ctx.restore()

      // ── Center inner dot ─────────────────────────────────────────────
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, size * 0.009, 0, Math.PI * 2)
      ctx.fillStyle = '#fbbf24'
      ctx.shadowColor = 'rgba(251, 191, 36, 0.9)'
      ctx.shadowBlur = 6
      ctx.fill()
      ctx.restore()

      rafRef.current = requestAnimationFrame(draw)
    }

    function drawHand(
      ctx: CanvasRenderingContext2D,
      cx: number, cy: number,
      angle: number,
      length: number,
      width: number,
      opts: { color: string; glow: string; glowBlur: number; capRadius: number }
    ) {
      const tipX = cx + Math.cos(angle) * length
      const tipY = cy + Math.sin(angle) * length
      const tailX = cx + Math.cos(angle + Math.PI) * (length * 0.15)
      const tailY = cy + Math.sin(angle + Math.PI) * (length * 0.15)

      ctx.save()
      ctx.beginPath()
      ctx.moveTo(tailX, tailY)
      ctx.lineTo(tipX, tipY)
      ctx.strokeStyle = opts.color
      ctx.lineWidth = width
      ctx.lineCap = 'round'
      ctx.shadowColor = opts.glow
      ctx.shadowBlur = opts.glowBlur
      ctx.stroke()
      ctx.restore()
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center">
      {/* Outer atmospheric glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-blue-600/20 rounded-full filter blur-3xl opacity-50 animate-pulse" />
      {/* Floating ring decoration */}
      <div
        className="absolute inset-[-8%] rounded-full border border-purple-500/20"
        style={{ animation: 'spin 20s linear infinite reverse' }}
      />
      <div
        className="absolute inset-[-4%] rounded-full border border-blue-500/15"
        style={{ animation: 'spin 30s linear infinite' }}
      />
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="relative z-10 w-full h-full drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]"
        aria-label="Analog clock showing current time with currency symbols"
      />
    </div>
  )
}
