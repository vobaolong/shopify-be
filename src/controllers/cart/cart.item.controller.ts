import { RequestHandler, RequestParamHandler } from 'express'
import { CartItem } from '../../models/index.model'
import { cleanUserLess } from '../../helpers/userHandler'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { CartRequest } from './cart.types'

export const getCartItemById: RequestParamHandler = async (
  req: CartRequest,
  res,
  next,
  id: string
) => {
  try {
    const cartItem = await CartItem.findById(id).exec()
    if (!cartItem) {
      res.status(404).json({
        error: 'CartItem not found'
      })
      return
    }
    req.cartItem = cartItem
    next()
  } catch (error) {
    res.status(404).json({
      error: 'CartItem not found'
    })
  }
}

export const createCartItem: RequestHandler = async (
  req: CartRequest,
  res,
  next
) => {
  try {
    const { productId, variantValueIds, count } = req.body
    if (!productId || !count) {
      const cartId = req.cartItem?.cartId
      const itemCount = await CartItem.countDocuments({ cartId }).exec()
      if (itemCount <= 0) {
        req.cartId = cartId?.toString()
        next()
        return
      } else {
        res.status(400).json({
          error: 'All fields are required'
        })
        return
      }
    }
    let variantValueIdsArray: string[] = []
    if (variantValueIds) {
      variantValueIdsArray = variantValueIds.split('|')
    }
    const item = await CartItem.findOneAndUpdate(
      {
        productId,
        variantValueIds: variantValueIdsArray,
        cartId: req.cart?._id
      },
      { $inc: { count: +count } },
      { upsert: true, new: true }
    )
      .populate({
        path: 'productId',
        populate: [
          {
            path: 'categoryId',
            populate: {
              path: 'categoryId',
              populate: { path: 'categoryId' }
            }
          },
          {
            path: 'storeId',
            select: {
              _id: 1,
              name: 1,
              avatar: 1,
              isActive: 1,
              isOpen: 1
            }
          }
        ]
      })
      .populate({
        path: 'variantValueIds',
        populate: { path: 'variantId' }
      })
      .exec()

    if (!item) {
      res.status(400).json({
        error: 'Create cart item failed'
      })
      return
    }

    res.status(200).json({
      success: 'Add to cart successfully',
      item,
      user: req.user ? cleanUserLess(req.user) : undefined
    })
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const getListCartItem: RequestHandler = async (
  req: CartRequest,
  res
) => {
  try {
    const items = await CartItem.find({ cartId: req.cart?._id })
      .populate({
        path: 'productId',
        populate: [
          {
            path: 'categoryId',
            populate: {
              path: 'categoryId',
              populate: { path: 'categoryId' }
            }
          },
          {
            path: 'storeId',
            select: {
              _id: 1,
              name: 1,
              avatar: 1,
              isActive: 1,
              isOpen: 1
            }
          }
        ]
      })
      .populate({
        path: 'variantValueIds',
        populate: { path: 'variantId' }
      })
      .exec()
    res.status(200).json({
      success: 'Load list cart items successfully',
      items
    })
  } catch (error) {
    res.status(500).json({
      error: 'Load list cart items failed'
    })
  }
}

export const updateCartItem: RequestHandler = async (req: CartRequest, res) => {
  try {
    const { count } = req.body

    const item = await CartItem.findOneAndUpdate(
      { _id: req.cartItem?._id },
      { $set: { count } },
      { new: true }
    )
      .populate({
        path: 'productId',
        populate: [
          {
            path: 'categoryId',
            populate: {
              path: 'categoryId',
              populate: { path: 'categoryId' }
            }
          },
          {
            path: 'storeId',
            select: {
              _id: 1,
              name: 1,
              avatar: 1,
              isActive: 1,
              isOpen: 1
            }
          }
        ]
      })
      .populate({
        path: 'variantValueIds',
        populate: { path: 'variantId' }
      })
      .exec()
    res.status(200).json({
      success: 'Update cart item successfully',
      item,
      user: cleanUserLess(req.user || {})
    })
  } catch (error) {
    res.status(500).json({
      error: 'Update cart item failed'
    })
  }
}

export const removeCartItem: RequestHandler = async (
  req: CartRequest,
  res,
  next
) => {
  try {
    await CartItem.deleteOne({ _id: req.cartItem?._id }).exec()
    const cartId = req.cartItem?.cartId
    const count = await CartItem.countDocuments({ cartId }).exec()

    if (count <= 0) {
      req.cartId = cartId?.toString()
      next()
      return
    } else {
      res.status(200).json({
        success: 'Remove cart item successfully',
        user: cleanUserLess(req.user || {})
      })
    }
  } catch (error) {
    res.status(500).json({
      error: 'Remove cart item failed'
    })
  }
}

export const countCartItems: RequestHandler = async (req: CartRequest, res) => {
  try {
    const result = await CartItem.aggregate([
      {
        $lookup: {
          from: 'carts',
          localField: 'cartId',
          foreignField: '_id',
          as: 'carts'
        }
      },
      {
        $group: {
          _id: '$carts.userId',
          count: {
            $sum: 1
          }
        }
      }
    ]).exec()
    const foundResult = result.find(
      (r) => r._id && r._id[0] && r._id[0].equals(req.user?._id)
    )
    const count = foundResult ? foundResult.count : 0
    res.status(200).json({
      success: 'Count cart items successfully',
      count
    })
  } catch (error) {
    res.status(500).json({
      error: 'Count cart items failed'
    })
  }
}
