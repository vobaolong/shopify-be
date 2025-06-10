import { Request } from 'express'

export interface AuthenticatedRequest extends Request {
  user?: any
}

export interface AddressData {
  provinceID?: string
  provinceName?: string
  districtID?: string
  districtName?: string
  wardID?: string
  wardName?: string
  address?: string
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}
