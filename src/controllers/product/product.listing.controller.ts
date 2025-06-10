import { Response, RequestHandler } from 'express'
import ProductModel from '../../models/product.model'
import { ProductRequest, FilterType } from './product.types'

// Product listing and querying operations
export const getProductCategories: RequestHandler = (
  req: ProductRequest,
  res,
  next
) => {
  ProductModel.distinct('categoryId', { isActive: true, isSelling: true })
    .exec()
    .then((categories) => {
      req.loadedCategories = categories
      next()
    })
    .catch(() => {
      res.status(400).json({
        error: 'Category not found'
      })
    })
}

export const getProductCategoriesByStore: RequestHandler = (
  req: ProductRequest,
  res,
  next
) => {
  ProductModel.distinct('categoryId', {
    storeId: req.store?._id,
    isActive: true,
    isSelling: true
  })
    .exec()
    .then((categories) => {
      req.loadedCategories = categories
      next()
    })
    .catch(() => {
      res.status(400).json({
        error: 'Categories not found'
      })
    })
}

export const getProducts: RequestHandler = (
  req: ProductRequest,
  res: Response
) => {
  const search = req.query.search ? (req.query.search as string) : ''
  const sortBy = req.query.sortBy ? (req.query.sortBy as string) : '_id'
  const order =
    req.query.order && (req.query.order === 'asc' || req.query.order === 'desc')
      ? req.query.order
      : 'asc'

  const limit =
    req.query.limit && parseInt(req.query.limit as string) > 0
      ? parseInt(req.query.limit as string)
      : 6
  const page =
    req.query.page && parseInt(req.query.page as string) > 0
      ? parseInt(req.query.page as string)
      : 1
  let skip = limit * (page - 1)

  const categoryId = req.loadedCategories || []

  const rating =
    req.query.rating &&
    parseInt(req.query.rating as string) > 0 &&
    parseInt(req.query.rating as string) < 6
      ? parseInt(req.query.rating as string)
      : -1
  const minPrice =
    req.query.minPrice && parseInt(req.query.minPrice as string) > 0
      ? parseInt(req.query.minPrice as string)
      : -1
  const maxPrice =
    req.query.maxPrice && parseInt(req.query.maxPrice as string) > 0
      ? parseInt(req.query.maxPrice as string)
      : -1
  const provinces = req.query.provinces as string[]

  const filter: FilterType = {
    search,
    sortBy,
    order,
    categoryId,
    rating,
    minPrice,
    maxPrice,
    limit,
    pageCurrent: page
  }

  const filterArgs: any = {
    $or: [
      {
        name: {
          $regex: search,
          $options: 'i'
        }
      }
    ],
    categoryId: { $in: categoryId },
    isActive: true,
    isSelling: true
  }

  if (rating !== -1) filterArgs.rating = { $gte: rating }
  if (minPrice !== -1) filterArgs.salePrice = { $gte: minPrice }
  if (maxPrice !== -1) {
    if (filterArgs.salePrice) {
      filterArgs.salePrice.$lte = maxPrice
    } else {
      filterArgs.salePrice = { $lte: maxPrice }
    }
  }

  ProductModel.countDocuments(filterArgs)
    .exec()
    .then((count: number) => {
      const size = count
      const pageCount = Math.ceil(size / limit)
      filter.pageCount = pageCount

      if (page > pageCount) {
        skip = Math.max(0, (pageCount - 1) * limit)
      }

      if (count <= 0) {
        res.status(200).json({
          success: 'Load list products successfully',
          filter,
          size,
          products: []
        })
      }

      ProductModel.find(filterArgs)
        .sort({ [sortBy]: order, _id: 1 })
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
        .populate('storeId', '_id name avatar isActive isOpen address')
        .populate('brandId', '_id name')
        .exec()
        .then((products: any) => {
          if (!products || products.length === 0) {
            res.status(200).json({
              success: 'Load list products successfully',
              filter,
              size: 0,
              products: []
            })
            return
          }

          if (provinces) {
            const newProducts = products.filter((pr: any) => {
              for (let i = 0; i < provinces.length; i++) {
                if (pr.storeId.address.includes(provinces[i])) true
              }
              return false
            })

            const size1 = newProducts.length
            const pageCount1 = Math.ceil(size1 / limit)
            filter.pageCount = pageCount1

            res.status(200).json({
              success: 'Load list products successfully',
              filter,
              size,
              products: newProducts
            })
          }

          res.status(200).json({
            success: 'Load list products successfully',
            filter,
            size,
            products
          })
        })
        .catch((error) => {
          console.error('Error loading products:', error)
          res.status(500).json({
            error: 'Load list products failed'
          })
        })
    })
    .catch((error) => {
      console.error('Error counting products:', error)
      res.status(500).json({
        error: 'Count products failed'
      })
    })
}

export const getProductsByStore: RequestHandler = (
  req: ProductRequest,
  res: Response
) => {
  const search = req.query.search ? (req.query.search as string) : ''
  const sortBy = req.query.sortBy ? (req.query.sortBy as string) : '_id'
  const order =
    req.query.order && (req.query.order === 'asc' || req.query.order === 'desc')
      ? req.query.order
      : 'asc'

  const limit =
    req.query.limit && parseInt(req.query.limit as string) > 0
      ? parseInt(req.query.limit as string)
      : 6
  const page =
    req.query.page && parseInt(req.query.page as string) > 0
      ? parseInt(req.query.page as string)
      : 1
  let skip = limit * (page - 1)

  const categoryId = req.query.categoryId
    ? [req.query.categoryId as string]
    : req.loadedCategories

  const brandId = req.query.brandId
    ? [req.query.brandId as string]
    : req.loadedBrands

  const rating =
    req.query.rating &&
    parseInt(req.query.rating as string) > 0 &&
    parseInt(req.query.rating as string) < 6
      ? parseInt(req.query.rating as string)
      : -1
  const minPrice =
    req.query.minPrice && parseInt(req.query.minPrice as string) > 0
      ? parseInt(req.query.minPrice as string)
      : -1
  const maxPrice =
    req.query.maxPrice && parseInt(req.query.maxPrice as string) > 0
      ? parseInt(req.query.maxPrice as string)
      : -1

  const filter: FilterType = {
    search,
    sortBy,
    order,
    categoryId,
    brandId,
    rating,
    minPrice,
    maxPrice,
    limit,
    pageCurrent: page,
    storeId: req.store?._id
  }

  const filterArgs: any = {
    $or: [
      {
        name: {
          $regex: search,
          $options: 'i'
        }
      }
    ],
    categoryId: { $in: categoryId },
    brandId: { $in: brandId },
    isActive: true,
    isSelling: true,
    storeId: req.store?._id
  }

  if (rating !== -1) filterArgs.rating = { $gte: rating }
  if (minPrice !== -1) filterArgs.salePrice = { $gte: minPrice }
  if (maxPrice !== -1) {
    if (filterArgs.salePrice) {
      filterArgs.salePrice.$lte = maxPrice
    } else {
      filterArgs.salePrice = { $lte: maxPrice }
    }
  }

  ProductModel.countDocuments(filterArgs)
    .exec()
    .then((count: number) => {
      const size = count
      const pageCount = Math.ceil(size / limit)
      filter.pageCount = pageCount

      if (page > pageCount) {
        skip = Math.max(0, (pageCount - 1) * limit)
      }

      if (count <= 0) {
        res.status(200).json({
          success: 'Load list products successfully',
          filter,
          size,
          products: []
        })
      }

      ProductModel.find(filterArgs)
        .sort({ [sortBy]: order, _id: 1 })
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
        .populate('brandId', '_id name')
        .exec()
        .then((products: any) => {
          if (!products || products.length === 0) {
            res.status(200).json({
              success: 'Load list products successfully',
              filter,
              size: 0,
              products: []
            })
          }

          res.status(200).json({
            success: 'Load list products successfully',
            filter,
            size,
            products
          })
        })
        .catch((error) => {
          console.error('Error fetching products:', error)
          res.status(500).json({
            error: 'Load list products failed'
          })
        })
      return
    })
    .catch((error) => {
      res.status(500).json({
        error: 'Count products failed'
      })
    })
}

export const getStoreProductsForSeller: RequestHandler = (
  req: ProductRequest,
  res: Response
) => {
  const search = req.query.search ? (req.query.search as string) : ''
  const sortBy = req.query.sortBy ? (req.query.sortBy as string) : '_id'
  const order =
    req.query.order && (req.query.order === 'asc' || req.query.order === 'desc')
      ? req.query.order
      : 'asc'

  const limit =
    req.query.limit && parseInt(req.query.limit as string) > 0
      ? parseInt(req.query.limit as string)
      : 6
  const page =
    req.query.page && parseInt(req.query.page as string) > 0
      ? parseInt(req.query.page as string)
      : 1
  let skip = limit * (page - 1)

  let isSelling = [true, false]
  if (req.query.isSelling === 'true') isSelling = [true]
  if (req.query.isSelling === 'false') isSelling = [false]

  let isActive = [true, false]
  if (req.query.isActive === 'true') isActive = [true]
  if (req.query.isActive === 'false') isActive = [false]

  const quantity = req.query.quantity === '0' ? 0 : -1

  const filter: FilterType = {
    search,
    sortBy,
    order,
    isSelling,
    isActive,
    limit,
    pageCurrent: page,
    storeId: req.store._id,
    quantity: quantity !== -1 ? quantity : 'all'
  }

  const filterArgs: any = {
    $or: [
      {
        name: {
          $regex: search,
          $options: 'i'
        }
      }
    ],
    isSelling: { $in: isSelling },
    isActive: { $in: isActive },
    storeId: req.store._id
  }

  if (quantity === 0) filterArgs.quantity = quantity

  ProductModel.countDocuments(filterArgs)
    .exec()
    .then((count) => {
      const size = count
      const pageCount = Math.ceil(size / limit)
      filter.pageCount = pageCount

      if (page > pageCount) {
        skip = Math.max(0, (pageCount - 1) * limit)
      }

      if (count <= 0) {
        res.status(200).json({
          success: 'Load list products successfully',
          filter,
          size,
          products: []
        })
      }

      ProductModel.find(filterArgs)
        .sort({ [sortBy]: order, _id: 1 })
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
        .populate('brandId', '_id name')
        .exec()
        .then((products: any) => {
          if (!products || products.length === 0) {
            res.status(200).json({
              success: 'Load list products successfully',
              filter,
              size: 0,
              products: []
            })
          }

          res.status(200).json({
            success: 'Load list products successfully',
            filter,
            size,
            products
          })
        })
        .catch((error) => {
          console.error('Error fetching products:', error)
          res.status(500).json({
            error: 'Load list products failed'
          })
        })
      return
    })
    .catch((error) => {
      res.status(500).json({
        error: 'Count products failed'
      })
    })
}

export const getProductsForAdmin: RequestHandler = (
  req: ProductRequest,
  res: Response
) => {
  const search = req.query.search ? (req.query.search as string) : ''
  const sortBy = req.query.sortBy ? (req.query.sortBy as string) : '_id'
  const order =
    req.query.order && (req.query.order === 'asc' || req.query.order === 'desc')
      ? req.query.order
      : 'asc'

  const limit =
    req.query.limit && parseInt(req.query.limit as string) > 0
      ? parseInt(req.query.limit as string)
      : 6
  const page =
    req.query.page && parseInt(req.query.page as string) > 0
      ? parseInt(req.query.page as string)
      : 1
  let skip = limit * (page - 1)

  let isActive = [true, false]
  if (req.query.isActive === 'true') isActive = [true]
  if (req.query.isActive === 'false') isActive = [false]

  const filter: FilterType = {
    search,
    sortBy,
    order,
    isActive,
    limit,
    pageCurrent: page
  }

  const filterArgs: any = {
    name: { $regex: search, $options: 'i' },
    isActive: { $in: isActive }
  }

  ProductModel.countDocuments(filterArgs)
    .exec()
    .then((count: number) => {
      const size = count
      const pageCount = Math.ceil(size / limit)
      filter.pageCount = pageCount

      if (page > pageCount) {
        skip = Math.max(0, (pageCount - 1) * limit)
      }

      if (count <= 0) {
        res.status(200).json({
          success: 'Load list products successfully',
          filter,
          size,
          products: []
        })
      }

      ProductModel.find(filterArgs)
        .sort({ [sortBy]: order, _id: 1 })
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
        .populate('storeId', '_id name avatar isActive isOpen ownerId')
        .populate('brandId', '_id name')
        .exec()
        .then((products: any) => {
          if (!products || products.length === 0) {
            res.status(200).json({
              success: 'Load list products successfully',
              filter,
              size: 0,
              products: []
            })
          }
          res.status(200).json({
            success: 'Load list products successfully',
            filter,
            size,
            products
          })
        })
        .catch((error) => {
          console.error('Error fetching products:', error)
          res.status(500).json({
            error: 'Load list products failed'
          })
        })
      return
    })
    .catch((error) => {
      res.status(404).json({
        error: 'Products not found'
      })
    })
}
