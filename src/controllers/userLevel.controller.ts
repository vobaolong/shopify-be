import { errorHandler, MongoError } from '../helpers/errorHandler'
import { UserLevel } from '../models/index.model'
import { Request, Response, NextFunction, RequestHandler } from 'express'
import {
	ParamControllerFunction,
	ControllerFunction,
	FilterType
} from '../types/controller.types'

interface UserLevelRequest extends Request {
	userLevel?: any
	user?: any
}

export const getUserLevelById: RequestHandler = async (req, res, next) => {
	try {
		const userLevel = await UserLevel.findById(req.params.id)
		if (!userLevel) {
			res.status(404).json({
				error: 'User level not found'
			})
			return
		}
		(req as any).userLevel = userLevel
		next()
	} catch (error) {
		res.status(404).json({
			error: 'User level not found'
		})
	}
}

export const getUserLevel: RequestHandler = async (req, res) => {
	try {
		const point = req.user!.point >= 0 ? req.user!.point : 0
		const lvs = await UserLevel.find({
			minPoint: { $lte: point },
			isDeleted: false
		})
			.sort('-minPoint')
			.limit(1)
		res.status(200).json({
			success: 'Get user level successfully',
			level: {
				point: req.user!.point,
				name: lvs[0].name,
				minPoint: lvs[0].minPoint,
				discount: lvs[0].discount,
				color: lvs[0].color
			}
		})
	} catch (error) {
		res.status(500).json({
			error: 'Get user level failed'
		})
	}
}

export const createUserLevel: RequestHandler = async (req, res) => {
	try {
		const { name, minPoint, discount, color } = req.body
		const level = new UserLevel({ name, minPoint, discount, color })
		await level.save()
		res.status(201).json({
			success: 'Create user level successfully'
		})
	} catch (error) {
		res.status(400).json({
			error: errorHandler(error as MongoError)
		})
	}
}

export const updateUserLevel: RequestHandler = async (req, res) => {
	try {
		const { name, minPoint, discount, color } = req.body
		const level = await UserLevel.findOneAndUpdate(
			{ _id: (req as any).userLevel._id },
			{ $set: { name, minPoint, discount, color } }
		)
		if (!level) {
			res.status(500).json({
				error: 'User level not found'
			})
			return
		}
		res.status(200).json({
			success: 'Update user level successfully'
		})
	} catch (error) {
		res.status(400).json({
			error: errorHandler(error as MongoError)
		})
	}
}

export const removeUserLevel: RequestHandler = async (req, res) => {
	try {
		const level = await UserLevel.findOneAndUpdate(
			{ _id: (req as any).userLevel._id },
			{ $set: { isDeleted: true } }
		)
		if (!level) {
			res.status(500).json({
				error: 'User level not found'
			})
			return
		}
		res.status(200).json({
			success: 'Remove user level successfully'
		})
	} catch (error) {
		res.status(400).json({
			error: errorHandler(error as MongoError)
		})
	}
}

export const restoreUserLevel: RequestHandler = async (req, res) => {
	try {
		const level = await UserLevel.findOneAndUpdate(
			{ _id: (req as any).userLevel._id },
			{ $set: { isDeleted: false } }
		)
		if (!level) {
			res.status(500).json({
				error: 'User level not found'
			})
			return
		}
		res.status(200).json({
			success: 'Restore user level successfully'
		})
	} catch (error) {
		res.status(400).json({
			error: errorHandler(error as MongoError)
		})
	}
}

export const getUserLevels: RequestHandler = async (req, res) => {
	try {
		const search = req.query.search ? req.query.search.toString() : ''
		const sortBy = req.query.sortBy ? req.query.sortBy.toString() : '_id'
		const order =
			req.query.order &&
				(req.query.order.toString() === 'asc' ||
					req.query.order.toString() === 'desc')
				? req.query.order.toString()
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
		let filter: FilterType = {
			search,
			sortBy,
			order,
			limit,
			pageCurrent: page
		}
		const count = await UserLevel.countDocuments({
			name: { $regex: search, $options: 'i' }
		})
		const size = count
		const pageCount = Math.ceil(size / limit)
		filter = { ...filter, pageCount }
		if (page > pageCount) {
			skip = (pageCount - 1) * limit
		}
		if (count <= 0) {
			res.status(200).json({
				success: 'Load list user levels successfully',
				filter,
				size,
				levels: []
			})
			return
		}
		const levels = await UserLevel.find({
			name: { $regex: search, $options: 'i' }
		})
			.sort({ [sortBy as string]: order === 'asc' ? 1 : -1, _id: 1 })
			.skip(skip)
			.limit(limit)
		res.status(200).json({
			success: 'Load list user levels successfully',
			filter,
			size,
			levels
		})
	} catch (error) {
		res.status(500).json({
			error: 'Load list user levels failed'
		})
	}
}

export const getActiveUserLevels: RequestHandler = async (req, res) => {
	try {
		const levels = await UserLevel.find({ isDeleted: false })
		res.status(200).json({
			success: 'Load list active user levels successfully',
			levels
		})
	} catch (error) {
		res.status(500).json({
			error: 'Load list active user levels failed'
		})
	}
}
