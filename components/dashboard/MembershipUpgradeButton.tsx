'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { buyPremiumMembershipAction } from '@/actions/user'
import { Crown, Loader2 } from 'lucide-react'

interface UpgradeButtonProps {
  upgradePrice: number
  mainBalance: number
  isPremium: boolean
  color: string
}

export function MembershipUpgradeButton({ upgradePrice, mainBalance, isPremium, color }: UpgradeButtonProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleUpgrade = () => {
    if (isPremium) return
    if (mainBalance < upgradePrice) {
      toast({
        title: 'Insufficient Balance',
        description: 'Please deposit funds into your main wallet first.',
        variant: 'destructive',
      })
      return
    }

    startTransition(async () => {
      try {
        const res = await buyPremiumMembershipAction()
        if (res.success) {
          toast({
            title: 'Upgrade Successful! 👑',
            description: res.message,
          })
          router.refresh()
        } else {
          toast({
            title: 'Upgrade Failed',
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

  if (isPremium) {
    return (
      <Button disabled className="w-full bg-green-600 hover:bg-green-700 text-white font-bold cursor-not-allowed">
        Already Subscribed
      </Button>
    )
  }

  if (mainBalance < upgradePrice) {
    return (
      <div className="space-y-3">
        <Button disabled className="w-full bg-white/10 text-white/40 font-bold cursor-not-allowed border border-white/5">
          Insufficient Balance
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={handleUpgrade}
      disabled={isPending}
      className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-bold border border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-80"
      style={{
        backgroundImage: `linear-gradient(to right, ${color}, ${color}dd)`,
        boxShadow: `0 0 15px ${color}40`,
      }}
    >
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-black" />
          Upgrading...
        </>
      ) : (
        <>
          <Crown className="w-4 h-4 text-black shrink-0" />
          Upgrade Instantly
        </>
      )}
    </Button>
  )
}
