import nodemailer from 'nodemailer'
import { EmailMessage, EmailResponse } from './email.types'
import { Response, NextFunction } from 'express'

export const getClientUrl = (): string => {
  return `http://localhost:5173`
}

export const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_EMAIL_PASSWORD
  }
})

export const createEmailTemplate = (
  title: string,
  name: string,
  content: string,
  buttonText: string | null = null,
  buttonUrl: string | null = null
): string => {
  const buttonHtml =
    buttonText && buttonUrl
      ? `<button style="background-color:#0d6efd; border:none; border-radius:4px; padding:0;">
        <a style="color:#fff; text-decoration:none; font-size:16px; padding: 16px 32px; display: inline-block;"
           href='${buttonUrl}'>
          ${buttonText}
        </a>
      </button>`
      : ''
  return `<div style="line-height: 2.5">
    <h1 style="color: #2266cc"><img src="https://i.imgur.com/uw3oLis.png" alt="Store Image" style="max-width: 4%; height: auto; margin-right: 10px" />${title}</h1>
    <hr/>
    <b>Xin chào ${name},</b>
    <p>Cảm ơn bạn đã lựa chọn ShopBase.</p>
    ${content}
    ${buttonHtml}
    ${
      !buttonHtml
        ? `
    <p>Trân trọng,</p>
    <i>Đội ngũ hỗ trợ khách hàng</i>
    <p>Email: <a href="mailto:baolong01.dev@gmail.com">baolong01.dev@gmail.com</a></p>`
        : ''
    }
  </div>`
}

export const sendEmail = (
  to: string,
  subject: string,
  html: string
): Promise<any> => {
  const message: EmailMessage = {
    from: process.env.ADMIN_EMAIL!,
    to,
    subject: `ShopBase E-commerce - ${subject}`,
    html
  }
  return transport.sendMail(message)
}

export const handleEmailResponse = (
  res?: Response,
  next?: NextFunction
): EmailResponse => {
  return {
    success: () => {
      console.log('Send email successfully')
      if (next) {
        next()
      } else if (res) {
        res.status(200).json({ success: 'Send email successfully' })
      }
    },
    error: (error) => {
      console.log('Send email failed', error)
      if (res) {
        res.status(500).json({ error: 'Send email failed' })
      }
    }
  }
}
