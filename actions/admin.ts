'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import type { ApiResponse } from '@/types'

// ── User Management ───────────────────────────────────────────────────────────
export async function toggleUserStatus(userId: string): Promise<ApiResponse> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return { success: false, message: 'User not found' }

    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
    await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus as any },
    })

    revalidatePath('/admin/dashboard/users')
    return { success: true, message: `User ${newStatus === 'ACTIVE' ? 'activated' : 'suspended'} successfully` }
  } catch (error) {
    return { success: false, message: 'Failed to update user status' }
  }
}

// ── Deposit Management ────────────────────────────────────────────────────────
export async function handleDeposit(depositId: string, action: 'APPROVE' | 'REJECT', remarks?: string): Promise<ApiResponse> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  try {
    const deposit = await prisma.deposit.findUnique({ 
      where: { id: depositId },
      include: { user: true }
    })
    if (!deposit || deposit.status !== 'PENDING') return { success: false, message: 'Invalid deposit request' }

    if (action === 'APPROVE') {
      // Fetch user's membership plan to calculate potential yield bonus
      const user = await prisma.user.findUnique({
        where: { id: deposit.userId },
        include: { membershipPlan: true }
      })

      const depositAmount = deposit.amount
      let bonusAmount = 0
      if (user?.membershipPlan && user.membershipPlan.depositBonus > 0) {
        bonusAmount = (depositAmount * user.membershipPlan.depositBonus) / 100
      }

      const totalIncrement = depositAmount + bonusAmount

      const dbOps: any[] = [
        // Update deposit status
        prisma.deposit.update({
          where: { id: depositId },
          data: { status: 'APPROVED', approvedById: admin.id, remarks },
        }),
        // Update user wallet with total increment (deposit + yield bonus)
        prisma.wallet.update({
          where: { userId: deposit.userId },
          data: { mainBalance: { increment: totalIncrement } },
        }),
        // Create transaction record for deposit
        prisma.transaction.create({
          data: {
            userId: deposit.userId,
            type: 'DEPOSIT',
            amount: depositAmount,
            status: 'COMPLETED',
            description: `Deposit via ${deposit.method} approved`,
            reference: deposit.utrNumber || depositId,
          },
        }),
        // Notification
        prisma.notification.create({
          data: {
            userId: deposit.userId,
            title: 'Deposit Approved ✅',
            message: `Your deposit of ₹${depositAmount.toLocaleString('en-IN')} has been approved.${bonusAmount > 0 ? ` An additional ₹${bonusAmount.toLocaleString('en-IN')} has been credited as a ${user?.membershipPlan?.name || 'Membership'} yield bonus!` : ''}`,
            type: 'SUCCESS',
          },
        }),
      ]

      // Add a bonus transaction record if a membership bonus was applied
      if (bonusAmount > 0) {
        dbOps.push(
          prisma.transaction.create({
            data: {
              userId: deposit.userId,
              type: 'BONUS',
              amount: bonusAmount,
              status: 'COMPLETED',
              description: `${user?.membershipPlan?.name || 'Membership'} +${user?.membershipPlan?.depositBonus || 0}% Deposit Yield Bonus`,
              reference: deposit.utrNumber || depositId,
            },
          })
        )
      }

      // ── Distribute Referral Commissions ──
      const referralUpdates: { referrerId: string; amount: number; level: number }[] = []
      
      const settings = await prisma.systemSettings.findUnique({ where: { id: 'default' } })
      if (settings && user?.referredById) {
        const percentageString = settings.referralCommissionStructure || '10,5,3'
        let levelPercentages = percentageString
          .split(',')
          .map(p => Number(p.trim()))
          .filter(p => !isNaN(p))
          
        if (!settings.levelIncomeEnabled && levelPercentages.length > 0) {
          levelPercentages = [levelPercentages[0]]
        }

        let currentReferrerId: string | null = user.referredById
        
        for (let index = 0; index < levelPercentages.length; index++) {
          if (!currentReferrerId) break
          
          const percentage = levelPercentages[index]
          const level = index + 1
          
          const referrer = (await prisma.user.findUnique({
            where: { id: currentReferrerId },
            select: { id: true, name: true, referredById: true }
          })) as any
          if (!referrer) break
          
          if (percentage > 0) {
            const commissionAmount = (depositAmount * percentage) / 100
            
            // 1. Credit referrer's wallet
            dbOps.push(
              prisma.wallet.update({
                where: { userId: referrer.id },
                data: { referralBalance: { increment: commissionAmount } }
              })
            )
            
            // 2. Create transaction record for referral bonus
            dbOps.push(
              prisma.transaction.create({
                data: {
                  userId: referrer.id,
                  type: 'REFERRAL_BONUS',
                  amount: commissionAmount,
                  status: 'COMPLETED',
                  reference: deposit.utrNumber || depositId,
                  description: `Level ${level} referral commission from ${user.name}'s deposit`,
                  walletType: 'REFERRAL'
                }
              })
            )
            
            // 3. Notification for referrer
            dbOps.push(
              prisma.notification.create({
                data: {
                  userId: referrer.id,
                  title: 'Referral Commission Received 👥',
                  message: `You earned ₹${commissionAmount.toLocaleString('en-IN')} Level ${level} referral commission from ${user.name}'s deposit.`,
                  type: 'SUCCESS'
                }
              })
            )
            
            // 4. Update/Create Referral record
            const referralRecord = await prisma.referral.findFirst({
              where: { referrerId: referrer.id, referredId: user.id }
            })
            
            if (referralRecord) {
              dbOps.push(
                prisma.referral.update({
                  where: { id: referralRecord.id },
                  data: { commission: { increment: commissionAmount }, level: level }
                })
              )
            } else {
              dbOps.push(
                prisma.referral.create({
                  data: {
                    referrerId: referrer.id,
                    referredId: user.id,
                    commission: commissionAmount,
                    level: level
                  }
                })
              )
            }
            
            referralUpdates.push({ referrerId: referrer.id, amount: commissionAmount, level: level })
          }
          
          currentReferrerId = referrer.referredById
        }
      }

      await prisma.$transaction(dbOps)

      // Run Badges & TL Rank check for each referrer who got a commission
      for (const update of referralUpdates) {
        try {
          const { checkAndApplyPerformanceBadges, checkAndApplyTLRank } = require('./rules')
          await checkAndApplyPerformanceBadges(update.referrerId)
          await checkAndApplyTLRank(update.referrerId)
        } catch (ruleErr) {
          console.error(`Error checking rules for referrer ${update.referrerId}:`, ruleErr)
        }
      }
    } else {
      await prisma.deposit.update({
        where: { id: depositId },
        data: { status: 'REJECTED', approvedById: admin.id, remarks },
      })
      await prisma.notification.create({
        data: {
          userId: deposit.userId,
          title: 'Deposit Rejected ❌',
          message: `Your deposit of ₹${deposit.amount.toLocaleString('en-IN')} was rejected. ${remarks || ''}`,
          type: 'ERROR',
        },
      })
    }

    try {
      revalidatePath('/admin/dashboard/deposits')
      revalidatePath('/admin/dashboard')
    } catch (e) {
      // safe bypass outside request lifecycle
    }
    return { success: true, message: `Deposit ${action.toLowerCase()}d successfully` }
  } catch (error) {
    console.error('Error processing deposit:', error)
    return { success: false, message: 'Failed to process deposit' }
  }
}

// ── Withdrawal Management ─────────────────────────────────────────────────────
export async function handleWithdrawal(withdrawalId: string, action: 'APPROVE' | 'REJECT', remarks?: string): Promise<ApiResponse> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  try {
    const withdrawal = await prisma.withdrawal.findUnique({ 
      where: { id: withdrawalId },
      include: { user: true }
    })
    if (!withdrawal || withdrawal.status !== 'PENDING') return { success: false, message: 'Invalid withdrawal request' }

    if (action === 'APPROVE') {
      await prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: { status: 'APPROVED', approvedById: admin.id, processedAt: new Date(), remarks },
      })
      await prisma.notification.create({
        data: {
          userId: withdrawal.userId,
          title: 'Withdrawal Approved ✅',
          message: `Your withdrawal of ₹${withdrawal.amount.toLocaleString()} has been processed.`,
          type: 'SUCCESS',
        },
      })
    } else {
      await prisma.$transaction([
        // Reject withdrawal
        prisma.withdrawal.update({
          where: { id: withdrawalId },
          data: { status: 'REJECTED', approvedById: admin.id, remarks },
        }),
        // Refund to wallet
        prisma.wallet.update({
          where: { userId: withdrawal.userId },
          data: { mainBalance: { increment: withdrawal.amount } },
        }),
        // Notification
        prisma.notification.create({
          data: {
            userId: withdrawal.userId,
            title: 'Withdrawal Rejected ❌',
            message: `Your withdrawal of ₹${withdrawal.amount.toLocaleString()} was rejected and refunded.`,
            type: 'ERROR',
          },
        }),
      ])
    }

    revalidatePath('/admin/dashboard/withdrawals')
    revalidatePath('/admin/dashboard')
    return { success: true, message: `Withdrawal ${action.toLowerCase()}d successfully` }
  } catch (error) {
    return { success: false, message: 'Failed to process withdrawal' }
  }
}

// ── KYC Management ────────────────────────────────────────────────────────────
export async function handleKYC(kycId: string, action: 'APPROVED' | 'REJECTED', remarks?: string): Promise<ApiResponse> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  try {
    await prisma.kYC.update({
      where: { id: kycId },
      data: { status: action, reviewedById: admin.id, reviewedAt: new Date(), remarks },
    })

    const kyc = await prisma.kYC.findUnique({ where: { id: kycId } })
    if (kyc) {
      await prisma.notification.create({
        data: {
          userId: kyc.userId,
          title: action === 'APPROVED' ? 'KYC Verified ✅' : 'KYC Rejected ❌',
          message: action === 'APPROVED' ? 'Your identity verification is complete.' : `Your KYC was rejected. ${remarks || ''}`,
          type: action === 'APPROVED' ? 'SUCCESS' : 'ERROR',
        },
      })
    }

    revalidatePath('/admin/dashboard/kyc')
    revalidatePath('/admin/dashboard')
    return { success: true, message: `KYC ${action.toLowerCase()} successfully` }
  } catch (error) {
    return { success: false, message: 'Failed to process KYC' }
  }
}

// ── Investment Plan Management ───────────────────────────────────────────────
export async function upsertInvestmentPlan(data: any): Promise<ApiResponse> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  try {
    const { id, ...payload } = data
    if (id) {
      await prisma.investmentPlan.update({ where: { id }, data: payload })
    } else {
      await prisma.investmentPlan.create({ data: payload })
    }

    revalidatePath('/admin/dashboard/plans')
    revalidatePath('/')
    revalidateTag('investment-plans', 'max')
    return { success: true, message: `Plan ${id ? 'updated' : 'created'} successfully` }
  } catch (error) {
    return { success: false, message: 'Failed to save investment plan' }
  }
}

// ── Admin: Get System Settings ────────────────────────────────────────────────
export async function getSystemSettings(): Promise<any> {
  const admin = await getAdminSession()
  if (!admin) return null

  try {
    let settings = await prisma.systemSettings.findUnique({ where: { id: 'default' } })
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          id: 'default',
          referralPercent: 10.0,
          level1Percent: 10.0,
          level2Percent: 5.0,
          level3Percent: 2.0,
          levelIncomeEnabled: true,
          referralCommissionStructure: '10,5,3',
          starPerformerThreshold: 5000.0,
          starPerformerEnabled: true,
          doubleStarThreshold: 25000.0,
          doubleStarEnabled: true,
          eliteThreshold: 50000.0,
          eliteEnabled: true,
          tlRankRequiredReferrals: 5,
          tlRankRequiredCommission: 100000.0,
          tlRankMaxUsers: 25,
          tlRankEnabled: true,
          directorRankRequiredTLs: 5,
          directorRankMaxUsers: 5,
          directorRankEnabled: true,
          heroMembers: '25,689+',
          heroActive: '8,932+',
          heroPaid: '₹12.45 Cr+',
          heroRate: '99.8%',
        }
      })
    }
    return settings
  } catch (error) {
    console.error('Error fetching system settings:', error)
    return null
  }
}

// ── Admin: Update System Settings ────────────────────────────────────────────
export async function updateSystemSettingsAction(data: any): Promise<ApiResponse> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  try {
    await prisma.systemSettings.upsert({
      where: { id: 'default' },
      update: {
        referralPercent: Number(data.referralPercent),
        level1Percent: Number(data.level1Percent),
        level2Percent: Number(data.level2Percent),
        level3Percent: Number(data.level3Percent),
        levelIncomeEnabled: Boolean(data.levelIncomeEnabled),
        referralCommissionStructure: String(data.referralCommissionStructure || '10,5,3'),
        starPerformerThreshold: Number(data.starPerformerThreshold),
        starPerformerEnabled: Boolean(data.starPerformerEnabled),
        doubleStarThreshold: Number(data.doubleStarThreshold || 25000.0),
        doubleStarEnabled: Boolean(data.doubleStarEnabled),
        eliteThreshold: Number(data.eliteThreshold || 50000.0),
        eliteEnabled: Boolean(data.eliteEnabled),
        tlRankRequiredReferrals: Number(data.tlRankRequiredReferrals),
        tlRankRequiredCommission: Number(data.tlRankRequiredCommission || 100000.0),
        tlRankMaxUsers: Number(data.tlRankMaxUsers),
        tlRankEnabled: Boolean(data.tlRankEnabled),
        directorRankRequiredTLs: Number(data.directorRankRequiredTLs || 5),
        directorRankMaxUsers: Number(data.directorRankMaxUsers || 5),
        directorRankEnabled: Boolean(data.directorRankEnabled),
        heroMembers: String(data.heroMembers),
        heroActive: String(data.heroActive),
        heroPaid: String(data.heroPaid),
        heroRate: String(data.heroRate),
      },
      create: {
        id: 'default',
        referralPercent: Number(data.referralPercent),
        level1Percent: Number(data.level1Percent),
        level2Percent: Number(data.level2Percent),
        level3Percent: Number(data.level3Percent),
        levelIncomeEnabled: Boolean(data.levelIncomeEnabled),
        referralCommissionStructure: String(data.referralCommissionStructure || '10,5,3'),
        starPerformerThreshold: Number(data.starPerformerThreshold),
        starPerformerEnabled: Boolean(data.starPerformerEnabled),
        doubleStarThreshold: Number(data.doubleStarThreshold || 25000.0),
        doubleStarEnabled: Boolean(data.doubleStarEnabled),
        eliteThreshold: Number(data.eliteThreshold || 50000.0),
        eliteEnabled: Boolean(data.eliteEnabled),
        tlRankRequiredReferrals: Number(data.tlRankRequiredReferrals),
        tlRankRequiredCommission: Number(data.tlRankRequiredCommission || 100000.0),
        tlRankMaxUsers: Number(data.tlRankMaxUsers),
        tlRankEnabled: Boolean(data.tlRankEnabled),
        directorRankRequiredTLs: Number(data.directorRankRequiredTLs || 5),
        directorRankMaxUsers: Number(data.directorRankMaxUsers || 5),
        directorRankEnabled: Boolean(data.directorRankEnabled),
        heroMembers: String(data.heroMembers),
        heroActive: String(data.heroActive),
        heroPaid: String(data.heroPaid),
        heroRate: String(data.heroRate),
      }
    })

    revalidatePath('/admin/dashboard/settings')
    revalidatePath('/')
    return { success: true, message: 'System settings updated successfully' }
  } catch (error) {
    console.error('Error updating system settings:', error)
    return { success: false, message: 'Failed to update system settings' }
  }
}

// ── Admin: Manual Adjust Wallet Balance ───────────────────────────────────────
export async function adjustUserBalanceAction(
  userId: string,
  walletType: 'MAIN' | 'BONUS' | 'REFERRAL' | 'LEVEL' | 'REWARD' | 'SHARE',
  amount: number,
  operation: 'ADD' | 'SUBTRACT'
): Promise<ApiResponse> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  if (isNaN(amount) || amount <= 0) return { success: false, message: 'Invalid amount' }

  try {
    const wallet = await prisma.wallet.findUnique({ where: { userId } })
    if (!wallet) return { success: false, message: 'Wallet not found' }

    let field: keyof typeof wallet
    let txType: any = 'BONUS'

    switch (walletType) {
      case 'MAIN':
        field = 'mainBalance'
        txType = operation === 'ADD' ? 'DEPOSIT' : 'WITHDRAWAL'
        break
      case 'BONUS':
        field = 'bonusBalance'
        txType = 'BONUS'
        break
      case 'REFERRAL':
        field = 'referralBalance'
        txType = 'REFERRAL_BONUS'
        break
      case 'LEVEL':
        field = 'levelBalance'
        txType = 'LEVEL_INCOME'
        break
      case 'REWARD':
        field = 'rewardBalance'
        txType = 'REWARD'
        break
      case 'SHARE':
        field = 'shareBalance'
        txType = 'SHARE_BONUS'
        break
      default:
        return { success: false, message: 'Invalid wallet type' }
    }

    const currentVal = wallet[field] as number
    if (operation === 'SUBTRACT' && currentVal < amount) {
      return { success: false, message: `Insufficient balance in ${walletType} wallet (Current: ₹${currentVal})` }
    }

    const delta = operation === 'ADD' ? amount : -amount

    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId },
        data: { [field]: { increment: delta } },
      }),
      prisma.transaction.create({
        data: {
          userId,
          type: txType,
          amount,
          status: 'COMPLETED',
          description: `Admin manual ${operation === 'ADD' ? 'addition' : 'deduction'} of ₹${amount} to ${walletType} wallet`,
          walletType: walletType as any,
        },
      }),
      prisma.notification.create({
        data: {
          userId,
          title: `Wallet Adjusted 💼`,
          message: `Admin has manually ${operation === 'ADD' ? 'added' : 'deducted'} ₹${amount.toLocaleString('en-IN')} ${operation === 'ADD' ? 'to' : 'from'} your ${walletType} wallet.`,
          type: operation === 'ADD' ? 'SUCCESS' : 'WARNING',
        },
      }),
    ])

    // Trigger promotions check if REFERRAL wallet got incremented
    if (walletType === 'REFERRAL' && operation === 'ADD') {
      const { checkAndApplyPerformanceBadges, checkAndApplyTLRank } = require('./rules')
      await checkAndApplyPerformanceBadges(userId)
      await checkAndApplyTLRank(userId)
    }

    revalidatePath('/admin/dashboard/wallet')
    revalidatePath('/dashboard/wallet')
    revalidatePath('/dashboard')
    return { success: true, message: `Manually adjusted balance successfully` }
  } catch (error) {
    console.error('Error adjusting wallet balance:', error)
    return { success: false, message: 'Failed to adjust wallet balance' }
  }
}

// ── Admin: Toggle Rank/Badge manually ─────────────────────────────────────────
export async function toggleUserRankAction(
  userId: string,
  rankType: 'starPerformer' | 'doubleStarPerformer' | 'elitePerformer' | 'tlRank' | 'tlShareholder' | 'directorRank' | 'directorShareholder',
  value: boolean
): Promise<ApiResponse> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  try {
    const updateData: any = { [rankType]: value }
    if (rankType === 'tlRank') {
      updateData.tlRankEarnedAt = value ? new Date() : null
    } else if (rankType === 'directorRank') {
      updateData.directorRankEarnedAt = value ? new Date() : null
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    const rankLabel = 
      rankType === 'starPerformer' ? 'Star Performer' :
      rankType === 'doubleStarPerformer' ? 'Double Star Performer' :
      rankType === 'elitePerformer' ? 'Elite Performer' :
      rankType === 'tlRank' ? 'Team Leader Rank' :
      rankType === 'tlShareholder' ? 'TL 1% Shareholder' :
      rankType === 'directorRank' ? 'Director Rank' :
      'Director 1% Shareholder'

    await prisma.notification.create({
      data: {
        userId,
        title: value ? `Badge/Rank Awarded! 🏆` : `Badge/Rank Revoked ⚠️`,
        message: value 
          ? `Admin has manually awarded you the ${rankLabel} status.` 
          : `Admin has manually removed your ${rankLabel} status.`,
        type: value ? 'SUCCESS' : 'WARNING',
      },
    })

    revalidatePath('/admin/dashboard/users')
    revalidatePath('/dashboard')
    return { success: true, message: `Successfully updated ${rankLabel} status` }
  } catch (error) {
    console.error('Error toggling rank status:', error)
    return { success: false, message: 'Failed to toggle user rank status' }
  }
}

// ── Membership Plan Management ───────────────────────────────────────────────
export async function upsertMembershipPlanAction(data: any): Promise<ApiResponse> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  try {
    const { id, ...payload } = data

    const planData = {
      name: payload.name,
      price: Number(payload.price),
      durationDays: Number(payload.durationDays),
      depositBonus: Number(payload.depositBonus || 0),
      referralLevel1: Number(payload.referralLevel1 || 10.0),
      referralLevel2: Number(payload.referralLevel2 || 0.0),
      referralLevel3: Number(payload.referralLevel3 || 0.0),
      withdrawalTime: payload.withdrawalTime || '24-48 Hours',
      support: payload.support || 'Standard Email',
      features: Array.isArray(payload.features) ? payload.features : [],
      color: payload.color || '#3B82F6',
      isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
    }

    if (id) {
      await prisma.membershipPlan.update({
        where: { id },
        data: planData,
      })
    } else {
      await prisma.membershipPlan.create({
        data: planData,
      })
    }

    revalidatePath('/admin/dashboard/memberships')
    revalidatePath('/dashboard/membership')
    return { success: true, message: `Membership plan ${id ? 'updated' : 'created'} successfully` }
  } catch (error) {
    console.error('Error saving membership plan:', error)
    return { success: false, message: 'Failed to save membership plan' }
  }
}

export async function deleteMembershipPlanAction(id: string): Promise<ApiResponse> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  try {
    await prisma.membershipPlan.delete({
      where: { id },
    })

    revalidatePath('/admin/dashboard/memberships')
    revalidatePath('/dashboard/membership')
    return { success: true, message: 'Membership plan deleted successfully' }
  } catch (error) {
    console.error('Error deleting membership plan:', error)
    return { success: false, message: 'Failed to delete membership plan' }
  }
}

