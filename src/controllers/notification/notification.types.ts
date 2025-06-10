import { Request } from 'express'

export interface NotificationRequest extends Request {
  user?: any
  store?: any
  params: {
    userId?: string
  }
}

export type NotificationResult = [boolean, string]
