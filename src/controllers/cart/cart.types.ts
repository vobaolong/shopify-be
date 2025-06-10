import { Request, Response } from 'express'
import { ICart } from '../../models/cart.model'
import { ICartItem } from '../../models/cartItem.model'
import { IUser } from '../../models/user.model'

export interface CartRequest extends Request {
  cart?: ICart
  cartItem?: ICartItem
  user?: IUser
  cartId?: string
  query: {
    limit?: string
    page?: string
    [key: string]: any
  }
}

export interface FilterOptions {
  limit: number
  pageCurrent: number
  pageCount?: number
}
