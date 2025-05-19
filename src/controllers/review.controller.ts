import { Review, Product, Store } from '../models/index.model'
import { errorHandler, MongoError } from '../helpers/errorHandler'
import { Request, Response, NextFunction, RequestHandler } from 'express'
import { FilterType } from '../types/controller.types'

export const getReviewById: RequestHandler = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review) {
      res.status(404).json({
        error: 'Review not found'
      })
      return
    }
    ;(req as any).review = review
    next()
  } catch (error) {
    res.status(404).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const checkReview: RequestHandler = async (req, res) => {
  try {
    const { orderId, productId } = req.body
    const review = await Review.findOne({
      userId: req.user?._id,
      orderId,
      productId
    })

    if (!review) {
      res.status(404).json({
        error: 'Review not found'
      })
      return
    }
    res.status(200).json({
      success: 'Reviewed',
      review
    })
  } catch (error) {
    res.status(404).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const createReview: RequestHandler = async (req, res, next) => {
  try {
    const { content, rating, storeId, productId, orderId } = req.body

    if (!rating || !storeId || !productId || !orderId) {
      res.status(400).json({
        error: 'All fields are required'
      })
      return
    }

    const review = new Review({
      content,
      rating,
      userId: req.user?._id,
      storeId,
      productId,
      orderId
    })

    const savedReview = await review.save()
    if (next) next()
    res.status(201).json({
      success: 'Review successfully',
      review: savedReview
    })
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const updateReview: RequestHandler = async (req, res, next) => {
  try {
    const { content, rating } = req.body

    if (!content || !rating) {
      res.status(400).json({
        error: 'All fields are required'
      })
      return
    }

    const review = await Review.findOneAndUpdate(
      { _id: (req as any).review?._id, userId: req.user?._id },
      { $set: { content, rating } },
      { new: true }
    )

    if (!review) {
      res.status(400).json({
        error: 'Update review failed'
      })
      return
    }

    if (next) next()
    res.status(200).json({
      success: 'Update review successfully',
      review
    })
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const deleteReview: RequestHandler = async (req, res, next) => {
  try {
    const result = await Review.deleteOne({
      _id: (req as any).review?._id,
      userId: req.user?._id
    })

    req.body = {
      ...req.body,
      productId: (req as any).review?.productId,
      storeId: (req as any).review?.storeId
    }

    if (next) next()
    res.status(200).json({
      success: 'Remove review successfully',
      review: result
    })
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const deleteReviewByAdmin: RequestHandler = async (req, res, next) => {
  try {
    const isAdmin = req.user?.role === 'admin'
    const deleteCondition = {
      _id: (req as any).review?._id,
      ...(isAdmin ? {} : { userId: req.user?._id })
    }

    const result = await Review.deleteOne(deleteCondition)

    if (result.deletedCount === 0) {
      res.status(404).json({
        error:
          'Review not found or you do not have permission to delete this review'
      })
      return
    }

    req.body = {
      ...req.body,
      productId: (req as any).review?.productId,
      storeId: (req as any).review?.storeId
    }

    res.status(200).json({
      success: 'Remove review successfully',
      result
    })

    if (next) next()
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const updateRating: RequestHandler = async (req, res) => {
  try {
    const { productId, storeId } = req.body

    const productResults = await Review.aggregate([
      { $match: { rating: { $gt: 0 } } },
      {
        $group: {
          _id: '$productId',
          rating: { $sum: '$rating' },
          count: { $sum: 1 }
        }
      }
    ])

    const productRatingData = productResults.find((r) =>
      r._id.equals(productId)
    )
    const productRating = productRatingData
      ? (
          parseFloat(productRatingData.rating.toString()) /
          parseFloat(productRatingData.count.toString())
        ).toFixed(1)
      : '4'

    try {
      await Product.findOneAndUpdate(
        { _id: productId },
        { $set: { rating: productRating } }
      )
    } catch (error) {}

    const storeResults = await Review.aggregate([
      {
        $group: {
          _id: '$storeId',
          rating: { $sum: '$rating' },
          count: { $sum: 1 }
        }
      }
    ])

    const storeRatingData = storeResults.find((r) => r._id.equals(storeId))
    const storeRating = storeRatingData
      ? (
          parseFloat(storeRatingData.rating.toString()) /
          parseFloat(storeRatingData.count.toString())
        ).toFixed(1)
      : '4'

    try {
      await Store.findOneAndUpdate(
        { _id: storeId },
        { $set: { rating: storeRating } }
      )
    } catch (error) {}
  } catch (error) {}
}

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
      .populate('userId', '_id firstName lastName avatar')
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
