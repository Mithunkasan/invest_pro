'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { buyMembershipPlanAction } from '@/actions/user'
import { Crown, Loader2, Check } from 'lucide-react'

interface UpgradeButtonProps {
  planId: string
  planName: string
  price: number
  depositBalance: number
  isActivePlan: boolean
  color: string
  hasPendingRequest?: boolean
  isLowerOrEqual?: boolean
}

export function MembershipUpgradeButton({ 
  planId,
  planName, 
  price, 
  depositBalance, 
  isActivePlan, 
  color,
  hasPendingRequest,
  isLowerOrEqual
}: UpgradeButtonProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleUpgrade = () => {
    if (isActivePlan) return
    if (isLowerOrEqual) return
    if (hasPendingRequest) return
    if (depositBalance < price) {
      toast({
        title: 'Insufficient Balance',
        description: 'Please deposit funds into your Deposit Wallet first.',
        variant: 'destructive',
      })
      return
    }

    startTransition(async () => {
      try {
        const res = await buyMembershipPlanAction(planId)
        if (res.success) {
          toast({
            title: 'Request Submitted! 👑',
            description: res.message,
          })
          router.refresh()
        } else {
          toast({
            title: 'Request Failed',
            description: res.message,
            variant: 'destructive',
          })
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        })
      }
    })
  }

  if (isActivePlan) {
    return (
      <Button disabled className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-not-allowed flex items-center justify-center gap-1.5 rounded-xl h-10.5">
        <Check className="w-4.5 h-4.5" />
        Current Plan
      </Button>
    )
  }

  if (isLowerOrEqual) {
    return (
      <Button disabled className="w-full bg-white/5 text-white/20 font-bold cursor-not-allowed border border-white/5 rounded-xl h-10.5">
        Upgrade Only
      </Button>
    )
  }

  if (hasPendingRequest) {
    return (
      <Button disabled className="w-full bg-amber-500/10 text-amber-500 font-bold cursor-not-allowed border border-amber-500/20 rounded-xl h-10.5">
        Pending Approval
      </Button>
    )
  }

  if (depositBalance < price) {
    return (
      <div className="space-y-3">
        <Button disabled className="w-full bg-white/10 text-white/40 font-bold cursor-not-allowed border border-white/5 rounded-xl h-10.5">
          Insufficient Balance
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={handleUpgrade}
      disabled={isPending}
      className="w-full text-black font-extrabold border border-white/10 shadow-[0_0_15px_rgba(245,158,11,0.2)] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-80 rounded-xl h-10.5 cursor-pointer"
      style={{
        backgroundImage: `linear-gradient(to right, ${color}, ${color}dd)`,
        boxShadow: `0 4px 15px ${color}30`,
      }}
    >
      {isPending ? (
        <>
          <Loader2 className="w-4.5 h-4.5 animate-spin text-black" />
          Submitting...
        </>
      ) : (
        <>
          <Crown className="w-4.5 h-4.5 text-black shrink-0" />
          Subscribe Now
        </>
      )}
    </Button>
  )
}
