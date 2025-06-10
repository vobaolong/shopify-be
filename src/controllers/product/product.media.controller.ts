import { Response, RequestHandler } from 'express'
import ProductModel from '../../models/product.model'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import fs from 'fs'
import { ProductRequest } from './product.types'

// Media-related operations (images)
export const addToListImages: RequestHandler = (
  req: ProductRequest,
  res: Response
) => {
  const listImages = req.filepaths

  ProductModel.findOneAndUpdate(
    { _id: req.product?._id },
    { $push: { listImages: { $each: listImages } } },
    { new: true }
  )
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
    .populate('brandId', '_id')
    .exec()
    .then((product) => {
      if (!product) {
        res.status(404).json({
          error: 'Product not found'
        })
      }

      res.status(200).json({
        success: 'Add images to product successfully',
        product
      })
    })
    .catch((error) => {
      res.status(400).json({
        error: errorHandler(error as MongoError)
      })
    })
}

export const updateListImages: RequestHandler = (
  req: ProductRequest,
  res: Response
) => {
  const listImages = req.filepaths

  ProductModel.findOneAndUpdate(
    { _id: req.product?._id },
    { $set: { listImages } },
    { new: true }
  )
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
    .populate('brandId', '_id')
    .exec()
    .then((product) => {
      if (!product) {
        res.status(404).json({
          error: 'Product not found'
        })
      }

      res.status(200).json({
        success: 'Update images of product successfully',
        product
      })
    })
    .catch((error) => {
      res.status(400).json({
        error: errorHandler(error as MongoError)
      })
    })
}

export const removeFromListImages: RequestHandler = (
  req: ProductRequest,
  res: Response
) => {
  const { index } = req.query

  if (!index || isNaN(parseInt(index as string))) {
    res.status(400).json({
      error: 'Image index is required'
    })
    return
  }

  const imageIndex = parseInt(index as string)

  ProductModel.findById(req.product?._id)
    .exec()
    .then((product) => {
      if (!product) {
        res.status(404).json({
          error: 'Product not found'
        })
        return
      }

      if (imageIndex < 0 || imageIndex >= product.listImages.length) {
        res.status(400).json({
          error: 'Invalid image index'
        })
        return
      }

      const imagePath = product.listImages[imageIndex]

      // Remove image from filesystem if it exists locally
      if (imagePath && imagePath.startsWith('/uploads/')) {
        const fullPath = `public${imagePath}`
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath)
        }
      }

      // Remove image from array
      product.listImages.splice(imageIndex, 1)

      return product.save()
    })
    .then((product) => {
      if (!product) {
        res.status(400).json({
          error: 'Failed to remove image'
        })
        return
      }

      return ProductModel.findById(product._id)
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
        .populate('brandId', '_id')
        .exec()
    })
    .then((product) => {
      res.status(200).json({
        success: 'Remove image from product successfully',
        product
      })
    })
    .catch((error) => {
      res.status(400).json({
        error: errorHandler(error as MongoError)
      })
    })
}
