import { RequestHandler } from 'express'
import { Wishlist, Product } from '../../models/index.model'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { UserFavoriteProductRequest } from './wishlist.types'

export const wishlist: RequestHandler = async (req, res) => {
  try {
    const userId = req.user!._id
    const productId = req.product!._id
    const favorite = await Wishlist.findOneAndUpdate(
      { userId, productId },
      { isDeleted: false },
      { upsert: true, new: true }
    )
    if (!favorite) {
      res.status(400).json({ error: 'Favorite already exists' })
      return
    }
    const product = await Product.findOne({ _id: productId })
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
    if (!product) {
      res.status(404).json({ error: 'Product not found' })
      return
    }
    res.status(200).json({
      success: 'Favorite product',
      product
    })
  } catch (error) {
    res.status(500).json({ error: errorHandler(error as MongoError) })
  }
}

export const unWishlist: RequestHandler = async (req, res) => {
  try {
    const userId = req.user!._id
    const productId = req.product!._id
    const favorite = await Wishlist.findOneAndUpdate(
      { userId, productId },
      { isDeleted: true },
      { upsert: true, new: true }
    )
    if (!favorite) {
      res.status(400).json({ error: 'Favorite does not exist' })
    }
    const product = await Product.findOne({ _id: productId })
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
    if (!product) {
      res.status(404).json({ error: 'Product not found' })
    }
    res.status(200).json({
      success: 'Product unfavorite',
      product
    })
  } catch (error) {
    res.status(500).json({ error: errorHandler(error as MongoError) })
  }
}

export const checkWishlist: RequestHandler = async (req, res) => {
  try {
    const userId = req.user!._id
    const productId = req.product!._id
    const favorite = await Wishlist.findOne({
      userId,
      productId,
      isDeleted: false
    })
    if (!favorite) {
      res.status(200).json({ error: 'Favorite product not found' })
    }
    res.status(200).json({ success: 'Favorite product' })
  } catch (error) {
    res.status(404).json({ error: 'Favorite product not found' })
  }
}

export const getWishlistCount: RequestHandler = async (req, res) => {
  try {
    const productId = req.product!._id
    const count = await Wishlist.countDocuments({
      productId,
      isDeleted: false
    })
    res.status(200).json({
      success: 'Get product number of favorites successfully',
      count
    })
  } catch (error) {
    res.status(404).json({ error: 'Favorite product not found' })
  }
}
