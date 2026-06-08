import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const defaultFrom = `"${process.env.MAIL_FROM_NAME || 'InvestPro'}" <${process.env.MAIL_FROM_ADDRESS || process.env.SMTP_USER}>`

export async function sendOtpEmail(to: string, otp: string) {
  const expiryMinutes = process.env.OTP_EXPIRY_MINUTES || '10'

  const mailOptions = {
    from: defaultFrom,
    to,
    subject: 'Your Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #3b82f6;">Password Reset Request</h2>
        <p>You have requested to reset your password. Here is your One-Time Password (OTP):</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <strong style="font-size: 24px; letter-spacing: 5px; color: #1f2937;">${otp}</strong>
        </div>
        <p style="color: #ef4444; font-size: 14px;">This OTP is valid for ${expiryMinutes} minutes. Do not share it with anyone.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <br />
        <p>Best regards,<br/>The ${process.env.MAIL_FROM_NAME || 'InvestPro'} Team</p>
      </div>
    `,
  }

  return transporter.sendMail(mailOptions)
}

export async function sendWelcomeEmail(to: string, name: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  const mailOptions = {
    from: defaultFrom,
    to,
    subject: 'Welcome to InvestPro! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #3b82f6;">Welcome to InvestPro!</h2>
        <p>Hi ${name},</p>
        <p>Your registration was successful. We are thrilled to have you on board!</p>
        <p>You can now log in to your account and start your investment journey.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/login" style="background-color: #3b82f6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login Now</a>
        </div>
        <p>If you have any questions, feel free to reply to this email.</p>
        <br />
        <p>Best regards,<br/>The ${process.env.MAIL_FROM_NAME || 'InvestPro'} Team</p>
      </div>
    `,
  }

  return transporter.sendMail(mailOptions)
}

export async function sendPasswordResetAdminEmail(to: string, newPasswordRaw: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  const mailOptions = {
    from: defaultFrom,
    to,
    subject: 'Your Password Has Been Reset',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #3b82f6;">Password Reset</h2>
        <p>Your password reset request has been processed by the administrator.</p>
        <p>Your new password is:</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <strong style="font-size: 24px; letter-spacing: 2px; color: #1f2937;">${newPasswordRaw}</strong>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/login" style="background-color: #3b82f6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login Now</a>
        </div>
        <p>For your security, you can change this password after you log in.</p>
        <br />
        <p>Best regards,<br/>The ${process.env.MAIL_FROM_NAME || 'InvestPro'} Team</p>
      </div>
    `,
  }

  return transporter.sendMail(mailOptions)
}
