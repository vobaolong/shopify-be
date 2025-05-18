import {
	Request,
	Response,
	NextFunction,
	RequestHandler,
	RequestParamHandler
} from 'express'
import Category, { ICategory } from '../models/category.model'
import fs from 'fs'
import { errorHandler, MongoError } from '../helpers/errorHandler'
import mongoose from 'mongoose'
import { FilterType } from '../types/controller.types'

interface CategoryRequest extends Request {
	category?: ICategory
	filepaths?: string[]
	fields?: any
}

export const getCategoryById: RequestParamHandler = async (
	req: CategoryRequest,
	res: Response,
	next: NextFunction,
	id: string
) => {
	try {
		const category = await Category.findById(id)
		if (!category) {
			res.status(404).json({
				error: 'Category not found'
			})
		}
		req.category = category as ICategory
		next()
	} catch (error) {
		res.status(404).json({
			error: 'Category not found'
		})
	}
}

export const getCategory: RequestHandler = async (
	req: CategoryRequest,
	res: Response
) => {
	try {
		const category = await Category.findOne({
			_id: req.category?._id
		}).populate({
			path: 'categoryId',
			populate: { path: 'categoryId' }
		})
		if (!category) {
			res.status(500).json({
				error: 'Load category failed'
			})
		}
		res.status(200).json({
			success: 'Load category successfully',
			category
		})
	} catch (error) {
		res.status(500).json({
			error: 'Load category failed'
		})
	}
}

const deleteUploadedFile = (filepath?: string): void => {
	try {
		if (filepath) {
			fs.unlinkSync('public' + filepath)
		}
	} catch (error) {
		// Silently fail if file deletion fails
	}
}

const deleteUploadedFiles = (filepaths: string[] = []): void => {
	filepaths.forEach((path) => deleteUploadedFile(path))
}

export const checkCategory: RequestHandler = async (
	req: CategoryRequest,
	res: Response,
	next: NextFunction
) => {
	const { categoryId } = req.fields || {}
	if (!categoryId) next()

	try {
		const category = await Category.findOne({ _id: categoryId }).populate(
			'categoryId'
		)

		if (
			!category ||
			(category.categoryId && (category.categoryId as any).categoryId)
		) {
			deleteUploadedFile(req.filepaths?.[0])
			res.status(400).json({
				error: 'CategoryId invalid'
			})
		}
		next()
	} catch (error) {
		deleteUploadedFile(req.filepaths?.[0])
		res.status(400).json({
			error: 'CategoryId invalid'
		})
	}
}

export const checkCategoryChild: RequestHandler = async (
	req: CategoryRequest,
	res: Response,
	next: NextFunction
) => {
	let categoryId = req.body.categoryId

	try {
		if (!categoryId && req.fields) {
			categoryId = req.fields.categoryId
		}

		const category = await Category.findOne({ categoryId })

		if (category) {
			deleteUploadedFiles(req.filepaths || [])
			res.status(400).json({
				error: 'CategoryId invalid'
			})
		}
		next()
	} catch (error) {
		next()
	}
}

export const checkListCategoriesChild: RequestHandler = async (
	req: CategoryRequest,
	res: Response,
	next: NextFunction
) => {
	const { categoryIds } = req.body
	try {
		const category = await Category.findOne({
			categoryId: { $in: categoryIds }
		})
		if (category) {
			res.status(400).json({
				error: 'categoryIds invalid'
			})
		}
		next()
	} catch (error) {
		next()
	}
}

export const createCategory: RequestHandler = async (
	req: CategoryRequest,
	res: Response
) => {
	const { name, categoryId } = req.fields || {}
	const image = req.filepaths?.[0]

	if (!name) {
		deleteUploadedFile(image)
		res.status(400).json({
			error: 'All fields are required'
		})
	}

	try {
		const category = new Category({
			name,
			categoryId,
			image
		})

		const savedCategory = await category.save()
		res.status(200).json({
			success: 'Creating category successfully',
			category: savedCategory
		})
	} catch (error) {
		deleteUploadedFile(image)
		res.status(400).json({
			error: errorHandler(error as MongoError)
		})
	}
}

export const updateCategory: RequestHandler = async (
	req: CategoryRequest,
	res: Response
) => {
	let { name, categoryId } = req.fields || {}
	const image = req.filepaths?.[0] ? req.filepaths[0] : req.category?.image
	if (!categoryId) {
		categoryId = null
	} else if (categoryId == req.category?._id) {
		deleteUploadedFile(req.filepaths?.[0])
		res.status(400).json({
			error: 'categoryId invalid'
		})
	}
	if (!name || !image) {
		deleteUploadedFile(req.filepaths?.[0])
		res.status(400).json({
			error: 'All fields are required'
		})
	}
	try {
		const category = await Category.findOneAndUpdate(
			{ _id: req.category?._id },
			{ $set: { name, image, categoryId } },
			{ new: true }
		).populate({
			path: 'categoryId',
			populate: { path: 'categoryId' }
		})

		if (!category) {
			deleteUploadedFile(req.filepaths?.[0])
			res.status(400).json({
				error: 'Update category failed'
			})
		}

		res.status(200).json({
			success: 'Update category successfully',
			category
		})
	} catch (error) {
		deleteUploadedFile(req.filepaths?.[0])
		res.status(500).json({
			error: errorHandler(error as MongoError)
		})
	}
}

export const removeCategory: RequestHandler = async (
	req: CategoryRequest,
	res: Response
) => {
	try {
		const category = await Category.findOneAndUpdate(
			{ _id: req.category?._id },
			{ $set: { isDeleted: true } },
			{ new: true }
		).populate({
			path: 'categoryId',
			populate: { path: 'categoryId' }
		})

		if (!category) {
			res.status(404).json({
				error: 'category not found'
			})
		}
		res.status(200).json({
			success: 'Remove category successfully'
		})
	} catch (error) {
		res.status(500).json({
			error: 'category not found'
		})
	}
}

export const restoreCategory: RequestHandler = async (
	req: CategoryRequest,
	res: Response
) => {
	try {
		const category = await Category.findOneAndUpdate(
			{ _id: req.category?._id },
			{ $set: { isDeleted: false } },
			{ new: true }
		).populate({
			path: 'categoryId',
			populate: { path: 'categoryId' }
		})
		if (!category) {
			res.status(404).json({
				error: 'category not found'
			})
		}
		res.status(200).json({
			success: 'Restore category successfully'
		})
	} catch (error) {
		res.status(500).json({
			error: 'category not found'
		})
	}
}

export const getActiveCategories: RequestHandler = async (
	req: CategoryRequest,
	res: Response
) => {
	const search = req.query.search?.toString() || ''
	const sortBy = req.query.sortBy?.toString() || '_id'
	const order =
		req.query.order && ['asc', 'desc'].includes(req.query.order.toString())
			? (req.query.order.toString() as 'asc' | 'desc')
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

	const filterArgs: Record<string, any> = {
		name: {
			$regex: search,
			$options: 'i'
		},
		isDeleted: false
	}
	if (req.query.categoryId) {
		filter.categoryId = req.query.categoryId.toString()
		filterArgs.categoryId =
			req.query.categoryId === 'null' ? null : req.query.categoryId
	}
	try {
		const count = await Category.countDocuments(filterArgs)
		const size = count
		const pageCount = Math.ceil(size / limit)
		filter.pageCount = pageCount

		let skip = limit * (page - 1)
		if (page > pageCount) {
			skip = (pageCount - 1) * limit
		}
		if (count <= 0) {
			res.status(200).json({
				success: 'Load list active categories successfully',
				filter,
				size,
				categories: []
			})
		}
		const categories = await Category.find(filterArgs)
			.sort({ [sortBy]: order === 'asc' ? 1 : -1, _id: 1 })
			.skip(skip)
			.limit(limit)
			.populate({
				path: 'categoryId',
				populate: { path: 'categoryId' }
			})
		res.status(200).json({
			success: 'Load list active categories successfully',
			filter,
			size,
			categories
		})
	} catch (error) {
		res.status(500).json({
			error: 'Load list active categories failed'
		})
	}
}

export const getCategories: RequestHandler = async (
	req: CategoryRequest,
	res: Response
) => {
	const search = (req.query.search as string) || ''
	const sortBy = (req.query.sortBy as string) || '_id'
	const order =
		req.query.order && ['asc', 'desc'].includes(req.query.order as string)
			? (req.query.order as 'asc' | 'desc')
			: 'asc'
	const limit =
		req.query.limit && parseInt(req.query.limit as string) > 0
			? parseInt(req.query.limit as string)
			: 6
	const page =
		req.query.page && parseInt(req.query.page as string) > 0
			? parseInt(req.query.page as string)
			: 1

	const filter: FilterType = {
		search,
		sortBy,
		order,
		limit,
		pageCurrent: page
	}
	const filterArgs: any = {
		name: {
			$regex: search,
			$options: 'i'
		}
	}
	if (req.query.categoryId) {
		filter.categoryId = req.query.categoryId as string
		filterArgs.categoryId =
			req.query.categoryId === 'null' ? null : req.query.categoryId
	}
	try {
		const count = await Category.countDocuments(filterArgs)
		const size = count
		const pageCount = Math.ceil(size / limit)
		filter.pageCount = pageCount

		let skip = limit * (page - 1)
		if (page > pageCount) {
			skip = (pageCount - 1) * limit
		}
		if (count <= 0) {
			res.status(200).json({
				success: 'Load list categories successfully',
				filter,
				size,
				categories: []
			})
		}
		const categories = await Category.find(filterArgs)
			.sort({ [sortBy]: order, _id: 1 })
			.skip(skip)
			.limit(limit)
			.populate({
				path: 'categoryId',
				populate: { path: 'categoryId' }
			})

		res.status(200).json({
			success: 'Load list categories successfully',
			filter,
			size,
			categories
		})
	} catch (error) {
		res.status(500).json({
			error: 'Load list categories failed'
		})
	}
}

interface StoreRequest extends CategoryRequest {
	loadedCategories?: mongoose.Types.ObjectId[]
}

export const getCategoriesByStore: RequestHandler = async (
	req: StoreRequest,
	res: Response
) => {
	try {
		const categories = await Category.find({
			_id: { $in: req.loadedCategories || [] },
			isDeleted: false
		}).populate({
			path: 'categoryId',
			populate: {
				path: 'categoryId'
			}
		})

		res.status(200).json({
			success: 'Load list categories of store successfully',
			categories
		})
	} catch (error) {
		res.status(500).json({
			success: 'Load list categories of store failed'
		})
	}
}
