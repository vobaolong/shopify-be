import { Request, Response, RequestHandler } from 'express'
import {
	Report,
	Notification,
	Store,
	Product,
	Review
} from '../models/index.model'
import { IReport } from '../models/report.model'
import { errorHandler, MongoError } from '../helpers/errorHandler'

interface ReportRequest extends Request {
	query: {
		search?: string;
		sortBy?: string;
		order?: string;
		limit?: string;
		page?: string;
		isStore?: string;
		isProduct?: string;
		isReview?: string;
	};
	body: {
		objectId?: string;
		isStore?: boolean;
		isProduct?: boolean;
		isReview?: boolean;
		reason?: string;
		reportBy?: string;
	};
	params: {
		id?: string;
		userId?: string;
	};
}

interface FilterOptions {
	search: string;
	isStore: boolean;
	isProduct: boolean;
	isReview: boolean;
	sortBy: string;
	order: string;
	limit: number;
	pageCurrent: number;
	pageCount?: number;
}

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
			.populate('reportBy', '_id firstName lastName email')

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
