import { Request, RequestHandler, RequestParamHandler } from 'express'
import Category, { ICategory } from '../models/category.model'
import fs from 'fs'
import { errorHandler, MongoError } from '../helpers/errorHandler'
import mongoose from 'mongoose'
import { FilterType } from '../types/controller.types'
import {
  CLOUDINARY_BASE_URL,
  uploadImage,
  deleteImage
} from '../helpers/cloudinary'

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

const deleteUploadedFile = (filepath?: string): void => {
  try {
    if (filepath) {
      fs.unlinkSync('public' + filepath)
    }
  } catch (error) {
    console.error('Error deleting file:', error)
  }
}

const deleteUploadedFiles = (filepaths: string[] = []): void => {
  filepaths.forEach((path) => deleteUploadedFile(path))
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
      deleteUploadedFile(req.filepaths?.[0])
      res.status(400).json({
        error: 'CategoryId invalid'
      })
      return
    }
    next()
  } catch (error) {
    deleteUploadedFile(req.filepaths?.[0])
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
      deleteUploadedFiles(req.filepaths || [])
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
    deleteUploadedFile(image)
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
    deleteUploadedFile(image)
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
  let imageUrl = req.category?.image // Start with current image URL
  const uploadedFilePath = req.filepaths?.[0] // Path of the newly uploaded file, if any

  if (uploadedFilePath) {
    // If a new file was uploaded, upload it to Cloudinary
    try {
      // Assuming uploadImage function exists and works correctly
      // You might need to import the uploadImage function from your Cloudinary helper file
      const uploadResult = await uploadImage(
        uploadedFilePath,
        'shopify/categories'
      ) // Specify a folder
      imageUrl = uploadResult.url // Use the full Cloudinary URL
      // Optionally, delete the old image from Cloudinary if req.category?.image was a Cloudinary URL
      // You would need to extract the publicId from the old URL and call deleteImage
      if (
        req.category?.image &&
        req.category.image.includes('res.cloudinary.com')
      ) {
        const oldPublicId = req.category.image.split('/').pop()?.split('.')[0]
        if (oldPublicId) {
          await deleteImage(`shopify/categories/${oldPublicId}`) // Use imported function
        }
      }
    } catch (uploadError) {
      console.error('Error uploading image to Cloudinary:', uploadError)
      // Clean up the newly uploaded local file on error
      deleteUploadedFile(uploadedFilePath)
      res.status(500).json({ error: 'Failed to upload image' })
      return
    }
  } else if (!req.category?.image && !name) {
    // Case where no new image is uploaded and no old image exists, and no name is provided
    deleteUploadedFile(uploadedFilePath) // Should be undefined, but safe to call
    res.status(400).json({
      error: 'All fields are required (including image if not updating name)'
    })
    return
  } else if (imageUrl && imageUrl.startsWith('/uploads/')) {
    // If no new file uploaded, but old image is a local path, convert it
    imageUrl = `${CLOUDINARY_BASE_URL}/shopify/categories${imageUrl.replace(
      '/uploads',
      ''
    )}`
  }

  if (!categoryId) {
    categoryId = null
  } else if (categoryId == req.category?._id) {
    deleteUploadedFile(req.filepaths?.[0])
    res.status(400).json({
      error: 'categoryId invalid'
    })
    return
  }
  if (!name || !imageUrl) {
    // Check for name or the final image URL
    deleteUploadedFile(req.filepaths?.[0])
    res.status(400).json({
      error: 'All fields are required'
    })
    return
  }
  try {
    const category = await Category.findOneAndUpdate(
      { _id: req.category?._id },
      { $set: { name, image: imageUrl, categoryId } },
      { new: true }
    ).populate({
      path: 'categoryId',
      populate: { path: 'categoryId' }
    })
    if (!category) {
      deleteUploadedFile(req.filepaths?.[0])
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
    deleteUploadedFile(req.filepaths?.[0])
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
