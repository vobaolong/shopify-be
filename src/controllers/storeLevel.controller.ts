import { StoreLevel } from '../models/index.model'
import { errorHandler, MongoError } from '../helpers/errorHandler'
import { Request, Response, NextFunction, RequestParamHandler, RequestHandler } from 'express'
import { FilterType } from '../types/controller.types'

export const storeLevelById: RequestParamHandler = async (req, res, next, id: string) => {
	try {
		const storeLevel = await StoreLevel.findById(id).exec()

		if (!storeLevel) {
			res.status(404).json({
				error: 'Store level not found'
			})
		}

		req.storeLevel = storeLevel
		next()
	} catch (error) {
		res.status(404).json({
			error: 'Store level not found'
		})
	}
}

export const getStoreLevel: RequestHandler = async (req, res) => {
	try {
		const point = Math.max(req.store?.point || 0, 0)

		const [level] = await StoreLevel.find({
			minPoint: { $lte: point },
			isDeleted: false
		})
			.sort('-minPoint')
			.limit(1)
			.exec()

		if (!level) {
			res.status(404).json({
				error: 'No matching store level found'
			})
		}

		res.status(200).json({
			success: 'Get store level successfully',
			level: {
				point: req.store?.point,
				name: level.name,
				minPoint: level.minPoint,
				discount: level.discount,
				color: level.color
			}
		})
	} catch (error) {
		res.status(500).json({
			error: 'Get store level failed'
		})
	}
}

export const createStoreLevel: RequestHandler = async (req, res) => {
	try {
		const { name, minPoint, discount, color } = req.body
		const storeLevel = new StoreLevel({ name, minPoint, discount, color })
		const level = await storeLevel.save()
		res.status(201).json({
			success: 'Create store level successfully',
			level
		})
	} catch (error) {
		res.status(400).json({
			error: errorHandler(error as MongoError)
		})
	}
}

export const updateStoreLevel: RequestHandler = async (req, res) => {
	try {
		const { name, minPoint, discount, color } = req.body
		const level = await StoreLevel.findOneAndUpdate(
			{ _id: req.storeLevel?._id },
			{ $set: { name, minPoint, discount, color } },
			{ new: true }
		).exec()
		if (!level) {
			res.status(500).json({
				error: 'Store level not found'
			})
		}
		res.status(200).json({
			success: 'Update store level successfully',
			level
		})
	} catch (error) {
		res.status(400).json({
			error: errorHandler(error as MongoError)
		})
	}
}

export const removeStoreLevel: RequestHandler = async (req, res) => {
	try {
		const level = await StoreLevel.findOneAndUpdate(
			{ _id: req.storeLevel?._id },
			{ $set: { isDeleted: true } },
			{ new: true }
		).exec()
		if (!level) {
			res.status(500).json({
				error: 'Store level not found'
			})
		}
		res.status(200).json({
			success: 'Remove store level successfully'
		})
	} catch (error) {
		res.status(400).json({
			error: errorHandler(error as MongoError)
		})
	}
}

export const restoreStoreLevel: RequestHandler = async (req, res) => {
	try {
		const level = await StoreLevel.findOneAndUpdate(
			{ _id: req.storeLevel?._id },
			{ $set: { isDeleted: false } },
			{ new: true }
		).exec()
		if (!level) {
			res.status(500).json({
				error: 'Store level not found'
			})
		}
		res.status(200).json({
			success: 'Restore store level successfully'
		})
	} catch (error) {
		res.status(400).json({
			error: errorHandler(error as MongoError)
		})
	}
}

export const getStoreLevels: RequestHandler = async (req, res) => {
	try {
		const search = req.query.search?.toString() || ''
		const sortBy = req.query.sortBy?.toString() || '_id'
		const order =
			req.query.order?.toString() && ['asc', 'desc'].includes(req.query.order?.toString())
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
		const filter: FilterType = {
			search,
			sortBy,
			order,
			limit,
			pageCurrent: page
		}
		const searchQuery = { name: { $regex: search, $options: 'i' } }
		const count = await StoreLevel.countDocuments(searchQuery)
		const size = count
		const pageCount = Math.ceil(size / limit)
		filter.pageCount = pageCount
		let skip = limit * (page - 1)
		if (page > pageCount && pageCount > 0) {
			skip = (pageCount - 1) * limit
		}
		if (count <= 0) {
			res.status(200).json({
				success: 'Load list store levels successfully',
				filter,
				size,
				levels: []
			})
		}
		const levels = await StoreLevel.find(searchQuery)
			.sort({ [sortBy]: order === 'asc' ? 1 : -1, _id: 1 })
			.skip(skip)
			.limit(limit)
			.exec()
		res.status(200).json({
			success: 'Load list store levels successfully',
			filter,
			size,
			levels
		})
	} catch (error) {
		res.status(500).json({
			error: 'Load list store levels failed'
		})
	}
}

export const getActiveStoreLevels: RequestHandler = async (req, res) => {
	try {
		const levels = await StoreLevel.find({ isDeleted: false })
			.sort('minPoint')
			.exec()
		res.status(200).json({
			success: 'Load list active store levels successfully',
			levels
		})
	} catch (error) {
		res.status(500).json({
			error: 'Load list active store levels failed'
		})
	}
}
