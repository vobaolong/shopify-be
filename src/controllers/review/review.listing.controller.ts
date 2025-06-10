import { RequestHandler } from 'express'
import { Review } from '../../models/index.model'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { FilterType } from './review.types'

export const getReviews: RequestHandler = async (req, res) => {
  try {
    const sortBy = req.query.sortBy?.toString() || 'createdAt'
    const order =
      req.query.order?.toString() &&
      ['asc', 'desc'].includes(req.query.order?.toString())
        ? req.query.order?.toString()
        : 'desc'
    const limit =
      req.query.limit && parseInt(req.query.limit.toString()) > 0
        ? parseInt(req.query.limit.toString())
        : 6
    const page =
      req.query.page && parseInt(req.query.page.toString()) > 0
        ? parseInt(req.query.page.toString())
        : 1

    const filter: FilterType = {
      search: '',
      sortBy,
      order,
      limit,
      pageCurrent: page
    }

    const filterArgs: Record<string, any> = {}

    if (req.query.productId) {
      filter.productId = req.query.productId.toString()
      filterArgs.productId = req.query.productId.toString()
    }

    if (req.query.storeId) {
      filter.storeId = req.query.storeId.toString()
      filterArgs.storeId = req.query.storeId.toString()
    }

    if (req.query.userId) {
      filter.userId = req.query.userId.toString()
      filterArgs.userId = req.query.userId.toString()
    }

    if (
      req.query.rating &&
      parseInt(req.query.rating.toString()) > 0 &&
      parseInt(req.query.rating.toString()) < 6
    ) {
      filter.rating = parseInt(req.query.rating.toString())
      filterArgs.rating = parseInt(req.query.rating.toString())
    }

    const count = await Review.countDocuments(filterArgs)
    const size = count
    const pageCount = Math.ceil(size / limit)
    filter.pageCount = pageCount

    if (count <= 0) {
      res.status(200).json({
        success: 'Load list reviews successfully',
        filter,
        size,
        reviews: []
      })
      return
    }

    let skip = limit * (page - 1)
    if (page > pageCount) {
      skip = (pageCount - 1) * limit
    }

    const reviews = await Review.find(filterArgs)
      .sort({ [sortBy]: order === 'asc' ? 1 : -1, _id: 1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', '_id userName name avatar')
      .populate('productId', '_id name')
      .populate('storeId', '_id name avatar')
      .populate('orderId', '_id updatedAt')

    res.status(200).json({
      success: 'Load list reviews successfully',
      filter,
      size,
      reviews
    })
  } catch (error) {
    res.status(500).json({
      error: errorHandler(error as MongoError)
    })
  }
}
