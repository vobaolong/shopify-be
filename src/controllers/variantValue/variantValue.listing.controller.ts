import { RequestHandler } from 'express'
import { VariantValue } from '../../models/index.model'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { FilterType } from './variantValue.types'

export const getVariantValues: RequestHandler = async (req, res) => {
  try {
    const search = req.query.search?.toString() || ''
    const regex = '.*' + search + '.*'

    const sortBy = req.query.sortBy?.toString() || 'name'
    const order = ['asc', 'desc'].includes(req.query.order?.toString() || '')
      ? req.query.order?.toString() || 'asc'
      : 'asc'

    const limit =
      parseInt(req.query.limit?.toString() || '0') > 0
        ? parseInt(req.query.limit?.toString() || '0')
        : 6
    const page =
      parseInt(req.query.page?.toString() || '0') > 0
        ? parseInt(req.query.page?.toString() || '0')
        : 1

    const filter: FilterType = {
      search,
      sortBy,
      order,
      limit,
      pageCurrent: page
    }

    const filterArgs: Record<string, any> = {
      name: { $regex: regex, $options: 'i' },
      isDeleted: false
    }

    if (req.query.variantId) {
      filter.variantId = req.query.variantId.toString()
      filterArgs.variantId = req.query.variantId.toString()
    }

    const count = await VariantValue.countDocuments(filterArgs)
    const size = count
    const pageCount = Math.ceil(size / limit)
    filter.pageCount = pageCount

    if (count <= 0) {
      res.status(200).json({
        success: 'Load list variant values successfully',
        filter,
        size,
        variantValues: []
      })
      return
    }

    let skip = limit * (page - 1)
    if (page > pageCount) {
      skip = (pageCount - 1) * limit
    }

    const variantValues = await VariantValue.find(filterArgs)
      .sort({ [sortBy]: order === 'asc' ? 1 : -1, _id: 1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'variantId',
        select: '_id name isDeleted',
        populate: {
          path: 'categoryId',
          select: '_id name isDeleted'
        }
      })

    res.status(200).json({
      success: 'Load list variant values successfully',
      filter,
      size,
      variantValues
    })
  } catch (error) {
    res.status(500).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const getAllVariantValues: RequestHandler = async (req, res) => {
  try {
    const search = req.query.search?.toString() || ''
    const regex = '.*' + search + '.*'

    const filterArgs: Record<string, any> = {
      name: { $regex: regex, $options: 'i' },
      isDeleted: false
    }

    if (req.query.variantId) {
      filterArgs.variantId = req.query.variantId.toString()
    }

    const variantValues = await VariantValue.find(filterArgs)
      .sort({ name: 1, _id: 1 })
      .populate({
        path: 'variantId',
        select: '_id name isDeleted',
        populate: {
          path: 'categoryId',
          select: '_id name isDeleted'
        }
      })

    res.status(200).json({
      success: 'Load all variant values successfully',
      variantValues
    })
  } catch (error) {
    res.status(500).json({
      error: errorHandler(error as MongoError)
    })
  }
}
