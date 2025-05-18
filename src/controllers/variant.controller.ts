import { Variant } from '../models/index.model'
import { errorHandler, MongoError } from '../helpers/errorHandler'
import { Request, Response, NextFunction, RequestHandler } from 'express'

export const getVariantById: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const variant = await Variant.findById(req.params.id)
		if (!variant) {
			res.status(404).json({ error: 'Variant not found' })
			return
		}
		(req as any).variant = variant
		next()
	} catch (error) {
		res.status(404).json({ error: 'Variant not found' })
	}
}

export const getVariant: RequestHandler = async (req: Request, res: Response) => {
	try {
		const variant = await Variant.findOne({ _id: (req as any).variant._id }).populate({
			path: 'categoryIds',
			populate: {
				path: 'categoryId',
				populate: { path: 'categoryId' }
			}
		})
		if (!variant) {
			res.status(500).json({ error: 'Load variant failed' })
			return
		}
		res.status(200).json({ success: 'Load variant successfully', variant })
	} catch (error) {
		res.status(500).json({ error: 'Load variant failed' })
	}
}

export const checkVariant: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { name, categoryIds } = req.body
		const variantId = (req as any).variant ? (req as any).variant._id : null
		const existingVariant = await Variant.findOne({
			_id: { $ne: variantId },
			name,
			categoryIds
		})
		if (existingVariant) {
			res.status(400).json({ error: 'Variant already exists' })
			return
		}
		next()
	} catch (error) {
		next()
	}
}

export const createVariant: RequestHandler = async (req: Request, res: Response) => {
	try {
		const { name, categoryIds } = req.body
		if (!name || !categoryIds) {
			res.status(400).json({ error: 'All fields are required' })
			return
		}
		const variant = new Variant({ name, categoryIds })
		const savedVariant = await variant.save()
		res.status(200).json({ success: 'Create variant successfully', variant: savedVariant })
	} catch (error) {
		res.status(400).json({ error: errorHandler(error as MongoError) })
	}
}

export const updateVariant: RequestHandler = async (req: Request, res: Response) => {
	try {
		const { name } = req.body
		if (!name) {
			res.status(400).json({ error: 'All fields are required' })
			return
		}
		const variant = await Variant.findOneAndUpdate(
			{ _id: (req as any).variant._id },
			{ $set: { name } },
			{ new: true }
		)
		if (!variant) {
			res.status(500).json({ error: 'variant not found' })
			return
		}
		res.status(200).json({ success: 'Update variant successfully', variant })
	} catch (error) {
		res.status(400).json({ error: errorHandler(error as MongoError) })
	}
}

export const removeVariant: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const variant = await Variant.findOneAndUpdate(
			{ _id: (req as any).variant._id },
			{ $set: { isDeleted: true } },
			{ new: true }
		)
		if (!variant) {
			res.status(500).json({ error: 'Variant not found' })
			return
		}
		req.body.variantId = (req as any).variant._id
		next()
		res.status(200).json({ success: 'remove variant successfully', variant })
	} catch (error) {
		res.status(400).json({ error: errorHandler(error as MongoError) })
	}
}

export const restoreVariant: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const variant = await Variant.findOneAndUpdate(
			{ _id: (req as any).variant._id },
			{ $set: { isDeleted: false } },
			{ new: true }
		)
		if (!variant) {
			res.status(500).json({ error: 'Variant not found' })
			return
		}
		req.body.variantId = (req as any).variant._id
		next()
		res.status(200).json({ success: 'restore variant successfully', variant })
	} catch (error) {
		res.status(400).json({ error: errorHandler(error as MongoError) })
	}
}

export const getActiveVariants: RequestHandler = async (req: Request, res: Response) => {
	try {
		const search = req.query.search ? req.query.search.toString() : ''
		const sortBy = req.query.sortBy ? req.query.sortBy.toString() : '_id'
		const order =
			req.query.order && (req.query.order.toString() === 'asc' || req.query.order.toString() === 'desc')
				? req.query.order.toString()
				: 'asc'
		const limit =
			req.query.limit && parseInt(req.query.limit.toString()) > 0 ? parseInt(req.query.limit.toString()) : 6
		const page =
			req.query.page && parseInt(req.query.page.toString()) > 0 ? parseInt(req.query.page.toString()) : 1
		let skip = limit * (page - 1)
		const categoryId = req.query.categoryId ? req.query.categoryId.toString() : null
		const filter: any = {
			search,
			categoryId,
			sortBy,
			order,
			limit,
			pageCurrent: page
		}
		const filterArgs: any = {
			name: { $regex: search, $options: 'i' },
			isDeleted: false
		}
		if (categoryId) {
			filterArgs.categoryIds = categoryId
		}
		const count = await Variant.countDocuments(filterArgs)
		const size = count
		const pageCount = Math.ceil(size / limit)
		filter.pageCount = pageCount
		if (page > pageCount) {
			skip = (pageCount - 1) * limit
		}
		if (count <= 0) {
			res.status(200).json({
				success: 'Load list active variants successfully',
				filter,
				size,
				variants: []
			})
			return
		}
		const sortObj: any = { _id: 1 }
		sortObj[sortBy] = order === 'asc' ? 1 : -1
		const variants = await Variant.find(filterArgs)
			.sort(sortObj)
			.skip(skip)
			.limit(limit)
		res.status(200).json({
			success: 'Load list active variants successfully',
			filter,
			size,
			variants
		})
	} catch (error) {
		res.status(500).json({ error: 'Load list active variants failed' })
	}
}

export const getVariants: RequestHandler = async (req: Request, res: Response) => {
	try {
		const search = req.query.search ? req.query.search.toString() : ''
		const sortBy = req.query.sortBy ? req.query.sortBy.toString() : '_id'
		const order =
			req.query.order && (req.query.order.toString() === 'asc' || req.query.order.toString() === 'desc')
				? req.query.order.toString()
				: 'asc'
		const limit =
			req.query.limit && parseInt(req.query.limit.toString()) > 0 ? parseInt(req.query.limit.toString()) : 6
		const page =
			req.query.page && parseInt(req.query.page.toString()) > 0 ? parseInt(req.query.page.toString()) : 1
		let skip = limit * (page - 1)
		const filter: any = {
			search,
			sortBy,
			order,
			limit,
			pageCurrent: page
		}
		const filterArgs: any = {
			name: { $regex: search, $options: 'i' }
		}
		if (req.query.categoryId) {
			filter.categoryId = req.query.categoryId.toString()
			filterArgs.categoryIds = req.query.categoryId.toString()
		}
		const count = await Variant.countDocuments(filterArgs)
		const size = count
		const pageCount = Math.ceil(size / limit)
		filter.pageCount = pageCount
		if (page > pageCount) {
			skip = (pageCount - 1) * limit
		}
		if (count <= 0) {
			res.status(200).json({
				success: 'Load list variants successfully',
				filter,
				size,
				variants: []
			})
			return
		}
		const sortObj: any = { _id: 1 }
		sortObj[sortBy] = order === 'asc' ? 1 : -1
		const variants = await Variant.find(filterArgs)
			.sort(sortObj)
			.populate({
				path: 'categoryIds',
				populate: {
					path: 'categoryId',
					populate: { path: 'categoryId' }
				}
			})
			.skip(skip)
			.limit(limit)
		res.status(200).json({
			success: 'Load list variants successfully',
			filter,
			size,
			variants
		})
	} catch (error) {
		res.status(500).json({ error: 'Load list variants failed' })
	}
}
