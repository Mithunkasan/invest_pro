'use server'

import { sendContactFormEmail } from '@/lib/mail'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
})

export async function submitContactFormAction(formData: FormData) {
  try {
    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    }

    const validated = contactSchema.safeParse(rawData)
    if (!validated.success) {
      const fieldErrors = validated.error.flatten().fieldErrors
      const errorMsg = Object.values(fieldErrors).flat().join(', ')
      return { success: false, message: errorMsg || 'Validation failed' }
    }

    await sendContactFormEmail(validated.data)

    return { success: true, message: 'Your message has been sent successfully. We will get back to you soon.' }
  } catch (error: any) {
    console.error('Failed to submit contact form:', error)
    return { success: false, message: error.message || 'An error occurred while sending your message. Please try again later.' }
  }
}
