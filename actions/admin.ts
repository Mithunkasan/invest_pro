'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getAdminSession, setSession, UserTokenPayload } from '@/lib/auth'
import type { ApiResponse } from '@/types'
import { syncWalletMainBalance, deductFromWallets } from './walletUtils'
import { BASIC_MEMBERSHIP_AMOUNT, ensureBasicMembershipPlan, getBasicMembershipExpiry } from '@/lib/basicMembership'

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

// ── Update User Details ───────────────────────────────────────────────────────
export async function updateUserAction(
  userId: string,
  data: {
    name?: string
    email?: string
    phone?: string
    profilePictureUrl?: string
    hasSeenProfilePicturePopup?: boolean
    dateOfBirth?: string | null
    addressLine?: string
    city?: string
    state?: string
    pinCode?: string
    profileCompleted?: boolean
    role?: 'USER' | 'ADMIN'
    status?: 'ACTIVE' | 'SUSPENDED' | 'PENDING'
    memberType?: 'FREE' | 'BASIC' | 'PREMIUM'
    referralCode?: string
    referredById?: string | null
    membershipPlanId?: string | null
    membershipPlanActivatedAt?: string | null
    membershipPlanExpiresAt?: string | null
    basicMembershipAmount?: number
    basicMembershipActivatedAt?: string | null
    basicMembershipExpiresAt?: string | null
    lastDailyYieldAt?: string | null
    starPerformer?: boolean
    doubleStarPerformer?: boolean
    elitePerformer?: boolean
    tlRank?: boolean
    tlRankEarnedAt?: string | null
    tlShareholder?: boolean
    directorRank?: boolean
    directorRankEarnedAt?: string | null
    directorShareholder?: boolean
  }
): Promise<ApiResponse> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return { success: false, message: 'User not found' }

    if (data.referredById) {
      const referrer = await prisma.user.findUnique({ where: { id: data.referredById } })
      if (!referrer) {
        return { success: false, message: `Referrer user with ID "${data.referredById}" does not exist.` }
      }
      if (referrer.id === userId) {
        return { success: false, message: 'A user cannot refer themselves.' }
      }
    }

    if (data.membershipPlanId) {
      const plan = await prisma.membershipPlan.findUnique({ where: { id: data.membershipPlanId } })
      if (!plan) {
        return { success: false, message: `Membership plan with ID "${data.membershipPlanId}" does not exist.` }
      }
    }

    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name.trim()
    if (data.email !== undefined) updateData.email = data.email.trim().toLowerCase()
    if (data.phone !== undefined) updateData.phone = data.phone ? data.phone.trim() : null
    if (data.profilePictureUrl !== undefined) updateData.profilePictureUrl = data.profilePictureUrl ? data.profilePictureUrl.trim() : null
    if (data.hasSeenProfilePicturePopup !== undefined) updateData.hasSeenProfilePicturePopup = Boolean(data.hasSeenProfilePicturePopup)
    if (data.dateOfBirth !== undefined) updateData.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null
    if (data.addressLine !== undefined) updateData.addressLine = data.addressLine ? data.addressLine.trim() : null
    if (data.city !== undefined) updateData.city = data.city ? data.city.trim() : null
    if (data.state !== undefined) updateData.state = data.state ? data.state.trim() : null
    if (data.pinCode !== undefined) updateData.pinCode = data.pinCode ? data.pinCode.trim() : null
    if (data.profileCompleted !== undefined) updateData.profileCompleted = Boolean(data.profileCompleted)
    if (data.role !== undefined) updateData.role = data.role as any
    if (data.status !== undefined) updateData.status = data.status as any
    if (data.memberType !== undefined) updateData.memberType = data.memberType as any
    if (data.referralCode !== undefined) updateData.referralCode = data.referralCode.trim()
    if (data.referredById !== undefined) updateData.referredById = data.referredById || null
    if (data.membershipPlanId !== undefined) {
      updateData.membershipPlanId = data.membershipPlanId || null
      if (user.membershipPlanId !== data.membershipPlanId) {
        await prisma.deposit.updateMany({
          where: { userId },
          data: {
            yieldDaysCredited: 0,
            lastYieldAt: null,
          },
        })
        if (data.membershipPlanId) {
          const plan = await prisma.membershipPlan.findUnique({ where: { id: data.membershipPlanId } })
          if (!plan) {
            return { success: false, message: `Membership plan not found.` }
          }

          // Deduct from Deposit Wallet balance
          if (plan.price > 0) {
            const wallet = await prisma.wallet.findUnique({ where: { userId } })
            if (!wallet) {
              return { success: false, message: 'User wallet not found' }
            }

            if (wallet.depositBalance < plan.price) {
              return {
                success: false,
                message: `Insufficient balance in Deposit Wallet (Available: ₹${wallet.depositBalance.toLocaleString('en-IN')}, Required: ₹${plan.price.toLocaleString('en-IN')})`
              }
            }

            await prisma.wallet.update({
              where: { userId },
              data: {
                depositBalance: { decrement: plan.price }
              }
            })

            // Create a completed transaction record
            await prisma.transaction.create({
              data: {
                userId,
                type: 'INVESTMENT',
                amount: plan.price,
                status: 'COMPLETED',
                description: `Activated ${plan.name} by Admin`,
                walletType: 'MAIN',
              }
            })

            // Sync main balance
            await syncWalletMainBalance(prisma, userId)
          }

          updateData.membershipPlanActivatedAt = new Date()
          const exp = new Date()
          exp.setDate(exp.getDate() + 1000)
          updateData.membershipPlanExpiresAt = exp
        } else {
          updateData.membershipPlanActivatedAt = null
          updateData.membershipPlanExpiresAt = null
        }
      }
    }
    if (data.membershipPlanActivatedAt !== undefined) updateData.membershipPlanActivatedAt = data.membershipPlanActivatedAt ? new Date(data.membershipPlanActivatedAt) : null
    if (data.membershipPlanExpiresAt !== undefined) updateData.membershipPlanExpiresAt = data.membershipPlanExpiresAt ? new Date(data.membershipPlanExpiresAt) : null
    if (data.basicMembershipAmount !== undefined) updateData.basicMembershipAmount = Number(data.basicMembershipAmount) || 0
    if (data.basicMembershipActivatedAt !== undefined) updateData.basicMembershipActivatedAt = data.basicMembershipActivatedAt ? new Date(data.basicMembershipActivatedAt) : null
    if (data.basicMembershipExpiresAt !== undefined) updateData.basicMembershipExpiresAt = data.basicMembershipExpiresAt ? new Date(data.basicMembershipExpiresAt) : null
    if (data.lastDailyYieldAt !== undefined) updateData.lastDailyYieldAt = data.lastDailyYieldAt ? new Date(data.lastDailyYieldAt) : null
    
    // Ranks/Badges
    if (data.starPerformer !== undefined) updateData.starPerformer = Boolean(data.starPerformer)
    if (data.doubleStarPerformer !== undefined) updateData.doubleStarPerformer = Boolean(data.doubleStarPerformer)
    if (data.elitePerformer !== undefined) updateData.elitePerformer = Boolean(data.elitePerformer)
    
    if (data.tlRank !== undefined) {
      updateData.tlRank = Boolean(data.tlRank)
      if (data.tlRank && !user.tlRank) {
        updateData.tlRankEarnedAt = new Date()
      } else if (!data.tlRank) {
        updateData.tlRankEarnedAt = null
      }
    }
    if (data.tlRankEarnedAt !== undefined) {
      updateData.tlRankEarnedAt = data.tlRankEarnedAt ? new Date(data.tlRankEarnedAt) : null
    }
    if (data.tlShareholder !== undefined) updateData.tlShareholder = Boolean(data.tlShareholder)
    
    if (data.directorRank !== undefined) {
      updateData.directorRank = Boolean(data.directorRank)
      if (data.directorRank && !user.directorRank) {
        updateData.directorRankEarnedAt = new Date()
      } else if (!data.directorRank) {
        updateData.directorRankEarnedAt = null
      }
    }
    if (data.directorRankEarnedAt !== undefined) {
      updateData.directorRankEarnedAt = data.directorRankEarnedAt ? new Date(data.directorRankEarnedAt) : null
    }
    if (data.directorShareholder !== undefined) updateData.directorShareholder = Boolean(data.directorShareholder)

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    revalidatePath('/admin/dashboard/users')
    revalidatePath('/admin/dashboard/memberships')
    revalidatePath('/dashboard')
    return { success: true, message: 'User details updated successfully' }
  } catch (error: any) {
    console.error('Error updating user:', error)
    if (error?.code === 'P2002') {
      return { success: false, message: 'Email, phone, or referral code already in use by another user' }
    }
    return { success: false, message: 'Failed to update user details' }
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
        // Update user wallet with total increment (deposit + yield bonus) - goes to Deposit Wallet
        prisma.wallet.update({
          where: { userId: deposit.userId },
          data: { depositBalance: { increment: totalIncrement } },
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
            walletType: 'MAIN',
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
              walletType: 'MAIN',
            },
          })
        )
      }

      await prisma.$transaction(dbOps)

      // Sync main balance for user who deposited
      await syncWalletMainBalance(prisma, deposit.userId)
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
      await prisma.$transaction([
        prisma.withdrawal.update({
          where: { id: withdrawalId },
          data: { status: 'APPROVED', approvedById: admin.id, processedAt: new Date(), remarks },
        }),
        prisma.notification.create({
          data: {
            userId: withdrawal.userId,
            title: 'Withdrawal Approved ✅',
            message: `Your withdrawal of ₹${withdrawal.amount.toLocaleString()} has been processed.`,
            type: 'SUCCESS',
          },
        })
      ])
    } else {
      const balanceField = withdrawal.walletType === 'MAIN' ? 'rewardBalance'
        : withdrawal.walletType === 'BONUS' ? 'bonusBalance' : 'referralBalance'

      await prisma.$transaction([
        // Reject withdrawal
        prisma.withdrawal.update({
          where: { id: withdrawalId },
          data: { status: 'REJECTED', approvedById: admin.id, remarks },
        }),
        // Refund to wallet
        prisma.wallet.update({
          where: { userId: withdrawal.userId },
          data: { [balanceField]: { increment: withdrawal.amount } },
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
      await syncWalletMainBalance(prisma, withdrawal.userId)
    }

    revalidatePath('/admin/dashboard/withdrawals')
    revalidatePath('/admin/dashboard')
    return { success: true, message: `Withdrawal ${action.toLowerCase()}d successfully` }
  } catch (error) {
    return { success: false, message: 'Failed to process withdrawal' }
  }
}

// ── KYC Management ────────────────────────────────────────────────────────────
async function handleKYCLegacy(kycId: string, action: 'APPROVED' | 'REJECTED', remarks?: string): Promise<ApiResponse> {
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

void handleKYCLegacy

export async function handleKYC(kycId: string, action: 'APPROVED' | 'REJECTED', remarks?: string): Promise<ApiResponse> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  try {
    const kyc = await prisma.kYC.findUnique({
      where: { id: kycId },
      include: { user: true },
    })
    if (!kyc) return { success: false, message: 'KYC request not found' }

    const reviewedAt = new Date()
    const shouldActivateBasic = action === 'APPROVED' && kyc.user.memberType === 'FREE'
    const basicPlan = shouldActivateBasic ? await ensureBasicMembershipPlan() : null

    await prisma.$transaction(async (tx) => {
      await tx.kYC.update({
        where: { id: kycId },
        data: { status: action, reviewedById: admin.id, reviewedAt, remarks },
      })

      if (shouldActivateBasic && basicPlan) {
        await tx.user.update({
          where: { id: kyc.userId },
          data: {
            memberType: 'BASIC',
            membershipPlanId: basicPlan.id,
            basicMembershipAmount: BASIC_MEMBERSHIP_AMOUNT,
            basicMembershipActivatedAt: reviewedAt,
            basicMembershipExpiresAt: getBasicMembershipExpiry(reviewedAt),
            membershipPlanActivatedAt: reviewedAt,
            membershipPlanExpiresAt: getBasicMembershipExpiry(reviewedAt),
            lastDailyYieldAt: reviewedAt,
          },
        })

        await tx.transaction.create({
          data: {
            userId: kyc.userId,
            type: 'INVESTMENT',
            amount: BASIC_MEMBERSHIP_AMOUNT,
            status: 'COMPLETED',
            description: 'Basic Membership activated after KYC approval',
            walletType: 'MAIN',
          },
        })
      }

      await tx.notification.create({
        data: {
          userId: kyc.userId,
          title: action === 'APPROVED' ? 'KYC Verified' : 'KYC Rejected',
          message: action === 'APPROVED'
            ? shouldActivateBasic
              ? 'Your KYC is approved. Basic Membership is now active with a Rs. 2,500 deposit amount.'
              : 'Your identity verification is complete.'
            : `Your KYC was rejected. ${remarks || ''}`,
          type: action === 'APPROVED' ? 'SUCCESS' : 'ERROR',
        },
      })
    })

    revalidatePath('/admin/dashboard/kyc')
    revalidatePath('/admin/dashboard')
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/membership')
    return { success: true, message: `KYC ${action.toLowerCase()} successfully` }
  } catch (error) {
    console.error('KYC approval error:', error)
    return { success: false, message: 'Failed to process KYC' }
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
          withdrawalDeductionPercent: 20.0,
          userPayDeductionPercent: 0.0,
          basicDailyYieldPercent: 0.2,
          heroMembers: '25,689+',
          heroActive: '8,932+',
          heroPaid: '₹12.45 Cr+',
          heroRate: '99.8%',
          giftDepositAmount: 0,
        }
      })
    }

    // Fetch and sync Basic Membership plan's depositBonus
    let basicPlan = await prisma.membershipPlan.findUnique({
      where: { name: 'Basic Membership' }
    })
    if (!basicPlan) {
      basicPlan = await ensureBasicMembershipPlan()
    }
    if (basicPlan) {
      settings.basicDailyYieldPercent = basicPlan.depositBonus
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
    const newBasicYield = Number(data.basicDailyYieldPercent ?? 0.2)

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
        withdrawalDeductionPercent: Number(data.withdrawalDeductionPercent ?? 20.0),
        userPayDeductionPercent: Number(data.userPayDeductionPercent ?? 0.0),
        basicDailyYieldPercent: newBasicYield,
        heroMembers: String(data.heroMembers),
        heroActive: String(data.heroActive),
        heroPaid: String(data.heroPaid),
        heroRate: String(data.heroRate),
        giftDepositAmount: Number(data.giftDepositAmount ?? 0),
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
        withdrawalDeductionPercent: Number(data.withdrawalDeductionPercent ?? 20.0),
        userPayDeductionPercent: Number(data.userPayDeductionPercent ?? 0.0),
        basicDailyYieldPercent: newBasicYield,
        heroMembers: String(data.heroMembers),
        heroActive: String(data.heroActive),
        heroPaid: String(data.heroPaid),
        heroRate: String(data.heroRate),
        giftDepositAmount: Number(data.giftDepositAmount ?? 0),
      }
    })

    // Sync corresponding membership plan configuration's depositBonus
    let basicPlan = await prisma.membershipPlan.findUnique({
      where: { name: 'Basic Membership' }
    })
    if (!basicPlan) {
      basicPlan = await ensureBasicMembershipPlan()
    }
    await prisma.membershipPlan.update({
      where: { id: basicPlan.id },
      data: { depositBonus: newBasicYield }
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

    if (walletType === 'MAIN') {
      if (operation === 'SUBTRACT' && wallet.mainBalance < amount) {
        return { success: false, message: `Insufficient balance in MAIN wallet (Current: ₹${wallet.mainBalance})` }
      }

      if (operation === 'ADD') {
        await prisma.$transaction([
          prisma.wallet.update({
            where: { userId },
            data: {
              bonusBalance: { increment: amount },
              totalEarned: { increment: amount },
            },
          }),
          prisma.transaction.create({
            data: {
              userId,
              type: 'BONUS',
              amount,
              status: 'COMPLETED',
              description: `Admin manual addition of ₹${amount} to MAIN wallet`,
              walletType: 'BONUS',
            },
          }),
          prisma.notification.create({
            data: {
              userId,
              title: `Wallet Adjusted 💼`,
              message: `Admin has manually added ₹${amount.toLocaleString('en-IN')} to your Main wallet.`,
              type: 'SUCCESS',
            },
          }),
        ])
        await syncWalletMainBalance(prisma, userId)
      } else {
        await prisma.$transaction(async (tx) => {
          await deductFromWallets(tx, userId, amount)
          await tx.transaction.create({
            data: {
              userId,
              type: 'WITHDRAWAL',
              amount,
              status: 'COMPLETED',
              description: `Admin manual deduction of ₹${amount} from MAIN wallet`,
              walletType: 'MAIN',
            },
          })
          await tx.notification.create({
            data: {
              userId,
              title: `Wallet Adjusted 💼`,
              message: `Admin has manually deducted ₹${amount.toLocaleString('en-IN')} from your Main wallet.`,
              type: 'WARNING',
            },
          })
        })
      }
    } else {
      let field: keyof typeof wallet
      let txType: any = 'BONUS'

      switch (walletType) {
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
          data: {
            [field]: { increment: delta },
            // Only credit totalEarned on ADD (never on subtract)
            ...(operation === 'ADD' ? { totalEarned: { increment: amount } } : {}),
          },
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
      await syncWalletMainBalance(prisma, userId)
    }

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

export async function sendAdminBonusAction(
  userEmail: string,
  amount: number,
  walletName: string,
  remark: string
): Promise<ApiResponse> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  if (!userEmail || isNaN(amount) || amount <= 0 || !walletName || !remark) {
    return { success: false, message: 'Invalid inputs. All fields are required.' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail.trim() },
      include: { wallet: true }
    })

    if (!user) return { success: false, message: 'User not found with email: ' + userEmail }

    let field: 'bonusBalance' | 'referralBalance' | 'rewardBalance' | 'levelBalance' | 'shareBalance' | 'depositBalance'
    let walletType: 'MAIN' | 'BONUS' | 'REFERRAL' | 'LEVEL' | 'REWARD' | 'SHARE'
    // depositBalance is not earnings — do not increment totalEarned for it
    let isEarnings = true

    switch (walletName) {
      case 'Main Wallet':
      case 'Deposit Wallet':
        field = 'depositBalance' // Deposit Wallet — not earnings income
        walletType = 'MAIN'
        isEarnings = false
        break
      case 'Referral Wallet':
        field = 'referralBalance'
        walletType = 'REFERRAL'
        break
      case 'Reward Wallet':
        field = 'rewardBalance'
        walletType = 'REWARD'
        break
      case 'Game Wallet':
        field = 'rewardBalance'
        walletType = 'REWARD'
        break
      case 'Bonus Wallet':
        field = 'bonusBalance'
        walletType = 'BONUS'
        break
      case 'Share Wallet':
        field = 'shareBalance'
        walletType = 'SHARE'
        break
      case 'Level Wallet':
      case 'Level Income Wallet':
        field = 'levelBalance'
        walletType = 'LEVEL'
        break
      default:
        return { success: false, message: 'Invalid wallet selection: ' + walletName }
    }

    const metadata = {
      sentBy: admin.name,
      userEmail: user.email,
      walletName: walletName,
      remark: remark,
      freeRestricted: false
    }

    await prisma.$transaction(async (tx) => {
      // Ensure wallet exists
      let wallet = user.wallet
      if (!wallet) {
        wallet = await tx.wallet.create({
          data: { userId: user.id }
        })
      }

      // Increment balance (and totalEarned if this is an earnings wallet, not deposit)
      await tx.wallet.update({
        where: { userId: user.id },
        data: {
          [field]: { increment: amount },
          ...(isEarnings ? { totalEarned: { increment: amount } } : {}),
        }
      })

      // Create transaction log
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: 'BONUS',
          amount: amount,
          status: 'COMPLETED',
          walletType: walletType,
          description: remark,
          reference: 'ADMIN_BONUS:' + JSON.stringify(metadata)
        }
      })

      // Create notification
      await tx.notification.create({
        data: {
          userId: user.id,
          title: 'Bonus Received! 🎁',
          message: `You have received a bonus of ₹${amount.toLocaleString('en-IN')} to your ${walletType === 'MAIN' ? 'Main' : walletType.toLowerCase()} wallet. Remark: ${remark}`,
          type: 'SUCCESS'
        }
      })

      // Sync Main balance
      await syncWalletMainBalance(tx, user.id)
    })

    if (walletType === 'REFERRAL') {
      try {
        const { checkAndApplyPerformanceBadges, checkAndApplyTLRank } = require('./rules')
        await checkAndApplyPerformanceBadges(user.id)
        await checkAndApplyTLRank(user.id)
      } catch (err) {
        console.error('Error applying rules for referral bonus:', err)
      }
    }

    revalidatePath('/admin/dashboard/bonus')
    revalidatePath('/dashboard/wallet')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: `Successfully sent ₹${amount.toLocaleString('en-IN')} bonus to ${user.name} (${user.email}).`
    }
  } catch (error: any) {
    console.error('Error sending admin bonus:', error)
    return { success: false, message: error.message || 'Failed to send admin bonus' }
  }
}

export async function assignOfflineTaskAction(formData: FormData): Promise<ApiResponse> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  const userId = String(formData.get('userId') || '')
  const title = String(formData.get('title') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const dueAtValue = String(formData.get('dueAt') || '')
  const dueAt = dueAtValue ? new Date(dueAtValue) : null

  if (!userId || !title || !description || !dueAt || Number.isNaN(dueAt.getTime()) || dueAt <= new Date()) {
    return { success: false, message: 'Please enter a member, task details, and a future due time.' }
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.offlineTask.create({
        data: { userId, title, description, dueAt },
      })
      await tx.notification.create({
        data: {
          userId,
          title: 'New Offline Task Assigned',
          message: `Admin assigned "${title}". Complete it before ${dueAt.toLocaleString('en-IN')}.`,
          type: 'INFO',
          link: '/dashboard/tasks',
        },
      })
    })

    revalidatePath('/admin/dashboard/tasks')
    revalidatePath('/dashboard/tasks')
    return { success: true, message: 'Task assigned successfully.' }
  } catch (error) {
    console.error('Task assignment error:', error)
    return { success: false, message: 'Failed to assign task.' }
  }
}

export async function upgradeUserToPremiumAction(userId: string): Promise<ApiResponse> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return { success: false, message: 'User not found' }
    if (user.memberType === 'PREMIUM') return { success: false, message: 'User is already Premium.' }

    const premiumPlan = await prisma.membershipPlan.findFirst({
      where: { isActive: true, price: { gt: BASIC_MEMBERSHIP_AMOUNT } },
      orderBy: { price: 'asc' },
    })

    const activatedAt = new Date()
    const expiresAt = new Date(activatedAt)
    expiresAt.setDate(expiresAt.getDate() + 1000)

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          memberType: 'PREMIUM',
          membershipPlanId: premiumPlan?.id || user.membershipPlanId,
          membershipPlanActivatedAt: activatedAt,
          membershipPlanExpiresAt: expiresAt,
        },
      })
      await tx.notification.create({
        data: {
          userId,
          title: 'Premium Membership Activated',
          message: 'Admin has upgraded your account from Basic Membership to Premium Membership.',
          type: 'SUCCESS',
        },
      })
    })

    revalidatePath('/admin/dashboard/users')
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/membership')
    return { success: true, message: 'User upgraded to Premium Membership.' }
  } catch (error) {
    console.error('Premium upgrade error:', error)
    return { success: false, message: 'Failed to upgrade user.' }
  }
}




// ── Membership Upgrade Requests ──────────────────────────────────────────────
export async function getMembershipUpgradeRequestsAction() {
  const admin = await getAdminSession()
  if (!admin) return []
  return prisma.membershipUpgradeRequest.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      plan: { select: { id: true, name: true, price: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function processMembershipUpgradeAction(
  requestId: string,
  action: 'APPROVED' | 'REJECTED',
  remarks?: string
): Promise<ApiResponse> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  try {
    const request = await prisma.membershipUpgradeRequest.findUnique({
      where: { id: requestId },
      include: { user: true, plan: true },
    })

    if (!request) return { success: false, message: 'Upgrade request not found' }
    if (request.status !== 'PENDING') return { success: false, message: 'Request has already been processed' }

    if (action === 'APPROVED') {
      const activatedAt = new Date()
      const expiresAt = new Date(activatedAt)
      expiresAt.setDate(expiresAt.getDate() + 1000)

      await prisma.$transaction(async (tx) => {
        // Update request status
        await tx.membershipUpgradeRequest.update({
          where: { id: requestId },
          data: { status: 'APPROVED', approvedById: admin.id, remarks },
        })

        // Determine memberType based on plan name
        let targetMemberType: 'FREE' | 'BASIC' | 'PREMIUM' = 'PREMIUM'
        if (request.plan.name === 'Free Membership') {
          targetMemberType = 'FREE'
        } else if (request.plan.name === 'Basic Membership') {
          targetMemberType = 'BASIC'
        }

        // Update user's plan details
        await tx.user.update({
          where: { id: request.userId },
          data: {
            membershipPlanId: request.planId,
            memberType: targetMemberType,
            membershipPlanActivatedAt: activatedAt,
            membershipPlanExpiresAt: expiresAt,
          },
        })

        // Reset yieldDaysCredited and lastYieldAt for user's deposits so the new plan yield starts fresh
        await tx.deposit.updateMany({
          where: { userId: request.userId },
          data: {
            yieldDaysCredited: 0,
            lastYieldAt: null,
          },
        })

        // Find the transaction that was created when requesting, and update its status to COMPLETED
        const pendingTx = await tx.transaction.findFirst({
          where: {
            userId: request.userId,
            type: 'INVESTMENT',
            amount: request.plan.price,
            status: 'PENDING',
          },
          orderBy: { createdAt: 'desc' },
        })

        if (pendingTx) {
          await tx.transaction.update({
            where: { id: pendingTx.id },
            data: { status: 'COMPLETED' },
          })
        } else {
          // If no pending transaction found, create a completed one
          if (request.plan.price > 0) {
            await tx.transaction.create({
              data: {
                userId: request.userId,
                type: 'INVESTMENT',
                amount: request.plan.price,
                status: 'COMPLETED',
                description: `Upgraded to ${request.plan.name}`,
                walletType: 'MAIN',
              },
            })
          }
        }

        // Send success notification to user
        await tx.notification.create({
          data: {
            userId: request.userId,
            title: `Membership Upgraded! 👑`,
            message: `Your request to upgrade to ${request.plan.name} has been approved by the admin.`,
            type: 'SUCCESS',
          },
        })
      })

      // Trigger referral commission if membership is a paid upgrade
      if (request.plan.price > 0) {
        const { distributeReferralAndLevelCommissions } = require('./rules')
        await distributeReferralAndLevelCommissions(request.userId, request.plan.price, request.plan.id)
      }

      revalidatePath('/admin/dashboard/memberships')
      revalidatePath('/dashboard/membership')
      return { success: true, message: `Membership upgrade to ${request.plan.name} approved successfully!` }
    } else {
      // REJECTED
      await prisma.$transaction(async (tx) => {
        // Update request status
        await tx.membershipUpgradeRequest.update({
          where: { id: requestId },
          data: { status: 'REJECTED', approvedById: admin.id, remarks },
        })

        // Refund the amount back to user's deposit wallet if price > 0
        if (request.plan.price > 0) {
          await tx.wallet.update({
            where: { userId: request.userId },
            data: { depositBalance: { increment: request.plan.price } },
          })

          // Update transaction status to FAILED or create a REFUND transaction
          const pendingTx = await tx.transaction.findFirst({
            where: {
              userId: request.userId,
              type: 'INVESTMENT',
              amount: request.plan.price,
              status: 'PENDING',
            },
            orderBy: { createdAt: 'desc' },
          })

          if (pendingTx) {
            await tx.transaction.update({
              where: { id: pendingTx.id },
              data: { status: 'FAILED', description: `Upgrade to ${request.plan.name} Rejected: ${remarks || 'No remarks'}` },
            })
          }
        }

        // Send failure notification to user
        await tx.notification.create({
          data: {
            userId: request.userId,
            title: `Upgrade Request Rejected ❌`,
            message: `Your request to upgrade to ${request.plan.name} was rejected by the admin. ${remarks ? `Reason: ${remarks}` : ''}`,
            type: 'ERROR',
          },
        })
      })

      revalidatePath('/admin/dashboard/memberships')
      revalidatePath('/dashboard/membership')
      return { success: true, message: `Membership upgrade request rejected successfully.` }
    }
  } catch (error: any) {
    console.error('Error processing membership upgrade:', error)
    return { success: false, message: error.message || 'Failed to process upgrade request' }
  }
}

// ── Mark All Admin Platform Notifications As Read ─────────────────────────────────
export async function markAllAdminNotificationsAsReadAction(): Promise<ApiResponse> {
  const session = await getAdminSession()
  if (!session) return { success: false, message: 'Unauthorized' }

  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true }
    })
    revalidatePath('/admin/dashboard')
    revalidatePath('/admin/dashboard/notifications')
    return { success: true, message: 'All platform notifications marked as read.' }
  } catch (e: any) {
    return { success: false, message: e.message || 'Failed to mark notifications as read.' }
  }
}

// ── Secure User Impersonation / Login-as-User ────────────────────────────────────
export async function impersonateUserAction(userId: string): Promise<ApiResponse<{ redirectUrl: string }>> {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    if (!user) return { success: false, message: 'User not found' }

    // Sign a user token payload
    const payload: UserTokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      type: 'user',
      memberType: user.memberType,
    }

    await setSession(payload) // Sets the 'investpro_token' cookie

    return {
      success: true,
      message: 'Impersonation session created successfully.',
      data: { redirectUrl: '/dashboard' }
    }
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to impersonate user' }
  }
}
