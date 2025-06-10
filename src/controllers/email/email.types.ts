import { Request } from 'express'

export interface AuthenticatedRequest extends Request {
  msg?: {
    email?: string
    phone?: string
    name?: string
    title?: string
    text?: string
    code?: string
  }
}

export interface EmailParamRequest extends Request {
  params: {
    userId?: string
    storeId?: string
  }
}

export interface EmailMessage {
  from: string
  to: string
  subject: string
  html: string
}

export interface EmailResponse {
  success: () => void
  error: (error: any) => void
}
