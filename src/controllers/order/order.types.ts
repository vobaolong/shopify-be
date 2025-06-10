import { Request } from 'express'
import mongoose from 'mongoose'
import { ReturnStatus } from '../../enums/index.enum'

export { ReturnStatus }

export interface OrderRequest extends Request {
  order?: any
  user?: any
  store?: any
  cart?: any
  orderItem?: any
  updatePoint?: {
    userId: mongoose.Types.ObjectId
    storeId: mongoose.Types.ObjectId
    point: number
  }
  createTransaction?: {
    userId?: mongoose.Types.ObjectId
    storeId?: mongoose.Types.ObjectId
    isUp: boolean
    code?: string
    amount: number
  }
}

export interface ReturnRequest {
  _id: mongoose.Types.ObjectId
  reason: string
  status: ReturnStatus
  createdAt: Date
  userId: mongoose.Types.ObjectId
}

export interface CreateOrderBody {
  commissionId: string
  address: string
  phone: string
  userName: string
  name: string
  shippingFee: number
  amountFromUser: number
  amountFromStore: number
  amountToStore: number
  amountToPlatform: number
  isPaidBefore?: boolean
}

export interface OrderFilterArgs {
  tempId?: {
    $regex: string
    $options: string
  }
  status?: {
    $in: string[]
  }
  userId?: mongoose.Types.ObjectId
  storeId?: mongoose.Types.ObjectId
  returnRequests?: {
    $exists: boolean
    $ne: any[]
  }
  'returnRequests.status'?: {
    $in: ReturnStatus[]
  }
  isPaidBefore?: boolean
  createdAt?: {
    $gte: Date
    $lte: Date
  }
  [key: string]: any
}

export interface FilterType {
  search?: string
  sortBy?: string
  order?: string
  limit?: number
  pageCurrent?: number
  pageCount?: number
  status?: string[]
  isPaidBefore?: boolean
}
