import { RequestHandler, RequestParamHandler, Response } from 'express'
import {
  Order,
  User,
  Store,
  Cart,
  CartItem,
  Product,
  OrderItem
} from '../../models/index.model'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { OrderRequest, CreateOrderBody } from './order.types'
import { cleanUserLess } from '../../helpers/userHandler'
import { OrderStatus, Role } from '../../enums/index.enum'

export const getOrderById: RequestParamHandler = async (
  req: OrderRequest,
  res,
  next,
  id: string
) => {
  try {
    const order = await Order.findById(id)
    if (!order) {
      res.status(404).json({ error: 'Order not found' })
      return
    }
    req.order = order
    next()
  } catch (error) {
    res.status(404).json({ error: 'Order not found' })
  }
}

export const readOrder: RequestHandler = async (
  req: OrderRequest,
  res: Response
) => {
  try {
    if (!req.order) {
      res.status(404).json({ error: 'Order not found' })
      return
    }
    const order = await Order.findOne({ _id: req.order._id })
      .populate('userId', '_id userName name avatar')
      .populate('storeId', '_id name address avatar isActive isOpen')
      .populate('commissionId')
    if (!order) {
      res.status(501).json({ error: 'Not found!' })
      return
    }
    res.status(200).json({
      success: 'read order successfully',
      order
    })
  } catch (error) {
    res.status(500).json({ error: 'Not found!' })
  }
}

export const createOrder: RequestHandler = async (
  req: OrderRequest,
  res,
  next
) => {
  if (!next) return
  try {
    const cart = req.cart
    if (!cart) {
      res.status(400).json({ error: 'Cart not found' })
      return
    }
    const { userId, storeId } = cart as any
    const body = req.body as CreateOrderBody
    const {
      commissionId,
      address,
      phone,
      userName,
      shippingFee,
      name,
      amountFromUser,
      amountFromStore,
      amountToStore,
      amountToPlatform,
      isPaidBefore = false
    } = body
    if (
      !userId ||
      !storeId ||
      !commissionId ||
      !address ||
      !shippingFee ||
      !phone ||
      !userName ||
      !name ||
      !amountFromUser ||
      !amountFromStore ||
      !amountToStore ||
      !amountToPlatform
    ) {
      res.status(400).json({ error: 'All fields are required' })
      return
    }
    if (!userId.equals(req.user?._id)) {
      res.status(400).json({ error: 'This is not right cart!' })
      return
    }
    const order = new Order({
      userId,
      storeId,
      userName,
      name,
      phone,
      address,
      shippingFee,
      commissionId,
      amountFromUser,
      amountFromStore,
      amountToStore,
      amountToPlatform,
      isPaidBefore
    })
    const savedOrder = await order.save()
    req.order = savedOrder
    next()
  } catch (error) {
    res.status(400).json({ error: errorHandler(error as MongoError) })
  }
}

export const updateStatusForUser: RequestHandler = async (
  req: OrderRequest,
  res,
  next
) => {
  if (!next) return
  try {
    if (!req.order) {
      res.status(404).json({ error: 'Order not found' })
      return
    }
    const currentStatus = req.order.status
    if (currentStatus !== 'Pending') {
      res.status(401).json({ error: 'This order is already processed!' })
      return
    }
    const time = new Date().getTime() - new Date(req.order.createdAt).getTime()
    const hours = Math.floor(time / 1000) / 3600
    if (hours >= 1) {
      res
        .status(401)
        .json({ error: 'This order is not within the time allowed!' })
      return
    }
    const status = req.body.status as OrderStatus
    if (status !== 'Cancelled') {
      res.status(401).json({ error: 'This status value is invalid!' })
      return
    }
    const order = await Order.findOneAndUpdate(
      { _id: req.order._id },
      { $set: { status } },
      { new: true }
    )
      .populate('userId', '_id userName name avatar')
      .populate('storeId', '_id name address avatar isActive isOpen')
      .populate('commissionId')
    if (!order) {
      res.status(500).json({ error: 'Not found!' })
      return
    }
    if (order?.status === OrderStatus.CANCELLED) {
      req.updatePoint = {
        userId: req.order.userId,
        storeId: req.order.storeId,
        point: -1
      }
      if (order.isPaidBefore === true) {
        req.createTransaction = {
          userId: order.userId,
          isUp: true,
          amount: Number(order.amountFromUser)
        }
      }
      next()
      return
    }
    res.status(200).json({
      success: 'update order successfully',
      order,
      user: req.user ? cleanUserLess(req.user as any) : null
    })
  } catch (error) {
    res.status(500).json({ error: 'update order failed' })
  }
}

export const updateStatusForStore: RequestHandler = async (
  req: OrderRequest,
  res,
  next
) => {
  if (!next) return
  try {
    if (!req.order) {
      res.status(404).json({ error: 'Order not found' })
      return
    }
    const currentStatus = req.order.status
    const status = req.body.status as OrderStatus
    if (
      ![
        OrderStatus.PENDING,
        OrderStatus.PROCESSING,
        OrderStatus.SHIPPED,
        OrderStatus.DELIVERED,
        OrderStatus.CANCELLED
      ].includes(status)
    ) {
      res.status(400).json({ error: 'This status value is invalid!' })
      return
    }
    if (
      (currentStatus === OrderStatus.PENDING &&
        [OrderStatus.DELIVERED, OrderStatus.SHIPPED].includes(status)) ||
      (currentStatus === OrderStatus.PROCESSING &&
        [OrderStatus.PENDING, OrderStatus.DELIVERED].includes(status)) ||
      (currentStatus === OrderStatus.SHIPPED &&
        [OrderStatus.PENDING, OrderStatus.PROCESSING].includes(status)) ||
      (currentStatus === OrderStatus.DELIVERED &&
        status !== OrderStatus.DELIVERED)
    ) {
      res.status(401).json({
        error: 'Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.'
      })
      return
    }
    const order = await Order.findOneAndUpdate(
      { _id: req.order._id },
      { $set: { status } },
      { new: true }
    )
      .populate('userId', '_id userName name avatar')
      .populate('storeId', '_id name address avatar isActive isOpen')
      .populate('commissionId')
    if (!order) {
      res.status(500).json({ error: 'Not found!' })
      return
    }
    if (status === OrderStatus.CANCELLED) {
      req.updatePoint = {
        userId: req.order.userId,
        storeId: req.order.storeId,
        point: -1
      }
      if (order?.isPaidBefore === true) {
        req.createTransaction = {
          userId: order.userId,
          isUp: true,
          amount: Number(order.amountFromUser)
        }
      }
      next()
    } else if (status === 'Delivered') {
      req.updatePoint = {
        userId: req.order.userId,
        storeId: req.order.storeId,
        point: 1
      }
      req.createTransaction = {
        storeId: order?.storeId,
        isUp: order?.isPaidBefore === true,
        amount:
          order?.isPaidBefore === true
            ? Number(order?.amountToStore)
            : Number(order?.amountToPlatform)
      }
      next()
    } else {
      res.status(200).json({
        success: 'update order successfully',
        order
      })
    }
  } catch (error) {
    res.status(500).json({ error: 'update order failed' })
  }
}

export const checkOrderAuth: RequestHandler = async (
  req: OrderRequest,
  res,
  next
) => {
  if (!next) return

  if (!req.user || !req.order) {
    res.status(401).json({
      error: 'User or order not found'
    })
    return
  }
  if (req.user.role === Role.ADMIN) {
    next()
  } else if (
    req.user._id.equals(req.order.userId) ||
    req.store?._id.equals(req.order.storeId)
  ) {
    next()
  } else {
    res.status(401).json({
      error: 'That is not right order!'
    })
  }
}

export const removeCart: RequestHandler = async (
  req: OrderRequest,
  res,
  next
) => {
  if (!next) return

  try {
    if (!req.cart) {
      res.status(400).json({
        error: 'Cart not found'
      })
      return
    }
    const cart = await Cart.findOneAndUpdate(
      { _id: req.cart?._id },
      { isDeleted: true },
      { new: true }
    )
    if (!cart) {
      res.status(400).json({
        error: 'Remove cart failed'
      })
      return
    }
    next()
  } catch (error) {
    res.status(400).json({
      error: 'Remove cart failed'
    })
  }
}

export const removeAllCartItems: RequestHandler = async (
  req: OrderRequest,
  res: Response
) => {
  try {
    if (!req.cart || !req.user || !req.order) {
      res.status(400).json({
        error: 'Cart, user, or order not found'
      })
      return
    }
    await CartItem.deleteMany({ cartId: req.cart?._id })
    res.status(200).json({
      success: 'Create order successfully',
      order: req.order,
      user: cleanUserLess(req.user)
    })
  } catch (error) {
    res.status(400).json({
      error: 'Remove all cart items failed'
    })
  }
}

export const updateQuantitySoldProduct: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    if (!req.order) {
      res.status(404).json({
        error: 'Order not found'
      })
      return
    }

    const items = await OrderItem.find({ orderId: req.order?._id })

    const productMap = new Map<string, number>()
    items.forEach((item) => {
      const productId = item.productId.toString()
      const currentCount = productMap.get(productId) || 0
      productMap.set(productId, currentCount + item.count)
    })
    const bulkOps = Array.from(productMap).map(([productId, count]) => ({
      updateOne: {
        filter: { _id: productId },
        update: {
          $inc: {
            quantity: -count,
            sold: +count
          }
        }
      }
    }))
    await Product.bulkWrite(bulkOps)
    res.status(200).json({
      success: 'Order successfully, update product successfully',
      order: req.order
    })
  } catch (error) {
    res.status(400).json({
      error: 'Could not update product quantity, sold'
    })
  }
}
