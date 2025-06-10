import { RequestHandler, RequestParamHandler } from 'express'
import { Cart, CartItem } from '../../models/index.model'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { CartRequest } from './cart.types'

// Basic cart operations
export const getCartById: RequestParamHandler = async (
  req: CartRequest,
  res,
  next,
  id: string
) => {
  try {
    const cart = await Cart.findById(id).exec()
    if (!cart) {
      res.status(404).json({
        error: 'Cart not found'
      })
      return
    }
    req.cart = cart
    next()
  } catch (error) {
    res.status(404).json({
      error: 'Cart not found'
    })
  }
}

export const createCart: RequestHandler = async (
  req: CartRequest,
  res,
  next
) => {
  try {
    const { storeId } = req.body
    if (!storeId) {
      res.status(400).json({
        error: 'Store not found'
      })
      return
    }
    const cart = await Cart.findOneAndUpdate(
      { userId: req.user?._id, storeId },
      { isDeleted: false },
      { upsert: true, new: true }
    ).exec()
    if (!cart) {
      res.status(400).json({
        error: 'Create cart failed'
      })
      return
    }

    req.cart = cart
    next()
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const removeCart: RequestHandler = async (req: CartRequest, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { _id: req.cartId },
      { isDeleted: true },
      { new: true }
    ).exec()

    if (!cart) {
      res.status(400).json({
        error: 'Remove cart failed'
      })
      return
    }
    res.status(200).json({
      success: 'Remove cart successfully',
      cart,
      user: req.user
    })
  } catch (error) {
    res.status(400).json({
      error: 'Remove cart failed'
    })
  }
}
