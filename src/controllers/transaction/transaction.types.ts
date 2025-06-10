import { Request } from 'express'
import mongoose from 'mongoose'

export interface TransactionRequest extends Request {
  transaction?: any
  user?: any
  store?: any
  createTransaction?: any
  body: {
    isUp?: string
    code?: string
    amount?: number
  }
}

export interface FilterType {
  search?: string
  sortBy?: string
  order?: string
  limit?: number
  pageCurrent?: number
  pageCount?: number
  searchField?: string
  type?: string
  createdAtFrom?: string
  createdAtTo?: string
}
