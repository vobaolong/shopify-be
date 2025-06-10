import { RequestHandler, Response } from 'express'
import { Cart } from '../../models/index.model'
import { CartRequest, FilterOptions } from './cart.types'

export const getListCarts: RequestHandler = async (
  req: CartRequest,
  res: Response
) => {
  try {
    const userId = req.user?._id
    const limit =
      req.query.limit && parseInt(req.query.limit.toString()) > 0
        ? parseInt(req.query.limit.toString())
        : 6
    const page =
      req.query.page && parseInt(req.query.page.toString()) > 0
        ? parseInt(req.query.page.toString())
        : 1
    let skip = (page - 1) * limit
    const filter: FilterOptions = {
      limit,
      pageCurrent: page
    }
    const count = await Cart.countDocuments({ userId, isDeleted: false }).exec()
    const size = count
    const pageCount = Math.ceil(size / limit)
    filter.pageCount = pageCount
    if (page > pageCount && pageCount > 0) {
      skip = (pageCount - 1) * limit
    }
    if (count <= 0) {
      res.status(200).json({
        success: 'Load list carts successfully',
        filter,
        size,
        carts: []
      })
      return
    }
    const carts = await Cart.find({ userId, isDeleted: false })
      .populate('storeId', '_id name avatar isActive isOpen address')
      .sort({ name: 1, _id: 1 })
      .skip(skip)
      .limit(limit)
      .exec()
    res.status(200).json({
      success: 'Load list carts successfully',
      filter,
      size,
      carts
    })
  } catch (error) {
    res.status(500).json({
      error: 'Load list carts failed'
    })
  }
}
