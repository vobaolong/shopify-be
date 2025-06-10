import { RequestHandler, Response } from 'express'
import {
  Report,
  Notification,
  Store,
  Product,
  Review
} from '../../models/index.model'
import { IReport } from '../../models/report.model'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { ReportRequest, FilterOptions } from './report.types'

export const getReports: RequestHandler = async (
  req: ReportRequest,
  res: Response
) => {
  try {
    const {
      search = '',
      sortBy = 'createdAt',
      order = 'desc',
      limit = '6',
      page = '1',
      isStore = 'false',
      isProduct = 'false',
      isReview = 'false'
    } = req.query

    const skip = parseInt(limit) * (parseInt(page) - 1)
    const filterCondition: any = {
      ...(isStore === 'true' && { isStore: true }),
      ...(isProduct === 'true' && { isProduct: true }),
      ...(isReview === 'true' && { isReview: true })
    }

    const filter: FilterOptions = {
      search,
      isStore: isStore === 'true',
      isProduct: isProduct === 'true',
      isReview: isReview === 'true',
      sortBy,
      order,
      limit: parseInt(limit),
      pageCurrent: parseInt(page)
    }

    const size = await Report.countDocuments(filterCondition)
    const pageCount = Math.ceil(size / parseInt(limit))
    filter.pageCount = pageCount

    if (size <= 0) {
      res.status(200).json({
        success: 'Load list reports successfully',
        filter,
        size,
        reports: []
      })
      return
    }

    const reports = await Report.find(filterCondition)
      .sort({ [sortBy]: order === 'asc' ? 1 : -1, _id: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('reportBy', '_id userName name email')

    const newReports = await Promise.all(
      reports.map(async (report: IReport) => {
        let object = null
        if (report.isStore) {
          object = await Store.findById(report.objectId)
        } else if (report.isProduct) {
          object = await Product.findById(report.objectId)
        } else if (report.isReview) {
          object = await Review.findById(report.objectId)
        }
        if (!object) return report
        return { ...report.toObject(), objectId: object.toObject() }
      })
    )

    res.status(200).json({
      success: 'Load list reports successfully',
      filter,
      size,
      reports: newReports
    })
  } catch (error) {
    res.status(500).json({ error: errorHandler(error as MongoError) })
  }
}
