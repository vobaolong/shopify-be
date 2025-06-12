import { RequestHandler } from 'express'
import { Wishlist, Product } from '../../models/index.model'
import { FilterType } from './wishlist.types'

export const listWishlist: RequestHandler = async (req, res) => {
  try {
    const userId = req.user!._id
    const limit =
      req.query.limit &&
      typeof req.query.limit === 'string' &&
      parseInt(req.query.limit) > 0
        ? parseInt(req.query.limit)
        : 6
    const page =
      req.query.page &&
      typeof req.query.page === 'string' &&
      parseInt(req.query.page) > 0
        ? parseInt(req.query.page)
        : 1
    const filter: FilterType = {
      limit,
      pageCurrent: page
    }
    const favorites = await Wishlist.find({
      userId,
      isDeleted: false
    })
    const productIds = favorites.map((favorite) => favorite.productId)
    const size = await Product.countDocuments({
      _id: { $in: productIds },
      isActive: true,
      isSelling: true
    })
    const pageCount = Math.ceil(size / limit)
    filter.pageCount = pageCount
    let skip = (page > pageCount ? pageCount - 1 : page - 1) * limit
    if (skip < 0) skip = 0
    if (size <= 0) {
      res.status(200).json({
        success: 'Load list Favorite products successfully',
        filter,
        size,
        products: []
      })
      return
    }
    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true,
      isSelling: true
    })
      .sort({ name: 1, _id: 1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'categoryId',
        populate: {
          path: 'categoryId',
          populate: { path: 'categoryId' }
        }
      })
      .populate({
        path: 'variantValueIds',
        populate: { path: 'variantId' }
      })
      .populate('storeId', '_id name avatar isActive isOpen')
    res.status(200).json({
      success: 'Load list favorite products successfully',
      filter,
      size,
      products
    })
    return
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' })
  }
}
