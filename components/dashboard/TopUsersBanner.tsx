'use client'

import { formatCurrency } from '@/utils/formatters'

interface TopUsersBannerProps {
  topUsers: {
    name: string
    referralCode: string
    profilePictureUrl: string | null
    wallet: {
      mainBalance: number
    } | null
  }[]
}

export function TopUsersBanner({ topUsers }: TopUsersBannerProps) {
  if (!topUsers || topUsers.length === 0) return null

  const renderAvatar = (user: typeof topUsers[number]) => {
    if (user.profilePictureUrl) {
      return (
        <img
          src={user.profilePictureUrl}
          alt={user.name}
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-white/10 shrink-0"
        />
      )
    }
    const initials = user.name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
    return (
      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-[8px] sm:text-[10px] font-bold shrink-0">
        {initials || '?'}
      </div>
    )
  }

  return (
    <div className="relative w-full z-20 bg-card/65 border-b border-border/80 backdrop-blur-md py-1.5 sm:py-2.5 overflow-x-clip overflow-y-visible select-none" style={{ overflowX: 'clip', overflowY: 'visible' }}>
      <div className="flex w-max animate-marquee pause-marquee-on-hover">
        {/* First track */}
        <div className="flex items-center gap-8 sm:gap-12 px-4 sm:px-6">
          {topUsers.map((user, idx) => {
            const balance = user.wallet?.mainBalance ?? 0
            return (
              <div key={`banner-item-1-${idx}`} className="relative group cursor-pointer flex items-center gap-2">
                {/* Profile Image/Avatar */}
                {renderAvatar(user)}
                
                {/* Name */}
                <span className="text-[11px] sm:text-xs md:text-sm font-bold text-foreground/90 hover:text-primary transition-colors duration-200">
                  {user.name}
                </span>
                
                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2.5 hidden group-hover:flex flex-col z-50 bg-card/95 border border-border rounded-xl p-3 sm:p-3.5 shadow-2xl min-w-[180px] sm:min-w-[220px] text-[10px] sm:text-xs pointer-events-none text-left backdrop-blur-xl animate-fade-in">
                  <div className="space-y-2">
                    <div className="flex justify-between gap-4 items-center">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="text-white font-extrabold">{user.name}</span>
                    </div>
                    <div className="flex justify-between gap-4 items-center border-t border-border/50 pt-1.5">
                      <span className="text-muted-foreground">Referral Code:</span>
                      <span className="font-mono text-white font-black">{user.referralCode}</span>
                    </div>
                    <div className="flex justify-between gap-4 items-center">
                      <span className="text-muted-foreground">Main Wallet Amount:</span>
                      <span className="text-green-400 font-black text-xs sm:text-sm">{formatCurrency(balance)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {/* Second track (exact duplicate for seamless infinite scrolling) */}
        <div className="flex items-center gap-8 sm:gap-12 px-4 sm:px-6" aria-hidden="true">
          {topUsers.map((user, idx) => {
            const balance = user.wallet?.mainBalance ?? 0
            return (
              <div key={`banner-item-2-${idx}`} className="relative group cursor-pointer flex items-center gap-2">
                {/* Profile Image/Avatar */}
                {renderAvatar(user)}
                
                {/* Name */}
                <span className="text-[11px] sm:text-xs md:text-sm font-bold text-foreground/90 hover:text-primary transition-colors duration-200">
                  {user.name}
                </span>
                
                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2.5 hidden group-hover:flex flex-col z-50 bg-card/95 border border-border rounded-xl p-3 sm:p-3.5 shadow-2xl min-w-[180px] sm:min-w-[220px] text-[10px] sm:text-xs pointer-events-none text-left backdrop-blur-xl animate-fade-in">
                  <div className="space-y-2">
                    <div className="flex justify-between gap-4 items-center">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="text-white font-extrabold">{user.name}</span>
                    </div>
                    <div className="flex justify-between gap-4 items-center border-t border-border/50 pt-1.5">
                      <span className="text-muted-foreground">Referral Code:</span>
                      <span className="font-mono text-white font-black">{user.referralCode}</span>
                    </div>
                    <div className="flex justify-between gap-4 items-center">
                      <span className="text-muted-foreground">Main Wallet Amount:</span>
                      <span className="text-green-400 font-black text-xs sm:text-sm">{formatCurrency(balance)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
