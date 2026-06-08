import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return NextResponse.json({ success: false, message: 'Email and OTP are required' }, { status: 400 })
    }

    // Find the latest OTP for this email
    const otpRecord = await prisma.otp.findFirst({
      where: {
        email,
        otp,
        verified: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!otpRecord) {
      return NextResponse.json({ success: false, message: 'Invalid OTP' }, { status: 400 })
    }

    // Check expiry
    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json({ success: false, message: 'OTP has expired' }, { status: 400 })
    }

    // Mark as verified
    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    })

    return NextResponse.json({ success: true, message: 'OTP verified successfully' })
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
