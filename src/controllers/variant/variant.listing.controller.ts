import { RequestHandler } from 'express'
import { Variant } from '../../models/index.model'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { FilterType } from './variant.types'

export const getVariants: RequestHandler = async (req, res) => {
  try {
    const search = req.query.search?.toString() || ''
    const regex = '.*' + search + '.*'

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
      name: { $regex: regex, $options: 'i' },
      isDeleted: false
    }

    if (req.query.categoryId) {
      filter.categoryId = req.query.categoryId.toString()
      filterArgs.categoryIds = req.query.categoryId.toString()
    }

    const size = await Variant.countDocuments(filterArgs)

    const pageCount = Math.ceil(size / limit)
    filter.pageCount = pageCount

    if (size <= 0) {
      res.status(200).json({
        success: 'Load list variants successfully',
        filter,
        size,
        variants: []
      })
      return
    }

    const variants = await Variant.find(filterArgs)
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
      success: 'Load list variants successfully',
      filter,
      size,
      variants
    })
  } catch (error) {
    res.status(500).json({
      error: errorHandler(error as MongoError)
    })
  }
}
