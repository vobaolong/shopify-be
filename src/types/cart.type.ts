import mongoose from 'mongoose'
import { ICart } from '../models/cart.model'
import { ICartItem } from '../models/cartItem.model'
import { IUser } from '../models/user.model'
import { Request } from 'express'

export interface CustomRequest<T = any> extends Request {
  user?: IUser
  cart?: ICart
  cartItem?: ICartItem
  cartId?: mongoose.Types.ObjectId
  body: T
  query: {
    limit?: string
    page?: string
    pageCurrent?: string
    pageCount?: string
  }
}
export interface FilterOptions {
  limit?: number
  pageCurrent?: number
  pageCount?: number
  search?: string
  sortBy?: string
  order?: 'asc' | 'desc'
}
