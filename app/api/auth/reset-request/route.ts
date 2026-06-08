import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ success: false, message: 'This email is not registered.' }, { status: 404 })
    }

    // Check if there's already a pending request
    const existingRequest = await prisma.passwordResetRequest.findFirst({
      where: { email, status: 'PENDING' },
    })

    if (existingRequest) {
      return NextResponse.json({ success: false, message: 'A password reset request is already pending for this email.' }, { status: 429 })
    }

    await prisma.passwordResetRequest.create({
      data: { email },
    })

    return NextResponse.json({ success: true, message: 'Password reset request sent to admin.' })
  } catch (error) {
    console.error('Error creating password reset request:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
