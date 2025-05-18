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
  }
  body: T
}

export interface CommissionFilter {
  search: string
  sortBy: string
  order: 'asc' | 'desc'
  limit: number
  pageCurrent: number
  pageCount?: number
}

export interface CommissionSearchQuery {
  name: { $regex: string; $options: string }
  [key: string]: any
}
