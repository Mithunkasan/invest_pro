'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Gamepad2, Gift, Trophy, Zap, Sparkles, Play, CheckCircle2,
  AlertCircle, ArrowRight, Coins, RefreshCw, Star, Info, Target, ChevronRight
} from 'lucide-react'
import { claimRewardAction } from '@/actions/rewards'
import { formatCurrency } from '@/utils/formatters'
import type { UserTokenPayload } from '@/lib/auth'

interface FreeDashboardOverviewProps {
  user: UserTokenPayload
  stats: {
    currentBalance: number
    rewardIncome?: number
    wallet: {
      mainBalance: number
      rewardBalance: number
    }
  }
}

// Location Trivia Questions
const TRIVIA_QUESTIONS = [
  {
    id: 1,
    question: "Which consensus mechanism does Ethereum currently use?",
    options: ["Proof of Work", "Proof of Stake", "Proof of History", "Proof of Authority"],
    correct: 1,
    reward: 15,
  },
  {
    id: 2,
    question: "What is the maximum supply limit of Bitcoin?",
    options: ["21 Million", "42 Million", "100 Million", "Unlimited"],
    correct: 0,
    reward: 10,
  },
  {
    id: 3,
    question: "What does 'HODL' stand for in crypto slang?",
    options: ["Hold On Dear Life", "Hold On for Dear Life", "Honest Opinion Don't Lose", "Holding On Daily Limit"],
    correct: 1,
    reward: 10,
  },
  {
    id: 4,
    question: "Which Indian authority regulates the stock market?",
    options: ["RBI", "IRDAI", "SEBI", "NABARD"],
    correct: 2,
    reward: 15,
  }
]

export function FreeDashboardOverview({ user, stats }: FreeDashboardOverviewProps) {
  // --- STATE ---
  const [walletBalance, setWalletBalance] = useState({
    main: stats.wallet.mainBalance,
    reward: stats.wallet.rewardBalance
  })
  
  // Game States
  const [spinDisabled, setSpinDisabled] = useState(false)
  const [spinResult, setSpinResult] = useState<string | null>(null)
  const [spinRewardAmount, setSpinRewardAmount] = useState(0)
  
  // Trivia States
  const [currentTriviaIndex, setCurrentTriviaIndex] = useState(0)
  const [selectedTriviaOption, setSelectedTriviaOption] = useState<number | null>(null)
  const [triviaStatus, setTriviaStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG' | 'CLAIMED'>('IDLE')
  
  // Miner clicker States
  const [minerCredits, setMinerCredits] = useState(0)
  const [minerFloatingTexts, setMinerFloatingTexts] = useState<Array<{ id: number; x: number; y: number }>>([])
  const [minerMiningSpeed, setMinerMiningSpeed] = useState(1)
  const [minerLevel, setMinerLevel] = useState(1)
  
  // Streak check-in States
  const [streakDays, setStreakDays] = useState([true, false, false, false, false, false, false])
  const [streakClaimedToday, setStreakClaimedToday] = useState(false)

  // Canvas Ref for Spin Wheel
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const segments = ["₹5", "₹10", "₹20", "₹50", "₹100", "TRY AGAIN"]
  const colors = ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#374151"]

  // --- DERIVED PROPERTIES ---
  const userExperience = Math.floor(walletBalance.reward % 100)
  const userLevel = Math.floor(walletBalance.reward / 100) + 1

  // Draw the spin wheel canvas on mount
  useEffect(() => {
    drawWheel(0)
  }, [])

  const drawWheel = (angleOffset: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = canvas.width
    const center = size / 2
    const radius = center - 10

    ctx.clearRect(0, 0, size, size)

    // Outer boundary glow ring
    ctx.beginPath()
    ctx.arc(center, center, radius + 4, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)'
    ctx.lineWidth = 6
    ctx.stroke()

    // Draw slices
    const sliceAngle = (Math.PI * 2) / segments.length
    segments.forEach((text, i) => {
      const startAngle = i * sliceAngle + angleOffset
      const endAngle = startAngle + sliceAngle

      ctx.beginPath()
      ctx.moveTo(center, center)
      ctx.arc(center, center, radius, startAngle, endAngle)
      ctx.fillStyle = colors[i]
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.1)'
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw segment labels
      ctx.save()
      ctx.translate(center, center)
      ctx.rotate(startAngle + sliceAngle / 2)
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 12px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(text, radius - 20, 5)
      ctx.restore()
    })

    // Inner center cap
    ctx.beginPath()
    ctx.arc(center, center, 18, 0, Math.PI * 2)
    ctx.fillStyle = '#FFFFFF'
    ctx.fill()
    ctx.strokeStyle = '#8B5CF6'
    ctx.lineWidth = 4
    ctx.stroke()
  }

  // --- GAMES ACTIONS ---
  
  // 1. Spin the Wheel action
  const handleSpinWheel = () => {
    if (spinDisabled) return
    setSpinDisabled(true)
    setSpinResult(null)

    const randomSegmentIndex = Math.floor(Math.random() * segments.length)
    const sliceAngle = 360 / segments.length
    const stopAngle = 360 - (randomSegmentIndex * sliceAngle + sliceAngle / 2)
    const spinsCount = 5 // Spin 5 full rounds before stopping
    const totalRotation = spinsCount * 360 + stopAngle

    let currentRotation = 0
    const duration = 4000 // 4 seconds spin
    const start = performance.now()

    const animateSpin = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing out quadratic function
      const easeOutQuad = (t: number) => t * (2 - t)
      currentRotation = totalRotation * easeOutQuad(progress)

      const radOffset = (currentRotation * Math.PI) / 180
      drawWheel(radOffset)

      if (progress < 1) {
        requestAnimationFrame(animateSpin)
      } else {
        // Spin finished
        const selectedText = segments[randomSegmentIndex]
        setSpinResult(selectedText)
        
        if (selectedText !== "TRY AGAIN") {
          const rewardVal = parseInt(selectedText.replace("₹", ""))
          setSpinRewardAmount(rewardVal)
          
          // Securely claim rewards
          claimRewardAction(rewardVal, "Spin the Wheel Game").then((res) => {
            if (res.success) {
              setWalletBalance((prev) => ({
                ...prev,
                reward: prev.reward + rewardVal
              }))
            }
          })
        } else {
          setSpinRewardAmount(0)
          setSpinDisabled(false)
        }
      }
    }

    requestAnimationFrame(animateSpin)
  }

  const resetSpinWheel = () => {
    setSpinResult(null)
    setSpinRewardAmount(0)
    setSpinDisabled(false)
  }

  // 2. Trivia Quiz Action
  const handleTriviaAnswer = (optionIdx: number) => {
    if (triviaStatus !== 'IDLE') return
    setSelectedTriviaOption(optionIdx)
    
    const activeTrivia = TRIVIA_QUESTIONS[currentTriviaIndex]
    if (optionIdx === activeTrivia.correct) {
      setTriviaStatus('CORRECT')
      
      // Reward the user
      claimRewardAction(activeTrivia.reward, `Trivia: ${activeTrivia.question.slice(0, 20)}...`).then((res) => {
        if (res.success) {
          setWalletBalance((prev) => ({
            ...prev,
            reward: prev.reward + activeTrivia.reward
          }))
          setTriviaStatus('CLAIMED')
        }
      })
    } else {
      setTriviaStatus('WRONG')
    }
  }

  const nextTriviaQuestion = () => {
    setSelectedTriviaOption(null)
    setTriviaStatus('IDLE')
    setCurrentTriviaIndex((prev) => (prev + 1) % TRIVIA_QUESTIONS.length)
  }

  // 3. Clicker Mining Action
  const handleAsteroidClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()

    // Add floating text
    setMinerFloatingTexts((prev) => [...prev, { id, x, y }])
    
    // Increment accumulated mine points
    setMinerCredits((prev) => {
      const next = prev + 0.1 * minerMiningSpeed
      return parseFloat(next.toFixed(2))
    })

    // Auto cleanup floating text after 1s
    setTimeout(() => {
      setMinerFloatingTexts((prev) => prev.filter((item) => item.id !== id))
    }, 1000)
  }

  const claimMinerRewards = () => {
    if (minerCredits < 2) return
    const claimAmount = Math.floor(minerCredits)
    
    claimRewardAction(claimAmount, "Space clicker mining activity").then((res) => {
      if (res.success) {
        setWalletBalance((prev) => ({
          ...prev,
          reward: prev.reward + claimAmount
        }))
        setMinerCredits((prev) => parseFloat((prev - claimAmount).toFixed(2)))
      }
    })
  }

  const upgradeMiningLaser = () => {
    if (walletBalance.reward < 25) return
    
    // Deduct coins as an upgrade cost
    claimRewardAction(-25, "Mining laser upgrade").then((res) => {
      setWalletBalance((prev) => ({
        ...prev,
        reward: Math.max(0, prev.reward - 25)
      }))
      setMinerMiningSpeed((prev) => prev + 1)
      setMinerLevel((prev) => prev + 1)
    })
  }

  // 4. Daily Streak Action
  const claimStreakReward = (dayIdx: number) => {
    if (dayIdx !== 1 || streakClaimedToday) return // Assume day 2 (index 1) is today's claimable streak
    setStreakClaimedToday(true)
    
    const rewardVal = 10 + dayIdx * 5
    claimRewardAction(rewardVal, `Day ${dayIdx + 1} Daily Streak check-in`).then((res) => {
      if (res.success) {
        setWalletBalance((prev) => ({
          ...prev,
          reward: prev.reward + rewardVal
        }))
        setStreakDays((prev) => {
          const next = [...prev]
          next[dayIdx] = true
          return next
        })
      }
    })
  }

  return (
    <div className="space-y-8">
      {/* ── Gamified User Header Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-800 p-6 md:p-8 text-white shadow-xl shadow-emerald-500/10 border border-white/10"
      >
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-12 translate-x-12 pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-emerald-500/20 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1.5 animate-pulse text-emerald-300">
                <Star className="w-3.5 h-3.5 fill-current" /> Level {userLevel} Gamer
              </span>
              <span className="text-xs font-black uppercase tracking-wider bg-indigo-500/20 backdrop-blur-md px-3 py-1 rounded-full border border-indigo-400/30 text-indigo-200">
                🎮 Timewall Arcade
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-indigo-200 bg-clip-text text-transparent">{user.name.split(' ')[0]}</span>!
            </h1>
            <p className="text-white/80 max-w-lg text-sm font-medium">
              Play games, answer fun trivia challenges, or mine assets below to claim cash rewards directly into your reward wallet!
            </p>

            {/* Gamer Level Progression */}
            <div className="space-y-1.5 max-w-sm pt-2">
              <div className="flex justify-between text-xs font-bold text-white/70">
                <span>XP Progress to Level {userLevel + 1}</span>
                <span>{userExperience}/100 XP</span>
              </div>
              <div className="h-2.5 w-full bg-black/30 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${userExperience}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </div>

          {/* Large Dynamic Wallet Info */}
          <div className="flex gap-4 self-start md:self-center shrink-0">
            <div className="bg-black/30 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/10 flex items-center gap-4 hover:border-emerald-400/40 transition-colors shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
                <Coins className="w-6 h-6 text-white animate-bounce" />
              </div>
              <div>
                <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Reward Balance</p>
                <p className="text-2xl font-black text-emerald-300 tracking-tight">{formatCurrency(walletBalance.reward)}</p>
              </div>
            </div>
            
            <div className="bg-black/30 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/10 flex items-center gap-4 hover:border-indigo-400/40 transition-colors shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center shadow-md">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Main Wallet</p>
                <p className="text-2xl font-black text-indigo-300 tracking-tight">{formatCurrency(walletBalance.main)}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Arcade grid (Timewall Activities) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ACTIVITY 1: Spin the Wheel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="premium-card p-6 flex flex-col justify-between items-center text-center relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors pointer-events-none" />
          
          <div className="w-full flex items-center justify-between mb-4 border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400 animate-spin" />
              <h2 className="font-extrabold text-base text-white">Daily Spin the Wheel</h2>
            </div>
            <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg">
              Arcade #1
            </span>
          </div>

          {/* Spinner canvas container */}
          <div className="relative my-6 flex items-center justify-center">
            {/* Pointer peg */}
            <div className="absolute top-0 z-20 -translate-y-4 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]" />
            
            <canvas
              ref={canvasRef}
              width={260}
              height={260}
              className="bg-transparent filter drop-shadow-[0_8px_24px_rgba(139,92,246,0.2)] rounded-full transition-transform"
            />
          </div>

          <div className="w-full space-y-4">
            <AnimatePresence mode="wait">
              {spinResult ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/10 shadow-inner"
                >
                  {spinResult === "TRY AGAIN" ? (
                    <div className="flex items-center justify-center gap-2 text-rose-400">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-black text-sm uppercase tracking-wide">Aww, Try Again Tomorrow!</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-emerald-400 animate-bounce">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 fill-current" />
                        <span className="font-black text-sm uppercase tracking-wide">Victory! You Won</span>
                      </div>
                      <span className="text-2xl font-black text-white">{spinResult} Reward Coins</span>
                    </div>
                  )}
                </motion.div>
              ) : (
                <p className="text-xs text-muted-foreground font-medium py-1">
                  Spin the colorful wheel to win up to ₹100 instantly! 100% free daily ticket.
                </p>
              )}
            </AnimatePresence>

            <div className="flex gap-2">
              <button
                disabled={spinDisabled}
                onClick={handleSpinWheel}
                className="flex-1 py-3 px-6 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-white/5"
              >
                {spinDisabled && !spinResult ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Spinning...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Launch Spin Wheel
                  </>
                )}
              </button>
              
              {spinResult && (
                <button
                  onClick={resetSpinWheel}
                  className="py-3 px-4 rounded-xl font-bold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors text-xs flex items-center justify-center cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* ACTIVITY 2: Trivia Daily Quiz */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="premium-card p-6 flex flex-col justify-between text-left relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="w-full flex items-center justify-between mb-4 border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-emerald-400" />
              <h2 className="font-extrabold text-base text-white">Daily Crypto/Finance Trivia</h2>
            </div>
            <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
              Quiz #{currentTriviaIndex + 1}
            </span>
          </div>

          <div className="my-4 space-y-4 flex-1">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-xs font-bold text-emerald-300 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> Earn {TRIVIA_QUESTIONS[currentTriviaIndex].reward} Coins
              </p>
              <h3 className="font-bold text-sm text-white">{TRIVIA_QUESTIONS[currentTriviaIndex].question}</h3>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 gap-2.5">
              {TRIVIA_QUESTIONS[currentTriviaIndex].options.map((option, idx) => {
                const isSelected = selectedTriviaOption === idx
                let btnStyle = "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white/80"
                
                if (isSelected) {
                  if (triviaStatus === 'CORRECT' || triviaStatus === 'CLAIMED') {
                    btnStyle = "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-bold"
                  } else if (triviaStatus === 'WRONG') {
                    btnStyle = "bg-rose-500/10 border-rose-500/40 text-rose-400 font-bold"
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={selectedTriviaOption !== null}
                    onClick={() => handleTriviaAnswer(idx)}
                    className={`w-full py-2.5 px-4 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer disabled:cursor-default ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {isSelected && (triviaStatus === 'CORRECT' || triviaStatus === 'CLAIMED') && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {isSelected && triviaStatus === 'WRONG' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="w-full mt-4">
            <AnimatePresence mode="wait">
              {triviaStatus === 'CLAIMED' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1.5 justify-center"
                >
                  <CheckCircle2 className="w-4.5 h-4.5" />
                  Rewards claimed successfully! Correct answer.
                </motion.div>
              )}
              {triviaStatus === 'WRONG' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-1.5 justify-center"
                >
                  <AlertCircle className="w-4.5 h-4.5" />
                  Incorrect. Better luck on the next question!
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={nextTriviaQuestion}
              className="w-full py-3 px-6 rounded-xl font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Next Question</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* ACTIVITY 3: Space Clicker Miner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="premium-card p-6 flex flex-col justify-between text-left relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="w-full flex items-center justify-between mb-4 border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <h2 className="font-extrabold text-base text-white">Space Asteroid Miner</h2>
            </div>
            <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg">
              Arcade #3
            </span>
          </div>

          <div className="my-4 flex flex-col md:flex-row items-center gap-6">
            {/* Asteroid clicker box */}
            <div
              onClick={handleAsteroidClick}
              className="w-44 h-44 rounded-3xl bg-gradient-to-tr from-cyan-950 to-indigo-900 border border-cyan-500/30 flex items-center justify-center relative cursor-pointer active:scale-95 transition-all overflow-hidden select-none group/asteroid"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15),transparent_60%)] group-hover/asteroid:scale-125 transition-transform" />
              
              {/* Asteroid Graphic */}
              <motion.div
                animate={{
                  rotate: 360,
                  y: [0, -6, 0]
                }}
                transition={{
                  rotate: { repeat: Infinity, duration: 15, ease: 'linear' },
                  y: { repeat: Infinity, duration: 3, ease: 'easeInOut' }
                }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-600 via-sky-800 to-indigo-950 border-2 border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center"
              >
                <Star className="w-8 h-8 text-cyan-200 animate-pulse" />
              </motion.div>

              {/* Floating click rewards indicators */}
              <AnimatePresence>
                {minerFloatingTexts.map((txt) => (
                  <motion.span
                    key={txt.id}
                    initial={{ opacity: 1, y: txt.y - 20, scale: 0.8 }}
                    animate={{ opacity: 0, y: txt.y - 70, scale: 1.2 }}
                    exit={{ opacity: 0 }}
                    style={{ left: txt.x }}
                    className="absolute text-cyan-300 font-black text-xs pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                  >
                    +₹{(0.1 * minerMiningSpeed).toFixed(2)}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex-1 space-y-4 w-full">
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Accumulating Mine Pool</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">₹{minerCredits.toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground">/ min ₹2.00 claim limit</span>
                </div>
                <div className="h-2 w-full bg-black/30 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-cyan-400 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (minerCredits / 2) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-white/70">
                <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                  <span className="block text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Laser Power</span>
                  <span className="text-cyan-300 font-bold">Lvl {minerLevel} (+₹{(0.1 * minerMiningSpeed).toFixed(2)}/click)</span>
                </div>
                <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                  <span className="block text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Claimable Assets</span>
                  <span className="text-emerald-400 font-bold">₹{Math.floor(minerCredits).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full flex gap-3 pt-4 border-t border-white/5">
            <button
              disabled={minerCredits < 2}
              onClick={claimMinerRewards}
              className="flex-1 py-3 px-4 rounded-xl font-bold bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-500 hover:to-sky-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Gift className="w-4 h-4" />
              Claim Wallet Coins (₹{Math.floor(minerCredits)})
            </button>
            
            <button
              disabled={walletBalance.reward < 25}
              onClick={upgradeMiningLaser}
              className="py-3 px-4 rounded-xl font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white disabled:opacity-40 disabled:cursor-not-allowed text-xs flex items-center justify-center gap-1.5 cursor-pointer text-center"
              title="Cost: 25 Coins"
            >
              <Star className="w-4 h-4 fill-current text-yellow-500" />
              Upgrade Laser (Cost: 25)
            </button>
          </div>
        </motion.div>

        {/* ACTIVITY 4: Daily Streak check-in */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="premium-card p-6 flex flex-col justify-between text-left relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="w-full flex items-center justify-between mb-4 border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 animate-pulse fill-current" />
              <h2 className="font-extrabold text-base text-white">7-Day Login Streak Tracker</h2>
            </div>
            <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">
              Bonus XP
            </span>
          </div>

          <div className="my-6 space-y-4">
            <p className="text-xs text-muted-foreground font-medium">
              Log in consecutive days to boost your daily rewards. Missing a single day resets your progress streak!
            </p>

            {/* Streak Grid */}
            <div className="grid grid-cols-7 gap-2">
              {streakDays.map((claimed, idx) => {
                const isClaimable = idx === 1 && !streakClaimedToday // Day 2 is claimable
                const isClaimed = claimed || (idx === 1 && streakClaimedToday)
                const isPast = idx < 1
                
                let cardStyle = "bg-white/5 border-white/5 text-white/50"
                if (isClaimed) {
                  cardStyle = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold"
                } else if (isClaimable) {
                  cardStyle = "bg-amber-500/10 border-amber-500/40 text-amber-400 font-extrabold animate-pulse cursor-pointer"
                }

                return (
                  <div
                    key={idx}
                    onClick={() => isClaimable && claimStreakReward(idx)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${cardStyle}`}
                  >
                    <span className="text-[10px] block font-bold mb-1">Day {idx + 1}</span>
                    <div className="w-7 h-7 rounded-full bg-black/20 flex items-center justify-center text-xs">
                      {isClaimed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        `+${10 + idx * 5}`
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="w-full flex items-center justify-between pt-4 border-t border-white/5 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
              <Info className="w-4 h-4 text-amber-400" />
              <span>Current active streak:</span>
              <span className="text-white font-black">{streakClaimedToday ? '2 Days' : '1 Day'}</span>
            </div>
            {streakClaimedToday && (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Today Checked-in
              </span>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  )
}
