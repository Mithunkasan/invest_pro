'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession, getAdminSession } from '@/lib/auth'
import type { ApiResponse } from '@/types'

// ── USER ACTIONS ─────────────────────────────────────────────────────────────

export async function createTicketAction(formData: FormData): Promise<ApiResponse> {
  const session = await getSession()
  if (!session) return { success: false, message: 'Unauthorized' }

  const subject = formData.get('subject')?.toString()
  const category = formData.get('category')?.toString() as any
  const priority = formData.get('priority')?.toString() as any
  const description = formData.get('description')?.toString()
  const attachment = formData.get('attachment')?.toString()

  if (!subject || !category || !priority || !description) {
    return { success: false, message: 'All fields are required' }
  }

  // Generate unique Ticket ID
  const count = await prisma.ticket.count()
  const ticketId = `TKT-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`

  try {
    const ticket = await prisma.ticket.create({
      data: {
        ticketId,
        userId: session.id,
        subject,
        category,
        priority,
        description,
        attachment,
        status: 'OPEN'
      }
    })

    // Get current open tickets count
    const pendingCount = await prisma.ticket.count({
      where: { status: 'OPEN' }
    })

    // Create Notification
    await prisma.notification.create({
      data: {
        userId: session.id,
        title: `New Support Ticket (Pending: ${pendingCount})`,
        message: `Support ticket "${subject}" has been raised. Total open tickets: ${pendingCount}.`,
        type: 'INFO',
      },
    })

    revalidatePath('/dashboard/tickets')
    return { success: true, message: 'Ticket raised successfully' }
  } catch (error) {
    console.error(error)
    return { success: false, message: 'Failed to raise ticket' }
  }
}

export async function getUserTickets() {
  const session = await getSession()
  if (!session) return []

  return prisma.ticket.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getTicketDetails(id: string) {
  const session = await getSession()
  if (!session) return null

  return prisma.ticket.findFirst({
    where: { id, userId: session.id },
    include: {
      messages: { orderBy: { createdAt: 'asc' } }
    }
  })
}

export async function replyToTicketUserAction(ticketId: string, message: string): Promise<ApiResponse> {
  const session = await getSession()
  if (!session) return { success: false, message: 'Unauthorized' }

  if (!message.trim()) return { success: false, message: 'Message is required' }

  const ticket = await prisma.ticket.findFirst({ where: { id: ticketId, userId: session.id } })
  if (!ticket) return { success: false, message: 'Ticket not found' }

  try {
    await prisma.ticketMessage.create({
      data: {
        ticketId,
        senderId: session.id,
        senderRole: 'USER',
        message
      }
    })

    revalidatePath(`/dashboard/tickets/${ticketId}`)
    return { success: true, message: 'Reply sent' }
  } catch (error) {
    return { success: false, message: 'Failed to send reply' }
  }
}

// ── ADMIN ACTIONS ────────────────────────────────────────────────────────────

export async function getAllTickets() {
  const session = await getAdminSession()
  if (!session) return []

  return prisma.ticket.findMany({
    include: {
      user: { select: { name: true, email: true, phone: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getAdminTicketDetails(id: string) {
  const session = await getAdminSession()
  if (!session) return null

  return prisma.ticket.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      messages: { orderBy: { createdAt: 'asc' } }
    }
  })
}

export async function updateTicketStatusAction(id: string, status: any): Promise<ApiResponse> {
  const session = await getAdminSession()
  if (!session) return { success: false, message: 'Unauthorized' }

  try {
    const ticket = await prisma.ticket.update({
      where: { id },
      data: { status }
    })

    // Notify user
    await prisma.notification.create({
      data: {
        userId: ticket.userId,
        title: 'Ticket Status Updated',
        message: `Your ticket ${ticket.ticketId} status has been updated to ${status}.`,
        type: 'INFO'
      }
    })

    revalidatePath('/admin/dashboard/tickets')
    revalidatePath(`/admin/dashboard/tickets/${id}`)
    return { success: true, message: 'Status updated' }
  } catch (error) {
    return { success: false, message: 'Failed to update status' }
  }
}

export async function replyToTicketAdminAction(ticketId: string, message: string): Promise<ApiResponse> {
  const session = await getAdminSession()
  if (!session) return { success: false, message: 'Unauthorized' }

  if (!message.trim()) return { success: false, message: 'Message is required' }

  try {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } })
    if (!ticket) return { success: false, message: 'Ticket not found' }

    await prisma.ticketMessage.create({
      data: {
        ticketId,
        senderId: session.id,
        senderRole: 'ADMIN',
        message
      }
    })

    // Notify user
    await prisma.notification.create({
      data: {
        userId: ticket.userId,
        title: 'New Reply on Ticket',
        message: `An admin has replied to your ticket ${ticket.ticketId}.`,
        type: 'INFO',
        link: `/dashboard/tickets/${ticketId}`
      }
    })

    revalidatePath(`/admin/dashboard/tickets/${ticketId}`)
    return { success: true, message: 'Reply sent' }
  } catch (error) {
    return { success: false, message: 'Failed to send reply' }
  }
}
