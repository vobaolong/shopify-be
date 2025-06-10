import { RequestHandler, RequestParamHandler } from 'express'
import Category from '../../models/category.model'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { CLOUDINARY_BASE_URL, deleteImage } from '../../helpers/cloudinary'
import { CategoryRequest } from './category.types'

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
  try {
    const categories = await Category.find({
      categoryId: req.category?._id
    }).exec()
    if (categories && categories.length > 0) {
      res.status(400).json({
        error: 'Delete child categories firstly'
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
  try {
    const category = new Category(req.body)
    const error = category.validateSync()
    if (error) {
      res.status(400).json({
        error: errorHandler(error as MongoError)
      })
      return
    }
    const savedCategory = await category.save()
    res.status(200).json({
      success: 'Create category successfully',
      category: savedCategory
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
  try {
    let { image } = req.body
    if (req.filepaths && req.filepaths.length > 0) {
      image = req.filepaths[0]
    }
    const newCategory = { ...req.body }
    if (image) newCategory.image = image

    const category = await Category.findOneAndUpdate(
      { _id: req.category?._id },
      { $set: newCategory },
      { new: true }
    ).populate({
      path: 'categoryId',
      populate: { path: 'categoryId' }
    })

    if (!category) {
      res.status(404).json({
        error: 'Category not found'
      })
      return
    }

    // Delete old image if there's a new one
    if (
      req.filepaths &&
      req.filepaths.length > 0 &&
      req.category?.image &&
      req.category.image !== '/default-category.jpg'
    ) {
      await deleteImage(req.category.image)
    }

    res.status(200).json({
      success: 'Update category successfully',
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
    res.status(400).json({
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
    )
    if (!category) {
      res.status(500).json({
        error: 'Category not found'
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
