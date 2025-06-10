import { RequestHandler } from 'express'
import Category from '../../models/category.model'
import { FilterType } from '../../types/controller.types'
import { CLOUDINARY_BASE_URL } from '../../helpers/cloudinary'
import { CategoryRequest } from './category.types'

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

export const getCategoriesByStore: RequestHandler = async (
  req: CategoryRequest,
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
