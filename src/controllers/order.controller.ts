import {
  Order,
  OrderItem,
  Cart,
  CartItem,
  Product,
  Store,
  User,
  Transaction
} from '../models/index.model'
import { cleanUserLess } from '../helpers/userHandler'
import { errorHandler, MongoError } from '../helpers/errorHandler'
import mongoose from 'mongoose'
import {
  Request,
  Response,
  NextFunction,
  RequestParamHandler,
  RequestHandler
} from 'express'
import { FilterType } from '../types/controller.types'
import { OrderStatus, ReturnStatus } from '../enums/index.enum'

const ObjectId = mongoose.Types.ObjectId

interface OrderRequest extends Request {
  order?: any
  user?: any
  store?: any
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

interface ReturnRequest {
  _id: mongoose.Types.ObjectId
  reason: string
  status: ReturnStatus
  createdAt: Date
  userId: mongoose.Types.ObjectId
}

interface CreateOrderBody {
  commissionId: string
  address: string
  phone: string
  firstName: string
  lastName: string
  shippingFee: number
  amountFromUser: number
  amountFromStore: number
  amountToStore: number
  amountToPlatform: number
  isPaidBefore?: boolean
}

interface OrderFilterArgs {
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
  [key: string]: any
}

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
    }
    req.order = order
    next()
  } catch (error) {
    res.status(404).json({ error: 'Order not found' })
  }
}

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
    res.status(500).json({
      error: 'Load list order items failed'
    })
  }
}

const setupPaginationAndFilter = (req: OrderRequest) => {
  const search = req.query.search?.toString() || ''
  const regex = '.*' + search + '.*'

  const sortBy = req.query.sortBy?.toString() || 'createdAt'
  const order = ['asc', 'desc'].includes(req.query.order?.toString() || '')
    ? req.query.order?.toString() || 'desc'
    : 'desc'

  const limit =
    parseInt(req.query.limit?.toString() || '0') > 0
      ? parseInt(req.query.limit?.toString() || '0')
      : 6
  const page =
    parseInt(req.query.page?.toString() || '0') > 0
      ? parseInt(req.query.page?.toString() || '0')
      : 1

  const filter: FilterType = {
    search,
    sortBy,
    order,
    limit,
    pageCurrent: page
  }

  const filterArgs: OrderFilterArgs = {
    tempId: { $regex: regex, $options: 'i' }
  }

  if (req.query.status) {
    filter.status = req.query.status.toString().split('|')
    filterArgs.status = {
      $in: req.query.status.toString().split('|')
    }
  }

  return { filter, filterArgs, limit, page }
}

const processOrderResults = async (
  res: Response,
  result: Array<{ _id: mongoose.Types.ObjectId; count: number }>,
  filter: FilterType,
  limit: number,
  page: number,
  additionalFilters: Record<string, any> = {}
) => {
  const size = result.reduce(
    (p: number, c: { count: number }) => p + c.count,
    0
  )
  const pageCount = Math.ceil(size / limit)
  filter.pageCount = pageCount

  let skip = limit * (page - 1)
  if (page > pageCount) {
    skip = (pageCount - 1) * limit
  }

  if (size <= 0) {
    res.status(200).json({
      success: 'Load list orders successfully',
      filter,
      size,
      orders: []
    })
  }

  try {
    const orders = await Order.find({
      _id: { $in: result.map((r) => r._id) },
      ...additionalFilters
    })
      .sort({ [filter.sortBy]: filter.order === 'asc' ? 1 : -1, _id: 1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', '_id firstName lastName avatar')
      .populate('storeId', '_id name address avatar isActive isOpen')
      .populate('commissionId')

    res.status(200).json({
      success: 'Load list orders successfully',
      filter,
      size,
      orders
    })
  } catch (error) {
    res.status(500).json({
      error: 'Load list orders failed'
    })
  }
}

export const getOrdersByUser: RequestHandler = async (
  req: OrderRequest,
  res: Response
) => {
  try {
    const userId = req.user?._id as mongoose.Types.ObjectId | undefined
    if (!userId) {
      res.status(400).json({
        error: 'User not found'
      })
      return
    }
    const { filter, filterArgs, limit, page } = setupPaginationAndFilter(req)
    filterArgs.userId = userId
    const result = await Order.aggregate([
      {
        $addFields: {
          tempId: { $toString: '$_id' }
        }
      },
      {
        $match: filterArgs
      },
      {
        $group: {
          _id: '$_id',
          count: { $sum: 1 }
        }
      }
    ])
    await processOrderResults(res, result, filter, limit, page)
  } catch (error) {
    res.status(500).json({
      error: 'Load list orders by user failed'
    })
  }
}

export const getOrdersByStore: RequestHandler = async (
  req: OrderRequest,
  res: Response
) => {
  try {
    const storeId = req.store?._id as mongoose.Types.ObjectId | undefined
    if (!storeId) {
      res.status(400).json({
        error: 'Store not found'
      })
    }
    const { filter, filterArgs, limit, page } = setupPaginationAndFilter(req)
    filterArgs.storeId = storeId
    const result = await Order.aggregate([
      {
        $addFields: {
          tempId: { $toString: '$_id' }
        }
      },
      {
        $match: filterArgs
      },
      {
        $group: {
          _id: '$_id',
          count: { $sum: 1 }
        }
      }
    ])
    await processOrderResults(res, result, filter, limit, page)
  } catch (error) {
    res.status(500).json({
      error: 'Load list orders by store failed'
    })
  }
}

export const getOrdersForAdmin: RequestHandler = async (
  req: OrderRequest,
  res: Response
) => {
  try {
    const { filter, filterArgs, limit, page } = setupPaginationAndFilter(req)
    const result = await Order.aggregate([
      {
        $addFields: {
          tempId: { $toString: '$_id' }
        }
      },
      {
        $match: filterArgs
      },
      {
        $group: {
          _id: '$_id',
          count: { $sum: 1 }
        }
      }
    ])
    await processOrderResults(res, result, filter, limit, page)
  } catch (error) {
    res.status(500).json({
      error: 'Load list orders failed'
    })
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
      res.status(400).json({
        error: 'Cart not found'
      })
    }
    const { userId, storeId } = cart as any
    const body = req.body as CreateOrderBody
    const {
      commissionId,
      address,
      phone,
      firstName,
      shippingFee,
      lastName,
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
      !firstName ||
      !lastName ||
      !amountFromUser ||
      !amountFromStore ||
      !amountToStore ||
      !amountToPlatform
    ) {
      res.status(400).json({
        error: 'All fields are required'
      })
    }
    if (!userId.equals(req.user?._id as mongoose.Types.ObjectId)) {
      res.status(400).json({
        error: 'This is not right cart!'
      })
    }
    const order = new Order({
      userId,
      storeId,
      firstName,
      lastName,
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
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
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
      res.status(400).json({
        error: 'Cart or order not found'
      })
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
    res.status(500).json({
      error: 'Create order items failed'
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
  }
  if (req.user.role === 'admin') {
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

export const readOrder: RequestHandler = async (
  req: OrderRequest,
  res: Response
) => {
  try {
    if (!req.order) {
      res.status(404).json({
        error: 'Order not found'
      })
    }
    const order = await Order.findOne({ _id: req.order._id })
      .populate('userId', '_id firstName lastName avatar')
      .populate('storeId', '_id name address avatar isActive isOpen')
      .populate('commissionId')
    if (!order) {
      res.status(501).json({
        error: 'Not found!'
      })
    }
    res.status(200).json({
      success: 'read order successfully',
      order
    })
  } catch (error) {
    res.status(500).json({
      error: 'Not found!'
    })
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
      res.status(404).json({
        error: 'Order not found'
      })
    }
    const currentStatus = req.order.status
    if (currentStatus !== 'Not processed') {
      res.status(401).json({
        error: 'This order is already processed!'
      })
    }
    const time = new Date().getTime() - new Date(req.order.createdAt).getTime()
    const hours = Math.floor(time / 1000) / 3600
    if (hours >= 1) {
      res.status(401).json({
        error: 'This order is not within the time allowed!'
      })
    }
    const status = req.body.status as OrderStatus
    if (status !== 'Cancelled') {
      res.status(401).json({
        error: 'This status value is invalid!'
      })
    }
    const order = await Order.findOneAndUpdate(
      { _id: req.order._id },
      { $set: { status } },
      { new: true }
    )
      .populate('userId', '_id firstName lastName avatar')
      .populate('storeId', '_id name address avatar isActive isOpen')
      .populate('commissionId')

    if (!order) {
      res.status(500).json({
        error: 'Not found!'
      })
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
    res.status(500).json({
      error: 'update order failed'
    })
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
      res.status(404).json({
        error: 'Order not found'
      })
    }
    const currentStatus = req.order.status
    const status = req.body.status as OrderStatus
    if (
      ![
        OrderStatus.NOT_PROCESSED,
        OrderStatus.PROCESSING,
        OrderStatus.SHIPPED,
        OrderStatus.DELIVERED,
        OrderStatus.CANCELLED
      ].includes(status)
    ) {
      res.status(400).json({
        error: 'This status value is invalid!'
      })
    }
    if (
      (currentStatus === OrderStatus.NOT_PROCESSED &&
        [OrderStatus.DELIVERED, OrderStatus.SHIPPED].includes(status)) ||
      (currentStatus === OrderStatus.PROCESSING &&
        [OrderStatus.NOT_PROCESSED, OrderStatus.DELIVERED].includes(status)) ||
      (currentStatus === OrderStatus.SHIPPED &&
        [OrderStatus.NOT_PROCESSED, OrderStatus.PROCESSING].includes(status)) ||
      (currentStatus === OrderStatus.DELIVERED &&
        status !== OrderStatus.DELIVERED)
    ) {
      res.status(401).json({
        error: 'Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.'
      })
    }
    const order = await Order.findOneAndUpdate(
      { _id: req.order._id },
      { $set: { status } },
      { new: true }
    )
      .populate('userId', '_id firstName lastName avatar')
      .populate('storeId', '_id name address avatar isActive isOpen')
      .populate('commissionId')

    if (!order) {
      res.status(500).json({
        error: 'Not found!'
      })
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
    res.status(500).json({
      error: 'update order failed'
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

export const createReturnRequest: RequestHandler = async (req, res) => {
  try {
    const reason = req.body.reason as string
    const orderId = req.params.orderId as string

    if (!reason) {
      res.status(400).json({
        error: 'Reason is required'
      })
    }

    const returnRequest: ReturnRequest = {
      reason,
      status: ReturnStatus.PENDING,
      createdAt: new Date(),
      userId: new ObjectId(req.params.userId),
      _id: new ObjectId()
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { $set: { returnRequests: returnRequest } },
      { new: true }
    )

    if (!order) {
      res.status(500).json({
        error: 'Could not create return request'
      })
    }

    res.status(200).json({
      success: 'Return request created successfully',
      order
    })
  } catch (error) {
    res.status(500).json({
      error: 'Could not create return request'
    })
  }
}

export const getReturnOrders: RequestHandler = async (req, res) => {
  try {
    if (!req.store) {
      res.status(400).json({
        error: 'Store not found'
      })
    }
    const storeId = req.store?._id
    const { filter, filterArgs, limit, page } = setupPaginationAndFilter(req)
    filterArgs.storeId = storeId as mongoose.Types.ObjectId
    filterArgs.returnRequests = { $exists: true, $ne: [] }
    if (req.query.status) {
      filter.status = req.query.status
      filterArgs['returnRequests.status'] = {
        $in: req.query.status
          .toString()
          .split(',')
          .map((status) => status as ReturnStatus)
      }
    }
    const result = await Order.aggregate([
      {
        $addFields: {
          tempId: { $toString: '$_id' }
        }
      },
      {
        $match: filterArgs
      },
      {
        $group: {
          _id: '$_id',
          count: { $sum: 1 }
        }
      }
    ])
    return await processOrderResults(res, result, filter, limit, page)
  } catch (error) {
    console.error('Error in getReturnOrders:', error)
    res.status(500).json({
      error: 'Load list orders by store failed'
    })
  }
}

const handleApprovedReturn = async (order: any): Promise<void> => {
  try {
    const items = await OrderItem.find({ orderId: order._id })

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
            quantity: +count,
            sold: -count
          }
        }
      }
    }))

    await Product.bulkWrite(bulkOps)

    const sum =
      parseFloat(order.amountToStore.toString()) +
      parseFloat(order.amountFromStore.toString())

    const transaction1 = new Transaction({
      storeId: order.storeId,
      isUp: false,
      amount: sum
    })

    await Store.findOneAndUpdate(
      { _id: order.storeId },
      {
        $inc: {
          point: -1,
          e_wallet: -sum
        }
      }
    )

    const transaction2 = new Transaction({
      userId: order.userId,
      isUp: true,
      amount: order.amountFromUser
    })

    await User.findByIdAndUpdate(
      { _id: order.userId },
      {
        $inc: { point: -1, e_wallet: +order.amountFromUser }
      }
    )

    await Promise.all([transaction1.save(), transaction2.save()])
    console.log('Products and wallets updated successfully')
  } catch (error) {
    console.error('Error in handleApprovedReturn:', error)
    throw new Error('Could not handle approved return')
  }
}

export const returnOrder: RequestHandler = async (req, res) => {
  try {
    const orderId = req.params.orderId as string
    const status = req.body.status

    if (!status) {
      res.status(400).json({
        error: 'Status is required'
      })
    }

    const order: any = await Order.findOneAndUpdate(
      { _id: orderId },
      { $set: { 'returnRequests.status': status } },
      { new: true }
    )

    if (!order) {
      res.status(500).json({
        error: 'Could not update return request'
      })
    }

    if (status === ReturnStatus.APPROVED) {
      try {
        await handleApprovedReturn(order)
        order.status = OrderStatus.RETURNED
        await order?.save()
        res.status(200).json({
          success: 'Return request approved successfully',
          order
        })
      } catch (err) {
        res.status(500).json({
          error: 'Failed to handle approved return'
        })
      }
    } else {
      res.status(200).json({
        success: 'Return request updated successfully',
        order
      })
    }
  } catch (error) {
    res.status(500).json({
      error: 'Could not update return request'
    })
  }
}

export const countOrders: RequestHandler = async (req, res) => {
  try {
    const filterArgs: Record<string, any> = {}
    if (req.query.status) {
      filterArgs.status = {
        $in: req.query.status.toString().split('|')
      }
    }

    if (req.query.userId) filterArgs.userId = req.query.userId
    if (req.query.storeId) filterArgs.storeId = req.query.storeId

    const count = await Order.countDocuments(filterArgs)

    res.status(200).json({
      success: 'Count order successfully',
      count
    })
  } catch (error) {
    res.status(200).json({
      success: 'Count order successfully',
      count: 0
    })
  }
}

export const updatePoint: RequestHandler = async (req, res, next) => {
  if (!next) return
  try {
    if (!req.updatePoint) {
      next()
      return
    }
    const { userId, storeId, point } = req.updatePoint
    await Promise.all([
      User.findOneAndUpdate({ _id: userId }, { $inc: { point: +point } }),
      Store.findOneAndUpdate({ _id: storeId }, { $inc: { point: +point } })
    ])
    res.status(200).json({
      success: 'Update point successfully'
    })
    next()
  } catch (error) {
    res.status(500).json({
      error: 'Update point failed'
    })
    next()
  }
}
