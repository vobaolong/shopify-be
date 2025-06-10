import { RequestHandler, RequestParamHandler, Response } from 'express'
import { OrderItem, CartItem } from '../../models/index.model'
import { OrderRequest } from './order.types'

export const getOrderItemById: RequestParamHandler = async (
  req: OrderRequest,
  res,
  next,
  id: string
) => {
  try {
    const orderItem = await OrderItem.findById(id)
    if (!orderItem) {
      res.status(404).json({ error: 'OrderItem not found' })
      return
    }
    req.orderItem = orderItem
    next()
  } catch (error) {
    res.status(404).json({ error: 'OrderItem not found' })
  }
}

export const getOrderItems: RequestHandler = async (
  req: OrderRequest,
  res: Response
) => {
  try {
    const items = await OrderItem.find({ orderId: req.order?._id })
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
              address: 1,
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
    res.status(200).json({
      success: 'Load list order items successfully',
      items
    })
  } catch (error) {
    res.status(500).json({ error: 'Load list order items failed' })
  }
}

export const createOrderItems: RequestHandler = async (
  req: OrderRequest,
  res,
  next
) => {
  if (!next) return
  try {
    if (!req.cart || !req.order) {
      res.status(400).json({ error: 'Cart or order not found' })
      return
    }
    const items = await CartItem.find({ cartId: req.cart!._id })
    const newItems = items.map((item) => ({
      orderId: req.order!._id,
      productId: item.productId,
      variantValueIds: item.variantValueIds,
      count: item.count,
      isDeleted: item.isDeleted
    }))
    await OrderItem.insertMany(newItems)
    next()
  } catch (error) {
    res.status(500).json({ error: 'Create order items failed' })
  }
}
