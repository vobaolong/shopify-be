import { Request } from 'express'

export interface AuthenticatedRequest extends Request {
  user?: any
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
    userId: string
    storeId?: string
    emailCode?: string
  }
}

export interface EmailMessage {
  from: string | undefined
  to: string
  subject: string
  html: string
}
