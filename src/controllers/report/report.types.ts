import { Request } from 'express'

export interface ReportRequest extends Request {
  query: {
    search?: string
    sortBy?: string
    order?: string
    limit?: string
    page?: string
    isStore?: string
    isProduct?: string
    isReview?: string
  }
  body: {
    objectId?: string
    isStore?: boolean
    isProduct?: boolean
    isReview?: boolean
    reason?: string
    reportBy?: string
  }
  params: {
    id?: string
    userId?: string
  }
}

export interface FilterOptions {
  search: string
  isStore: boolean
  isProduct: boolean
  isReview: boolean
  sortBy: string
  order: string
  limit: number
  pageCurrent: number
  pageCount?: number
}
