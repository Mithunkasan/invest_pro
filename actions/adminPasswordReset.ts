'use server'

import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { hashPassword } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { sendPasswordResetAdminEmail } from '@/lib/mail'

export async function resolvePasswordResetRequestAction(requestId: string, newPasswordRaw: string) {
  const admin = await getAdminSession()
  if (!admin) return { success: false, message: 'Unauthorized' }

  try {
    const request = await prisma.passwordResetRequest.findUnique({
      where: { id: requestId }
    })
    
    if (!request || request.status !== 'PENDING') {
      return { success: false, message: 'Request not found or already resolved' }
    }

    const user = await prisma.user.findUnique({
      where: { email: request.email }
    })

    if (!user) {
      return { success: false, message: 'User not found' }
    }

    const passwordHash = await hashPassword(newPasswordRaw)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash }
      }),
      prisma.passwordResetRequest.update({
        where: { id: requestId },
        data: { status: 'RESOLVED' }
      }),
      prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Password Reset',
          message: `Your password has been reset by the admin. Your new password is: ${newPasswordRaw}`,
          type: 'INFO'
        }
      })
    ])

    // Try to send email, but don't fail the whole action if it fails
    try {
      await sendPasswordResetAdminEmail(user.email, newPasswordRaw)
    } catch (e) {
      console.error('Failed to send password reset email:', e)
    }

    revalidatePath('/admin/dashboard/password-resets')
    return { success: true, message: 'Password updated and user notified successfully.' }
  } catch (error) {
    console.error('Error resolving password reset request:', error)
    return { success: false, message: 'Internal server error' }
  }
}
