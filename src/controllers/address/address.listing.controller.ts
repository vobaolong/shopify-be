import { RequestHandler } from 'express'
import Address from '../../models/address.model'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { AuthenticatedRequest, PaginationInfo } from './address.types'

export const getAddresses: RequestHandler = async (
  req: AuthenticatedRequest,
  res
) => {
  try {
    const search = req.query.search as string
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const sortBy = (req.query.sortBy as string) || 'createdAt'
    const sortOrder = (req.query.sortOrder as string) || 'desc'

    let query: any = {}

    if (search) {
      query = {
        $or: [
          { provinceName: { $regex: search, $options: 'i' } },
          { districtName: { $regex: search, $options: 'i' } },
          { wardName: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } }
        ]
      }
    }

    if (req.query.provinceID) {
      query.provinceID = req.query.provinceID
    }

    if (req.query.districtID) {
      query.districtID = req.query.districtID
    }

    if (req.query.wardID) {
      query.wardID = req.query.wardID
    }

    const total = await Address.countDocuments(query)
    const totalPages = Math.ceil(total / limit)
    const skip = (page - 1) * limit

    const sortOptions: any = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    const addresses = await Address.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)

    const pagination: PaginationInfo = {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit
    }

    res.status(200).json({
      success: 'Get addresses successfully',
      addresses,
      pagination
    })
  } catch (error) {
    res.status(500).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const getBulkAddresses: RequestHandler = async (
  req: AuthenticatedRequest,
  res
) => {
  try {
    const { ids } = req.body

    if (!ids || !Array.isArray(ids)) {
      res.status(400).json({
        error: 'IDs array is required'
      })
      return
    }

    const addresses = await Address.find({ _id: { $in: ids } })

    res.status(200).json({
      success: 'Get bulk addresses successfully',
      addresses
    })
  } catch (error) {
    res.status(500).json({
      error: errorHandler(error as MongoError)
    })
  }
}
