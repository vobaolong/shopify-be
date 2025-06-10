import { Brand } from '../../models/index.model'
import { RequestHandler } from 'express'
import { FilterType } from '../../types/controller.types'
import { BrandRequest } from './brand.types'

// Brand listing and search operations
export const getBrandCategories: RequestHandler = async (
  req: BrandRequest,
  res
) => {
  try {
    const search = req.query.search?.toString() || ''
    const sortBy = req.query.sortBy?.toString() || '_id'
    const order =
      req.query.order?.toString() &&
      ['asc', 'desc'].includes(req.query.order?.toString())
        ? req.query.order?.toString()
        : 'asc'
    const limit =
      req.query.limit && parseInt(req.query.limit.toString()) > 0
        ? parseInt(req.query.limit.toString())
        : 6
    const page =
      req.query.page && parseInt(req.query.page.toString()) > 0
        ? parseInt(req.query.page.toString())
        : 1
    const categoryId = req.query.categoryId?.toString()

    let skip = limit * (page - 1)

    const filter: FilterType = {
      search,
      sortBy,
      categoryId,
      order,
      limit,
      pageCurrent: page
    }

    const filterArgs: Record<string, any> = {
      name: { $regex: search, $options: 'i' },
      isDeleted: false
    }

    if (categoryId) {
      filterArgs.categoryIds = categoryId
    }

    const count = await Brand.countDocuments(filterArgs)

    const size = count
    const pageCount = Math.ceil(size / limit)
    filter.pageCount = pageCount

    if (page > pageCount && pageCount > 0) {
      skip = (pageCount - 1) * limit
    }

    if (count <= 0) {
      res.status(200).json({
        success: 'Load list active brands successfully',
        filter,
        size,
        brands: []
      })
      return
    }

    const brands = await Brand.find(filterArgs)
      .sort({ [sortBy]: order === 'asc' ? 1 : -1, _id: 1 })
      .skip(skip)
      .limit(limit)
      .exec()

    res.status(200).json({
      success: 'Load list active brands successfully',
      filter,
      size,
      brands
    })
  } catch (error) {
    res.status(500).json({
      error: 'Load list active brands failed'
    })
  }
}

export const listBrands: RequestHandler = async (req: BrandRequest, res) => {
  try {
    const search = req.query.search?.toString() || ''
    const sortBy = req.query.sortBy?.toString() || 'name'
    const order =
      req.query.order?.toString() &&
      ['asc', 'desc'].includes(req.query.order?.toString())
        ? req.query.order?.toString()
        : 'asc'
    const limit =
      req.query.limit && parseInt(req.query.limit.toString()) > 0
        ? parseInt(req.query.limit.toString())
        : 6
    const page =
      req.query.page && parseInt(req.query.page.toString()) > 0
        ? parseInt(req.query.page.toString())
        : 1

    let skip = limit * (page - 1)

    const filter: FilterType = {
      search,
      sortBy,
      order,
      limit,
      pageCurrent: page
    }

    const filterArgs: Record<string, any> = {
      name: { $regex: search, $options: 'i' }
    }

    if (req.query.categoryId) {
      filter.categoryId = req.query.categoryId.toString()
      filterArgs.categoryIds = req.query.categoryId.toString()
    }

    const size = await Brand.countDocuments(filterArgs)

    const pageCount = Math.ceil(size / limit)
    filter.pageCount = pageCount

    if (page > pageCount && pageCount > 0) {
      skip = (pageCount - 1) * limit
    }

    if (size <= 0) {
      res.status(200).json({
        success: 'Load list brands successfully',
        filter,
        size,
        brands: []
      })
      return
    }

    const brands = await Brand.find(filterArgs)
      .sort({ [sortBy]: order === 'asc' ? 1 : -1, _id: 1 })
      .populate({
        path: 'categoryIds',
        populate: {
          path: 'categoryId',
          populate: { path: 'categoryId' }
        }
      })
      .skip(skip)
      .limit(limit)
      .exec()

    res.status(200).json({
      success: 'Load list brands successfully',
      filter,
      size,
      brands
    })
  } catch (error) {
    res.status(500).json({
      error: 'Load list brands failed'
    })
  }
}
