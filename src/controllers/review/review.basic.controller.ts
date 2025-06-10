import { RequestHandler } from 'express'
import { Review } from '../../models/index.model'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { Role } from '../../enums/index.enum'
import { ReviewRequest } from './review.types'

export const getReviewById: RequestHandler = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId)
    if (!review) {
      res.status(404).json({ error: 'Review not found' })
      return
    }
    ;(req as ReviewRequest).review = review
    next()
  } catch (error) {
    res.status(404).json({ error: errorHandler(error as MongoError) })
  }
}

export const checkReview: RequestHandler = async (req, res) => {
  try {
    const { orderId, productId } = req.body
    const reviewReq = req as ReviewRequest
    const review = await Review.findOne({
      userId: reviewReq.user?._id,
      orderId,
      productId
    })

    if (!review) {
      res.status(404).json({ error: 'Review not found' })
      return
    }
    res.status(200).json({
      success: 'Reviewed',
      review
    })
  } catch (error) {
    res.status(404).json({ error: errorHandler(error as MongoError) })
  }
}

export const createReview: RequestHandler = async (req, res, next) => {
  try {
    const reviewReq = req as ReviewRequest
    const { content, rating, storeId, productId, orderId } = reviewReq.body

    if (!rating || !storeId || !productId || !orderId) {
      res.status(400).json({ error: 'All fields are required' })
      return
    }

    const review = new Review({
      content,
      rating,
      userId: reviewReq.user?._id,
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
    res.status(400).json({ error: errorHandler(error as MongoError) })
  }
}

export const updateReview: RequestHandler = async (req, res, next) => {
  try {
    const reviewReq = req as ReviewRequest
    const { content, rating } = reviewReq.body

    if (!content || !rating) {
      res.status(400).json({ error: 'All fields are required' })
      return
    }

    const review = await Review.findOneAndUpdate(
      { _id: reviewReq.review?._id, userId: reviewReq.user?._id },
      { $set: { content, rating } },
      { new: true }
    )

    if (!review) {
      res.status(400).json({ error: 'Update review failed' })
      return
    }

    if (next) next()
    res.status(200).json({
      success: 'Update review successfully',
      review
    })
  } catch (error) {
    res.status(400).json({ error: errorHandler(error as MongoError) })
  }
}

export const deleteReview: RequestHandler = async (req, res, next) => {
  try {
    const reviewReq = req as ReviewRequest
    const result = await Review.deleteOne({
      _id: reviewReq.review?._id,
      userId: reviewReq.user?._id
    })

    req.body = {
      ...req.body,
      productId: reviewReq.review?.productId,
      storeId: reviewReq.review?.storeId
    }

    if (next) next()
    res.status(200).json({
      success: 'Remove review successfully',
      review: result
    })
  } catch (error) {
    res.status(400).json({ error: errorHandler(error as MongoError) })
  }
}

export const deleteReviewByAdmin: RequestHandler = async (req, res, next) => {
  try {
    const reviewReq = req as ReviewRequest
    const isAdmin = reviewReq.user?.role === Role.ADMIN
    const deleteCondition = {
      _id: reviewReq.review?._id,
      ...(isAdmin ? {} : { userId: reviewReq.user?._id })
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
      productId: reviewReq.review?.productId,
      storeId: reviewReq.review?.storeId
    }

    res.status(200).json({
      success: 'Remove review successfully',
      result
    })

    if (next) next()
  } catch (error) {
    res.status(400).json({ error: errorHandler(error as MongoError) })
  }
}
