import { RequestHandler } from 'express'
import { Review, Product, Store } from '../../models/index.model'
import { ReviewRequest } from './review.types'

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
    } catch (error) {
      // Silent fail for product rating update
    }

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
    } catch (error) {
      // Silent fail for store rating update
    }
  } catch (error) {
    // Silent fail for entire rating update
  }
}
