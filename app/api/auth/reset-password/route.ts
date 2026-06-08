import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword, confirmPassword } = await req.json()

    if (!email || !otp || !newPassword || !confirmPassword) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 })
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ success: false, message: "Passwords don't match" }, { status: 400 })
    }

    // Find the latest VERIFIED OTP for this email
    const otpRecord = await prisma.otp.findFirst({
      where: {
        email,
        otp,
        verified: true, // MUST be verified
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!otpRecord) {
      return NextResponse.json({ success: false, message: 'Invalid or unverified OTP' }, { status: 400 })
    }

    // Check expiry
    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json({ success: false, message: 'OTP has expired' }, { status: 400 })
    }

    // Hash the new password
    const passwordHash = await hashPassword(newPassword)

    // Update the user's password
    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    })

    // Invalidate the OTP so it can't be used again
    await prisma.otp.delete({
      where: { id: otpRecord.id },
    })

    return NextResponse.json({ success: true, message: 'Password has been reset successfully' })
  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
