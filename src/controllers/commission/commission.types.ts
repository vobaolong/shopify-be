import { Request } from 'express'
import { ICommission } from '../../models/commission.model'

export interface CommissionRequest extends Request {
  commission?: ICommission
  user?: any
  body: {
    name?: string
    fee?: number
    description?: string
  }
}

export interface CommissionSearchQuery {
  name?: any
  createdAt?: any
  isDeleted?: boolean
}

export interface FilterType {
  search?: string
  sortBy?: string
  order?: string
  limit?: number
  pageCurrent?: number
  pageCount?: number
  createdAtFrom?: string
  createdAtTo?: string
}
