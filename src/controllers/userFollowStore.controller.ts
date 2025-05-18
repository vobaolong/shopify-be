import { UserFollowStore, Store } from '../models/index.model'
import { cleanStore } from '../helpers/storeHandler'
import { Request, Response } from 'express'
import { ControllerFunction } from '../types/controller.types'

interface FilterType {
	limit: number
	pageCurrent: number
	pageCount?: number
}

export const followStore: ControllerFunction = async (
	req: Request,
	res: Response
): Promise<Response | void> => {
	try {
		const userId = req.user!._id
		const storeId = req.store!._id

		const follow = await UserFollowStore.findOneAndUpdate(
			{ userId, storeId },
			{ isDeleted: false },
			{ upsert: true, new: true }
		)

		if (!follow) {
			return res.status(400).json({
				error: 'Follow is already exists'
			})
		}

		const store = await Store.findOne({ _id: storeId })
			.select('-e_wallet')
			.populate('ownerId')
			.populate('staffIds')
			.populate('commissionId', '_id name fee')

		if (!store) {
			return res.status(404).json({
				error: 'Store not found'
			})
		}

		return res.status(200).json({
			success: 'Follow store successfully',
			store: cleanStore(store)
		})
	} catch (error) {
		return res.status(500).json({
			error: 'Follow store failed'
		})
	}
}

export const unfollowStore = async (
	req: Request,
	res: Response
): Promise<Response | void> => {
	try {
		const userId = req.user!._id
		const storeId = req.store!._id

		const follow = await UserFollowStore.findOneAndUpdate(
			{ userId, storeId },
			{ isDeleted: true },
			{ new: true }
		)

		if (!follow) {
			return res.status(400).json({
				error: 'Unfollow is already exists'
			})
		}

		const store = await Store.findOne({ _id: storeId })
			.select('-e_wallet')
			.populate('ownerId')
			.populate('staffIds')
			.populate('commissionId', '_id name fee')

		if (!store) {
			return res.status(404).json({
				error: 'Store not found'
			})
		}

		return res.status(200).json({
			success: 'Unfollow store successfully',
			store: cleanStore(store)
		})
	} catch (error) {
		return res.status(500).json({
			error: 'Unfollow store failed'
		})
	}
}

export const checkFollowingStore = async (
	req: Request,
	res: Response
): Promise<Response | void> => {
	try {
		const userId = req.user!._id
		const storeId = req.store!._id

		const follow = await UserFollowStore.findOne({
			userId,
			storeId,
			isDeleted: false
		})

		if (!follow) {
			return res.status(200).json({
				error: 'Following store not found'
			})
		}

		return res.status(200).json({
			success: 'Following store'
		})
	} catch (error) {
		return res.status(404).json({
			error: 'Following store not found'
		})
	}
}

export const getStoreFollowerCount = async (
	req: Request,
	res: Response
): Promise<Response | void> => {
	try {
		const storeId = req.store!._id
		const count = await UserFollowStore.countDocuments({
			storeId,
			isDeleted: false
		})

		return res.status(200).json({
			success: 'get store number of followers successfully',
			count
		})
	} catch (error) {
		return res.status(404).json({
			error: 'Following stores not found'
		})
	}
}

export const getFollowedStores = async (
	req: Request,
	res: Response
): Promise<Response | void> => {
	try {
		const userId = req.user!._id
		const limit =
			req.query.limit && typeof req.query.limit === 'string' && parseInt(req.query.limit) > 0
				? parseInt(req.query.limit)
				: 6
		const page =
			req.query.page && typeof req.query.page === 'string' && parseInt(req.query.page) > 0
				? parseInt(req.query.page)
				: 1
		let skip = (page - 1) * limit

		const filter: FilterType = {
			limit,
			pageCurrent: page
		}

		const follows = await UserFollowStore.find({ userId, isDeleted: false })
		const storeIds = follows.map((follow) => follow.storeId)

		const count = await Store.countDocuments({
			_id: { $in: storeIds },
			isActive: true
		})

		const size = count
		const pageCount = Math.ceil(size / limit)
		filter.pageCount = pageCount

		if (page > pageCount) {
			skip = (pageCount - 1) * limit
		}

		if (count <= 0) {
			return res.status(200).json({
				success: 'Load list following stores successfully',
				filter,
				size,
				stores: []
			})
		}

		const stores = await Store.find({ _id: { $in: storeIds }, isActive: true })
			.select('-e_wallet')
			.sort({ name: 1, _id: 1 })
			.skip(skip)
			.limit(limit)
			.populate('ownerId')
			.populate('staffIds')
			.populate('commissionId', '_id name fee')

		const cleanStores = stores.map((store) => cleanStore(store))

		return res.status(200).json({
			success: 'Load list following stores successfully',
			filter,
			size,
			stores: cleanStores
		})
	} catch (error) {
		return res.status(500).json({
			error: 'Load list followings stores failed'
		})
	}
}
