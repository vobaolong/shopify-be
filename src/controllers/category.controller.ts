import { Request, RequestHandler, RequestParamHandler } from 'express'
import Category, { ICategory } from '../models/category.model'
import { errorHandler, MongoError } from '../helpers/errorHandler'
import mongoose from 'mongoose'
import { FilterType } from '../types/controller.types'
import { CLOUDINARY_BASE_URL, deleteImage } from '../helpers/cloudinary'

interface CategoryRequest extends Request {
  category?: ICategory
  filepaths?: string[]
  fields?: any
}

export const getCategoryById: RequestParamHandler = async (
  req: CategoryRequest,
  res,
  next,
  id: string
) => {
  try {
    const category = await Category.findById(id)
    if (!category) {
      res.status(404).json({
        error: 'Category not found'
      })
      return
    }
    req.category = category
    next()
  } catch (error) {
    res.status(404).json({
      error: 'Category not found'
    })
  }
}

export const getCategory: RequestHandler = async (
  req: CategoryRequest,
  res
) => {
  try {
    const category = await Category.findOne({
      _id: req.category?._id
    }).populate({
      path: 'categoryId',
      populate: { path: 'categoryId' }
    })
    if (!category) {
      res.status(500).json({
        error: 'Load category failed'
      })
      return
    }
    res.status(200).json({
      success: 'Load category successfully',
      category:
        category && category.toObject
          ? {
              ...category.toObject(),
              image:
                category.image && category.image.startsWith('/uploads/')
                  ? `${CLOUDINARY_BASE_URL}/shopify/categories${category.image.replace(
                      '/uploads',
                      ''
                    )}`
                  : category.image
            }
          : category
    })
  } catch (error) {
    res.status(500).json({
      error: 'Load category failed'
    })
  }
}

export const checkCategory: RequestHandler = async (
  req: CategoryRequest,
  res,
  next
) => {
  const fields = req.fields || {}
  const body = req.body || {}
  const categoryId = fields.categoryId || body.categoryId
  if (!categoryId) return next()
  try {
    const category = await Category.findOne({ _id: categoryId }).populate(
      'categoryId'
    )
    if (
      !category ||
      (category.categoryId && (category.categoryId as any).categoryId)
    ) {
      res.status(400).json({
        error: 'CategoryId invalid'
      })
      return
    }
    next()
  } catch (error) {
    res.status(400).json({
      error: 'CategoryId invalid'
    })
  }
}

export const checkCategoryChild: RequestHandler = async (
  req: CategoryRequest,
  res,
  next
) => {
  let categoryId = req.body.categoryId
  try {
    if (!categoryId && req.fields) {
      categoryId = req.fields.categoryId
    }
    const category = await Category.findOne({ categoryId })
    if (category) {
      res.status(400).json({
        error: 'CategoryId invalid'
      })
      return
    }
    next()
  } catch (error) {
    next()
  }
}

export const checkListCategoriesChild: RequestHandler = async (
  req: CategoryRequest,
  res,
  next
) => {
  const { categoryIds } = req.body
  try {
    const category = await Category.findOne({
      categoryId: { $in: categoryIds }
    })
    if (category) {
      res.status(400).json({
        error: 'categoryIds invalid'
      })
      return
    }
    next()
  } catch (error) {
    next()
  }
}

export const createCategory: RequestHandler = async (
  req: CategoryRequest,
  res
) => {
  const fields = req.fields || {}
  const body = req.body || {}
  const name = fields.name || body.name
  const categoryId = fields.categoryId || body.categoryId
  const image = req.file?.path

  if (!name) {
    res.status(400).json({
      error: 'All fields are required'
    })
    return
  }

  try {
    const category = new Category({
      name,
      categoryId,
      image
    })
    const savedCategory = await category.save()
    res.status(201).json({
      success: 'Creating category successfully',
      category: savedCategory.toObject
        ? savedCategory.toObject()
        : savedCategory
    })
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const updateCategory: RequestHandler = async (
  req: CategoryRequest,
  res
) => {
  const fields = req.fields || {}
  const body = req.body || {}
  let name = fields.name || body.name
  let categoryId = fields.categoryId || body.categoryId

  // Validate required name field
  if (!name) {
    res.status(400).json({
      error: 'Name field is required'
    })
    return
  }

  // Handle categoryId validation
  if (!categoryId) {
    categoryId = null
  } else if (categoryId == req.category?._id) {
    res.status(400).json({
      error: 'categoryId invalid'
    })
    return
  }

  // Build update object
  const updateData: any = { name, categoryId }

  // Handle image upload if a new file was uploaded
  if (req.file) {
    // Get public_id from old image URL if it's a Cloudinary image
    const oldImage = req.category?.image || ''
    let oldPublicId = null
    if (oldImage && oldImage.includes('cloudinary.com')) {
      const matches = oldImage.match(/\/upload\/v\d+\/([^/]+)\.\w+$/)
      if (matches && matches[1]) {
        oldPublicId = matches[1]
      }
    }

    // File has been uploaded by middleware uploadCategorySingle
    const imageUrl = req.file.path
    updateData.image = imageUrl

    // Delete old image from Cloudinary if it exists
    if (
      oldPublicId &&
      oldPublicId !== 'default' &&
      !oldImage.includes('/uploads/default.webp')
    ) {
      try {
        await deleteImage(oldPublicId)
      } catch (error) {
        console.error('Error deleting old category image:', error)
      }
    }
  }

  try {
    const category = await Category.findOneAndUpdate(
      { _id: req.category?._id },
      { $set: updateData },
      { new: true }
    ).populate({
      path: 'categoryId',
      populate: { path: 'categoryId' }
    })

    if (!category) {
      res.status(400).json({
        error: 'Update category failed'
      })
      return
    }
    res.status(200).json({
      success: 'Update category successfully',
      category: category.toObject ? category.toObject() : category
    })
  } catch (error) {
    res.status(500).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const removeCategory: RequestHandler = async (
  req: CategoryRequest,
  res
) => {
  try {
    const category = await Category.findOneAndUpdate(
      { _id: req.category?._id },
      { $set: { isDeleted: true } },
      { new: true }
    ).populate({
      path: 'categoryId',
      populate: { path: 'categoryId' }
    })
    if (!category) {
      res.status(404).json({
        error: 'category not found'
      })
      return
    }
    res.status(200).json({
      success: 'Remove category successfully'
    })
  } catch (error) {
    res.status(500).json({
      error: 'category not found'
    })
  }
}

export const restoreCategory: RequestHandler = async (
  req: CategoryRequest,
  res
) => {
  try {
    const category = await Category.findOneAndUpdate(
      { _id: req.category?._id },
      { $set: { isDeleted: false } },
      { new: true }
    ).populate({
      path: 'categoryId',
      populate: { path: 'categoryId' }
    })
    if (!category) {
      res.status(404).json({
        error: 'category not found'
      })
    }
    res.status(200).json({
      success: 'Restore category successfully'
    })
  } catch (error) {
    res.status(500).json({
      error: 'category not found'
    })
  }
}

export const getActiveCategories: RequestHandler = async (
  req: CategoryRequest,
  res
) => {
  const search = req.query.search?.toString() || ''
  const sortBy = req.query.sortBy?.toString() || '_id'
  const order =
    req.query.order && ['asc', 'desc'].includes(req.query.order.toString())
      ? (req.query.order.toString() as 'asc' | 'desc')
      : 'asc'
  const limit =
    req.query.limit && parseInt(req.query.limit.toString()) > 0
      ? parseInt(req.query.limit.toString())
      : 6
  const page =
    req.query.page && parseInt(req.query.page.toString()) > 0
      ? parseInt(req.query.page.toString())
      : 1
  const filter: FilterType = {
    search,
    sortBy,
    order,
    limit,
    pageCurrent: page
  }
  const filterArgs: Record<string, any> = {
    name: {
      $regex: search,
      $options: 'i'
    },
    isDeleted: false
  }
  if (req.query.categoryId) {
    filter.categoryId = req.query.categoryId.toString()
    filterArgs.categoryId =
      req.query.categoryId === 'null' ? null : req.query.categoryId
  }
  try {
    const count = await Category.countDocuments(filterArgs)
    const size = count
    const pageCount = Math.ceil(size / limit)
    filter.pageCount = pageCount

    let skip = limit * (page - 1)
    if (page > pageCount) {
      skip = (pageCount - 1) * limit
    }
    if (count <= 0) {
      res.status(200).json({
        success: 'Load list active categories successfully',
        filter,
        size,
        categories: []
      })
      return
    }
    const categories = await Category.find(filterArgs)
      .sort({ [sortBy]: order === 'asc' ? 1 : -1, _id: 1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'categoryId',
        populate: { path: 'categoryId' }
      })
    const plainCategories = categories.map((cat) =>
      cat.toObject ? cat.toObject() : cat
    )
    res.status(200).json({
      success: 'Load list active categories successfully',
      filter,
      size,
      categories: plainCategories
    })
  } catch (error) {
    res.status(500).json({
      error: 'Load list active categories failed'
    })
  }
}

export const getCategories: RequestHandler = async (
  req: CategoryRequest,
  res
) => {
  const search = (req.query.search as string) || ''
  const sortBy = (req.query.sortBy as string) || '_id'
  const order =
    req.query.order && ['asc', 'desc'].includes(req.query.order as string)
      ? (req.query.order as 'asc' | 'desc')
      : 'asc'
  const limit =
    req.query.limit && parseInt(req.query.limit as string) > 0
      ? parseInt(req.query.limit as string)
      : 6
  const page =
    req.query.page && parseInt(req.query.page as string) > 0
      ? parseInt(req.query.page as string)
      : 1

  const filter: FilterType = {
    search,
    sortBy,
    order,
    limit,
    pageCurrent: page
  }
  const filterArgs: any = {
    name: {
      $regex: search,
      $options: 'i'
    }
  }
  if (req.query.categoryId) {
    filter.categoryId = req.query.categoryId as string
    filterArgs.categoryId =
      req.query.categoryId === 'null' ? null : req.query.categoryId
  }
  try {
    const count = await Category.countDocuments(filterArgs)
    const size = count
    const pageCount = Math.ceil(size / limit)
    filter.pageCount = pageCount

    let skip = limit * (page - 1)
    if (page > pageCount) {
      skip = (pageCount - 1) * limit
    }
    if (count <= 0) {
      res.status(200).json({
        success: 'Load list categories successfully',
        filter,
        size,
        categories: []
      })
      return
    }
    const categories = await Category.find(filterArgs)
      .sort({ [sortBy]: order, _id: 1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'categoryId',
        populate: { path: 'categoryId' }
      })
    const plainCategories = categories.map((cat) =>
      cat.toObject ? cat.toObject() : cat
    )
    res.status(200).json({
      success: 'Load list categories successfully',
      filter,
      size,
      categories: plainCategories.map((cat) => ({
        ...cat,
        image:
          cat.image && cat.image.startsWith('/uploads/')
            ? `${CLOUDINARY_BASE_URL}/shopify/categories${cat.image.replace(
                '/uploads',
                ''
              )}`
            : cat.image
      }))
    })
  } catch (error) {
    res.status(500).json({
      error: 'Load list categories failed'
    })
  }
}

interface StoreRequest extends CategoryRequest {
  loadedCategories?: mongoose.Types.ObjectId[]
}

export const getCategoriesByStore: RequestHandler = async (
  req: StoreRequest,
  res
) => {
  try {
    const categories = await Category.find({
      _id: { $in: req.loadedCategories || [] },
      isDeleted: false
    }).populate({
      path: 'categoryId',
      populate: {
        path: 'categoryId'
      }
    })
    const plainCategories = categories.map((cat) =>
      cat.toObject ? cat.toObject() : cat
    )
    res.status(200).json({
      success: 'Load list categories of store successfully',
      categories: plainCategories
    })
  } catch (error) {
    res.status(500).json({
      success: 'Load list categories of store failed'
    })
  }
}
