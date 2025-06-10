import { RequestHandler } from 'express'
import {
  Order,
  OrderItem,
  Product,
  Store,
  User,
  Transaction
} from '../../models/index.model'
import { OrderRequest, ReturnRequest } from './order.types'
import { ReturnStatus, OrderStatus } from '../../enums/index.enum'
import mongoose from 'mongoose'

const ObjectId = mongoose.Types.ObjectId

export const createReturnRequest: RequestHandler = async (req, res) => {
  try {
    const reason = req.body.reason as string
    const orderId = req.params.orderId as string

    if (!reason) {
      res.status(400).json({
        error: 'Reason is required'
      })
      return
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
      return
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

export const handleApprovedReturn = async (order: any): Promise<void> => {
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
      return
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
      return
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
