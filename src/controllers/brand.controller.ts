import { Brand } from '../models/index.model'
import { errorHandler, MongoError } from '../helpers/errorHandler'
import { RequestHandler, RequestParamHandler } from 'express'
import { FilterType } from '../types/controller.types'

export const getBrandById: RequestParamHandler = async (
  req,
  res,
  next,
  id: string
) => {
  try {
    const brand = await Brand.findById(id).exec()
    if (!brand) {
      res.status(404).json({
        error: 'Brand not found'
      })
      return
    }
    req.brand = brand || undefined
    next()
  } catch (error) {
    res.status(404).json({
      error: 'Brand not found'
    })
  }
}

export const getBrand: RequestHandler = async (req, res) => {
  try {
    const brand = await Brand.findOne({ _id: req.brand?._id })
      .populate({
        path: 'categoryIds',
        populate: {
          path: 'categoryId',
          populate: {
            path: 'categoryId'
          }
        }
      })
      .exec()
    if (!brand) {
      res.status(500).json({
        error: 'Load brand failed'
      })
      return
    }
    res.status(200).json({
      success: 'Load brand successfully',
      brand
    })
  } catch (error) {
    res.status(500).json({
      error: 'Load brand failed'
    })
  }
}

export const checkBrand: RequestHandler = async (req, res, next) => {
  try {
    const { name, categoryIds } = req.body
    const brandId = req.brand ? req.brand._id : null
    const existingBrand = await Brand.findOne({
      _id: { $ne: brandId },
      name,
      categoryIds
    }).exec()
    if (!existingBrand) {
      if (next) next()
      return
    }
    res.status(400).json({
      error: 'Brand already exists'
    })
  } catch (error) {
    if (next) next()
  }
}

export const createBrand: RequestHandler = async (req, res) => {
  try {
    const { name, categoryIds } = req.body

    if (!name || !categoryIds) {
      res.status(400).json({
        error: 'All fields are required'
      })
      return
    }

    const brand = new Brand({
      name,
      categoryIds
    })

    const savedBrand = await brand.save()

    res.status(201).json({
      success: 'Create brand successfully',
      brand: savedBrand
    })
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const updateBrand: RequestHandler = async (req, res) => {
  try {
    const { name, categoryIds } = req.body
    if (!name || !categoryIds) {
      res.status(400).json({
        error: 'All fields are required'
      })
      return
    }
    const brand = await Brand.findOneAndUpdate(
      { _id: req.brand?._id },
      { $set: { name, categoryIds } },
      { new: true }
    ).exec()
    if (!brand) {
      res.status(500).json({
        error: 'Brand not found'
      })
      return
    }
    res.status(200).json({
      success: 'Update brand successfully',
      brand
    })
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const removeBrand: RequestHandler = async (req, res, next) => {
  try {
    const brand = await Brand.findOneAndUpdate(
      { _id: req.brand?._id },
      { $set: { isDeleted: true } },
      { new: true }
    ).exec()

    if (!brand) {
      res.status(500).json({
        error: 'Brand not found'
      })
      return
    }
    req.brand = brand || undefined
    if (next) next()
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const restoreBrand: RequestHandler = async (req, res, next) => {
  try {
    const brand = await Brand.findOneAndUpdate(
      { _id: req.brand?._id },
      { $set: { isDeleted: false } },
      { new: true }
    ).exec()
    if (!brand) {
      res.status(500).json({
        error: 'Brand not found'
      })
      return
    }
    req.brand = brand || undefined
    if (next) next()
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const getBrandCategories: RequestHandler = async (req, res) => {
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

export const listBrands: RequestHandler = async (req, res) => {
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

    const count = await Brand.countDocuments(filterArgs)

    const size = count
    const pageCount = Math.ceil(size / limit)
    filter.pageCount = pageCount

    if (page > pageCount && pageCount > 0) {
      skip = (pageCount - 1) * limit
    }

    if (count <= 0) {
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

export const checkBrandNameExist: RequestHandler = async (req, res) => {
  try {
    const { name } = req.query
    if (!name) {
      res.status(400).json({ exists: false, error: 'Missing name' })
      return
    }
    const brandId = req.query.brandId
    const query: any = { name: { $regex: new RegExp(`^${name}$`, 'i') } }
    if (brandId) {
      query._id = { $ne: brandId }
    }
    const exists = await Brand.exists(query)
    res.json({ exists: !!exists })
  } catch (error) {
    res.status(500).json({ exists: false, error: 'Server error' })
  }
}
