import { Response, RequestHandler, RequestParamHandler } from 'express'
import ProductModel, { IProduct } from '../../models/product.model'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { ProductRequest } from './product.types'

export const getProductById: RequestParamHandler = (
  req: ProductRequest,
  res,
  next,
  id: string
) => {
  ProductModel.findById(id)
    .exec()
    .then((product) => {
      if (!product) {
        return res.status(404).json({
          error: 'Sản phẩm không tồn tại'
        })
      }
      req.product = product
      next()
    })
    .catch(() => {
      return res.status(404).json({
        error: 'Sản phẩm không tồn tại'
      })
    })
}

export const getProductForSeller: RequestHandler = (
  req: ProductRequest,
  res: Response
) => {
  ProductModel.findOne({ _id: req.product?._id, storeId: req.store?._id })
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
    .populate('brandId', '_id name')
    .exec()
    .then((product) => {
      if (!product) {
        return res.status(500).json({
          error: 'Sản phẩm không tồn tại'
        })
      }

      return res.status(200).json({
        success: 'Get product successfully',
        product
      })
    })
    .catch(() => {
      return res.status(500).json({
        error: 'Sản phẩm không tồn tại'
      })
    })
}

export const getProduct: RequestHandler = (
  req: ProductRequest,
  res: Response
) => {
  if (!req.product?.isActive) {
    res.status(404).json({
      error: 'Sản phẩm đang tạm thời bị khoá'
    })
  } else if (!req.product?.isSelling) {
    res.status(404).json({
      error: 'Sản phẩm đang tạm thời bị ẩn'
    })
  }

  ProductModel.findOne({
    _id: req.product?._id,
    isSelling: true,
    isActive: true
  })
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
    .populate('storeId', '_id name avatar isActive isOpen ownerId')
    .populate('brandId', '_id name')
    .exec()
    .then((product) => {
      if (!product) {
        res.status(500).json({
          error: 'Sản phẩm không tồn tại'
        })
      }
      res.status(200).json({
        success: 'Get product successfully',
        product
      })
    })
    .catch(() => {
      res.status(500).json({
        error: 'Sản phẩm không tồn tại'
      })
    })
}

export const createProduct: RequestHandler = (
  req: ProductRequest,
  res: Response
) => {
  const {
    name,
    description,
    price,
    salePrice,
    quantity,
    categoryId,
    brandId,
    variantValueIds
  } = req.fields || {}

  const listImages = req.filepaths

  let variantValueIdsArray: string[] = []
  if (variantValueIds) {
    variantValueIdsArray = variantValueIds.split('|')
  }

  const product = new ProductModel({
    name,
    description,
    price,
    salePrice,
    quantity,
    listImages,
    categoryId,
    brandId,
    variantValueIds: variantValueIdsArray,
    storeId: req.store?._id
  })

  product
    .save()
    .then((product) => {
      if (!product) {
        res.status(400).json({
          error: 'Create product failed'
        })
      }

      res.status(200).json({
        success: 'Create product successfully',
        product
      })
    })
    .catch((error) => {
      res.status(400).json({
        error: errorHandler(error as MongoError)
      })
    })
}

export const updateProduct: RequestHandler = (
  req: ProductRequest,
  res: Response
) => {
  const {
    name,
    description,
    price,
    salePrice,
    quantity,
    categoryId,
    brandId,
    variantValueIds
  } = req.fields || {}

  let variantValueIdsArray: string[] = []
  if (variantValueIds) {
    variantValueIdsArray = variantValueIds.split('|')
  }

  ProductModel.findOneAndUpdate(
    { _id: req.product?._id },
    {
      $set: {
        name,
        description,
        price,
        salePrice,
        quantity,
        categoryId,
        brandId,
        variantValueIds: variantValueIdsArray
      }
    },
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
    .populate('brandId', '_id name')
    .exec()
    .then((product) => {
      if (!product) {
        res.status(404).json({
          error: 'Product not found'
        })
      }

      res.status(200).json({
        success: 'Update product successfully',
        product
      })
    })
    .catch((error) => {
      res.status(400).json({
        error: errorHandler(error as MongoError)
      })
    })
}

export const activeAllProduct: RequestHandler = (
  req: ProductRequest,
  res: Response
) => {
  const { isActive } = req.body

  ProductModel.updateMany(
    { storeId: req.store?._id },
    { $set: { isActive } },
    { new: true }
  )
    .exec()
    .then(() => {
      res.status(200).json({
        success: 'Active/InActive store & products successfully',
        store: req.store
      })
    })
    .catch((error) => {
      res.status(400).json({
        error: errorHandler(error as MongoError)
      })
    })
}

export const activeProduct: RequestHandler = (
  req: ProductRequest,
  res: Response
) => {
  const { isActive } = req.body

  ProductModel.findOneAndUpdate(
    { _id: req.product?._id },
    { $set: { isActive } },
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
        success: 'Active/InActive product status successfully',
        product
      })
    })
    .catch((error) => {
      res.status(400).json({
        error: errorHandler(error as MongoError)
      })
    })
}

export const sellingProduct: RequestHandler = (
  req: ProductRequest,
  res: Response
) => {
  const { isSelling } = req.body

  ProductModel.findOneAndUpdate(
    { _id: req.product?._id },
    { $set: { isSelling } },
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
        success: 'Show/Hide product status successfully',
        product
      })
    })
    .catch((error) => {
      res.status(400).json({
        error: errorHandler(error as MongoError)
      })
    })
}
