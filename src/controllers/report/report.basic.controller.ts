import { RequestHandler, Response } from 'express'
import { Report, Notification } from '../../models/index.model'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { ReportRequest } from './report.types'

export const createReport: RequestHandler = async (
  req: ReportRequest,
  res: Response
) => {
  try {
    const { objectId, isStore, isProduct, isReview, reason, reportBy } =
      req.body
    const onModel = isStore
      ? 'Store'
      : isProduct
      ? 'Product'
      : isReview
      ? 'Review'
      : null
    if (!onModel) {
      res.status(400).json({ message: 'Invalid report type' })
      return
    }
    const report = new Report({
      objectId,
      isStore,
      isProduct,
      isReview,
      reason,
      reportBy,
      onModel
    })
    await report.save()
    const adminId = process.env.ADMIN_ID
    const reportType = isStore
      ? 'Báo cáo shop mới'
      : isProduct
      ? 'Báo cáo sản phẩm mới'
      : 'Báo cáo đánh giá mới'
    const adminNotification = new Notification({
      message: `${reportType}: ${reason}`,
      userId: adminId,
      isRead: false,
      objectId: `Mã đối tượng: ${objectId}`
    })
    await adminNotification.save()
    res.status(201).json({ message: 'Report submitted successfully' })
  } catch (error) {
    res.status(500).json({ error: errorHandler(error as MongoError) })
  }
}

export const deleteReport: RequestHandler = async (
  req: ReportRequest,
  res: Response
) => {
  try {
    await Report.deleteOne({ _id: req.params.id })
    res.status(200).json({ message: 'Delete successfully' })
  } catch (error) {
    res.status(500).json({ error: errorHandler(error as MongoError) })
  }
}
