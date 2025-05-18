import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { UserFavoriteProduct, Product } from '../models/index.model'

interface UserFavoriteProductRequestBase {
	user?: {
		_id: mongoose.Types.ObjectId
		[key: string]: any
	}
	product?: {
		_id: mongoose.Types.ObjectId
		[key: string]: any
	}
}

export const favoriteProduct = async (
	req: Request & UserFavoriteProductRequestBase,
	res: Response
) => {
	try {
		const userId = req.user!._id
		const productId = req.product!._id

		// Find or create a favorite record
		const favorite = await UserFavoriteProduct.findOneAndUpdate(
			{ userId, productId },
			{ isDeleted: false },
			{ upsert: true, new: true }
		)

		if (!favorite) {
			res.status(400).json({
				error: 'Favorite already exists'
			})
			return
		}

		// Get detailed product information after favorite
		const product = await Product.findOne({ _id: productId })
			.populate({
				path: 'categoryId',
				populate: {
					path: 'categoryId',
					populate: { path: 'categoryId' }
				}
			})
			.populate({
				path: 'variantValueIds',
				populate: { path: 'variantId' }
			})
			.populate('storeId', '_id name avatar isActive isOpen')

		if (!product) {
			res.status(404).json({
				error: 'Product not found'
			})
			return
		}

		res.status(200).json({
			success: 'Favorite product',
			product
		})
	} catch (error) {
		console.error('Favorite product error:', error)
		return res.status(500).json({
			error: 'Favorite product failed'
		})
	}
}

export const unFavoriteProduct = async (
	req: Request & UserFavoriteProductRequestBase,
	res: Response
) => {
	try {
		const userId = req.user!._id
		const productId = req.product!._id

		// Update isDeleted status to true to unfavorite
		const favorite = await UserFavoriteProduct.findOneAndUpdate(
			{ userId, productId },
			{ isDeleted: true },
			{ upsert: true, new: true }
		)

		if (!favorite) {
			return res.status(400).json({
				error: 'Favorite does not exist'
			})
		}

		// Get detailed product information after unfavorite
		const product = await Product.findOne({ _id: productId })
			.populate({
				path: 'categoryId',
				populate: {
					path: 'categoryId',
					populate: { path: 'categoryId' }
				}
			})
			.populate({
				path: 'variantValueIds',
				populate: { path: 'variantId' }
			})
			.populate('storeId', '_id name avatar isActive isOpen')

		if (!product) {
			return res.status(404).json({
				error: 'Product not found'
			})
		}

		return res.status(200).json({
			success: 'Product unfavorite',
			product
		})
	} catch (error) {
		console.error('Unfavorite product error:', error)
		return res.status(500).json({
			error: 'Unfavorite product failed'
		})
	}
}

export const checkFavoriteProduct = async (
	req: Request,
	res: Response
) => {
	try {
		const userId = req.user!._id
		const productId = req.product!._id
		const favorite = await UserFavoriteProduct.findOne({
			userId,
			productId,
			isDeleted: false
		})

		if (!favorite) {
			return res.status(200).json({
				error: 'Favorite product not found'
			})
		}

		return res.status(200).json({
			success: 'Favorite product'
		})
	} catch (error) {
		console.error('Check Favorite product error:', error)
		return res.status(404).json({
			error: 'Favorite product not found'
		})
	}
}

export const getFavoriteCount = async (
	req: Request & UserFavoriteProductRequestBase,
	res: Response
) => {
	try {
		const productId = req.product!._id

		// Count the number of active favorite records
		const count = await UserFavoriteProduct.countDocuments({
			productId,
			isDeleted: false
		})

		return res.status(200).json({
			success: 'Get product number of favorites successfully',
			count
		})
	} catch (error) {
		console.error('Get favorite count error:', error)
		return res.status(404).json({
			error: 'Favorite product not found'
		})
	}
}

export const listFavoriteProductsByUser = async (
	req: Request & UserFavoriteProductRequestBase,
	res: Response
) => {
	try {
		const userId = req.user!._id

		// Process pagination parameters
		const limit =
			req.query.limit &&
				typeof req.query.limit === 'string' &&
				parseInt(req.query.limit) > 0
				? parseInt(req.query.limit)
				: 6
		const page =
			req.query.page &&
				typeof req.query.page === 'string' &&
				parseInt(req.query.page) > 0
				? parseInt(req.query.page)
				: 1

		// Initialize pagination information
		const filter: {
			limit: number
			pageCurrent: number
			pageCount?: number
		} = {
			limit,
			pageCurrent: page
		}

		// Find all user's favorite records
		const favorites = await UserFavoriteProduct.find({
			userId,
			isDeleted: false
		})

		// Get product IDs from the results
		const productIds = favorites.map((favorite) => favorite.productId)

		// Count total products meeting the conditions
		const size = await Product.countDocuments({
			_id: { $in: productIds },
			isActive: true,
			isSelling: true
		})

		// Process pagination information
		const pageCount = Math.ceil(size / limit)
		filter.pageCount = pageCount

		// Calculate number of records to skip
		let skip = (page > pageCount ? pageCount - 1 : page - 1) * limit
		if (skip < 0) skip = 0

		// Return empty array if no products
		if (size <= 0) {
			return res.status(200).json({
				success: 'Load list Favorite products successfully',
				filter,
				size,
				products: []
			})
		}

		// Get detailed products according to pagination
		const products = await Product.find({
			_id: { $in: productIds },
			isActive: true,
			isSelling: true
		})
			.sort({ name: 1, _id: 1 })
			.skip(skip)
			.limit(limit)
			.populate({
				path: 'categoryId',
				populate: {
					path: 'categoryId',
					populate: { path: 'categoryId' }
				}
			})
			.populate({
				path: 'variantValueIds',
				populate: { path: 'variantId' }
			})
			.populate('storeId', '_id name avatar isActive isOpen')

		return res.status(200).json({
			success: 'Load list favorite products successfully',
			filter,
			size,
			products
		})
	} catch (error) {
		console.error('List Favorite products error:', error)
		return res.status(500).json({
			error: 'Load list favorite products failed'
		})
	}
}
