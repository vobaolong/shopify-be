import { Request } from 'express'

export interface UserLevelRequest extends Request {
  user?: any
  params: {
    userLevelId?: string
  }
}

export interface FilterType {
  search?: string
  sortBy?: string
  order?: string
  limit?: number
  pageCurrent?: number
  pageCount?: number
  status?: string
  createdAtFrom?: string
  createdAtTo?: string
}
