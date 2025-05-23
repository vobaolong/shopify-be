import { Request } from 'express'

export interface CommissionRequest<T = any> extends Request {
  params: {
    commissionId?: string
  }
  query: {
    search?: string
    sortBy?: string
    order?: 'asc' | 'desc'
    limit?: string
    page?: string
    createdAtFrom?: string
    createdAtTo?: string
    commission?: string
  }
  body: T
}

export interface CommissionSearchQuery {
  name: { $regex: string; $options: string }
  [key: string]: any
}
