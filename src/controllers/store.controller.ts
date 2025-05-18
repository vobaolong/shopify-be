import { Store, User, Address, Notification } from '../models/index.model'
import fs from 'fs'
import { errorHandler, MongoError } from '../helpers/errorHandler'
import { cleanUser, cleanUserLess } from '../helpers/userHandler'
import { cleanStore } from '../helpers/storeHandler'
import { Request, Response, NextFunction, RequestHandler, RequestParamHandler } from 'express'
import {
	FilterType,
} from '../types/controller.types'
import mongoose from 'mongoose'
import { IUser } from '../models/user.model'

function safeCleanUser(user: any): any {
	return cleanUser(user as IUser)
}

function safeCleanUserLess(user: any): any {
	return cleanUserLess(user as IUser)
}

interface StoreRequest extends Request {
	store?: any
	user?: any
	filepaths?: string[]
	loadedCommissions?: mongoose.Types.ObjectId[]
	query: {
		search?: string
		sortBy?: string
		sortMoreBy?: string
		order?: string
		limit?: string
		page?: string
		isActive?: string
		commissionId?: string
		index?: string
		[key: string]: any
	}
	fields?: {
		name?: string
		bio?: string
		address?: string
		commissionId?: string
		addressDetail?: string
		[key: string]: any
	}
}

interface StoreFilterType extends Omit<FilterType, 'isActive'> {
	search: string
	sortBy: string
	sortMoreBy: string
	order: string
	isActive?: boolean[] | string | boolean
	commissionId: mongoose.Types.ObjectId[] | string[]
	limit: number
	pageCurrent: number
	pageCount?: number
}

interface AddressDetailType {
	_id?: string
	province: string
	provinceName: string
	district: string
	districtName: string
	ward: string
	wardName: string
	street: string
}

// GET STORE BY ID
export const getStoreById: RequestParamHandler = async (
	req: StoreRequest,
	res: Response,
	next: NextFunction,
	id: string
) => {
	try {
		const store = await Store.findById(id).exec()
		if (!store) {
			res.status(404).json({
				error: 'Store not found'
			})
			return
		}
		req.store = store
		next()
	} catch (error) {
		res.status(404).json({
			error: 'Store not found'
		})
	}
}

// GET STORE
export const getStore: RequestHandler = async (
	req: StoreRequest,
	res: Response
) => {
	try {
		const store = await Store.findOne({ _id: req.store._id })
			.populate('commissionId', '_id name fee')
			.exec()

		if (!store) {
			res.status(404).json({
				error: 'Store not found'
			})
			return
		}

		res.status(200).json({
			success: 'Get store successfully',
			store: cleanStore(store)
		})
	} catch (error) {
		res.status(404).json({
			error: 'Store not found'
		})
	}
}

// GET STORE PROFILE
export const getStoreProfile: RequestHandler = async (
	req: StoreRequest,
	res: Response
) => {
	try {
		const store = await Store.findOne({ _id: req.store._id })
			.populate('ownerId')
			.populate('staffIds')
			.populate('commissionId', '_id name fee')
			.exec()

		if (!store) {
			res.status(404).json({
				error: 'Stores not found'
			})
			return
		}

		// Cast to IUser before using cleanUser
		store.ownerId = safeCleanUser(store.ownerId)
		store.staffIds.forEach((staff, index) => {
			store.staffIds[index] = safeCleanUser(staff)
		})

		res.status(200).json({
			success: 'Get store profile successfully',
			store
		})
	} catch (error) {
		res.status(404).json({
			error: 'Store not found'
		})
	}
}

// CREATE STORE
export const createStore: RequestHandler = async (
	req: StoreRequest,
	res: Response
) => {
	try {
		const { name, bio, address, commissionId, addressDetail } = req.fields || {}
		const avatar = req.filepaths ? req.filepaths[0] : undefined
		const cover = req.filepaths ? req.filepaths[1] : undefined

		if (!name || !bio || !address || !commissionId || !avatar || !cover) {
			try {
				if (req.filepaths) {
					fs.unlinkSync('public' + req.filepaths[0])
					fs.unlinkSync('public' + req.filepaths[1])
				}
			} catch { }

			res.status(400).json({
				error: 'All fields are required'
			})
			return
		}

		const {
			province,
			provinceName,
			district,
			districtName,
			ward,
			wardName,
			street
		} = JSON.parse(addressDetail as string) as AddressDetailType

		const addressObj = new Address({
			provinceID: province,
			provinceName,
			districtID: district,
			districtName,
			wardID: ward,
			wardName,
			address: street
		})

		await addressObj.save()

		const store = new Store({
			name,
			bio,
			address: addressObj,
			commissionId,
			avatar,
			cover,
			ownerId: req.user._id
		})

		const savedStore = await store.save()

		const adminId = process.env.ADMIN_ID
		const adminNotification = new Notification({
			message: `Có cửa hàng mới: ${store.name}`,
			userId: adminId,
			isRead: false,
			objectId: savedStore._id
		})

		await adminNotification.save()

		res.status(200).json({
			success: 'Creating store successfully',
			storeId: savedStore._id
		})
	} catch (error) {
		try {
			if (req.filepaths) {
				fs.unlinkSync('public' + req.filepaths[0])
				fs.unlinkSync('public' + req.filepaths[1])
			}
		} catch { }

		res.status(400).json({
			error: errorHandler(error as MongoError)
		})
	}
}

// UPDATE STORE
export const updateStore: RequestHandler = async (
	req: StoreRequest,
	res: Response
) => {
	try {
		const { name, bio, address, addressDetail } = req.body as {
			name?: string
			bio?: string
			address?: string
			addressDetail: AddressDetailType
		}

		let addressId = null
		if (addressDetail._id) {
			await Address.findByIdAndUpdate(addressDetail._id, {
				provinceID: addressDetail.province,
				provinceName: addressDetail.provinceName,
				districtID: addressDetail.district,
				districtName: addressDetail.districtName,
				wardID: addressDetail.ward,
				wardName: addressDetail.wardName,
				address: addressDetail.street
			})
			addressId = addressDetail._id
		} else {
			const newAddress = new Address({
				provinceID: addressDetail.province,
				provinceName: addressDetail.provinceName,
				districtID: addressDetail.district,
				districtName: addressDetail.districtName,
				wardID: addressDetail.ward,
				wardName: addressDetail.wardName,
				address: addressDetail.street
			})
			const savedAddress = await newAddress.save()
			addressId = savedAddress._id
		}

		const store = await Store.findOneAndUpdate(
			{ _id: req.store._id },
			{ $set: { name, bio, address: addressId } },
			{ new: true }
		)
			.populate('ownerId')
			.populate('staffIds')
			.populate('commissionId', '_id name fee')

		if (!store) {
			res.status(500).json({
				error: 'Store not found'
			})
			return
		}

		// Cast to IUser before using cleanUser
		store.ownerId = safeCleanUser(store.ownerId)
		store.staffIds.forEach((staff, index) => {
			store.staffIds[index] = safeCleanUser(staff)
		})

		res.status(200).json({
			success: 'Update store successfully',
			store
		})
	} catch (error) {
		res.status(400).json({
			error: errorHandler(error as MongoError)
		})
	}
}

// ACTIVE STORE
export const activeStore: RequestHandler = async (
	req: StoreRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const { isActive } = req.body as { isActive: boolean }

		const store = await Store.findOneAndUpdate(
			{ _id: req.store._id },
			{ $set: { isActive } },
			{ new: true }
		)
			.populate('ownerId')
			.populate('staffIds')
			.populate('commissionId', '_id name fee')

		if (!store) {
			res.status(500).json({
				error: 'Store not found'
			})
			return
		}

		// Cast to IUser before using cleanUser
		store.ownerId = safeCleanUser(store.ownerId)
		store.staffIds.forEach((staff, index) => {
			store.staffIds[index] = safeCleanUser(staff)
		})

		// Pass to activeAllProducts middleware
		req.store = store
		next()
	} catch (error) {
		res.status(400).json({
			error: errorHandler(error as MongoError)
		})
	}
}

// GET COMMISSION
export const getCommission: RequestHandler = async (
	req: StoreRequest,
	res: Response
) => {
	try {
		const store = await Store.findOne({ _id: req.store._id })
			.populate('commissionId')
			.exec()

		if (!store) {
			res.status(500).json({
				error: 'Store not found'
			})
			return
		}

		res.status(200).json({
			success: 'Get commission successfully',
			commission: store.commissionId
		})
	} catch (error) {
		res.status(500).json({
			error: 'Store not found'
		})
	}
}

// UPDATE COMMISSION
export const updateCommission: RequestHandler = async (
	req: StoreRequest,
	res: Response
) => {
	try {
		const { commissionId } = req.body as { commissionId: string }

		const store = await Store.findOneAndUpdate(
			{ _id: req.store._id },
			{ $set: { commissionId } },
			{ new: true }
		)
			.populate('ownerId')
			.populate('staffIds')
			.populate('commissionId', '_id name fee')
			.exec()

		if (!store) {
			res.status(500).json({
				error: 'Store not found'
			})
			return
		}

		// Cast to IUser before using cleanUser
		store.ownerId = safeCleanUser(store.ownerId)
		store.staffIds.forEach((staff, index) => {
			store.staffIds[index] = safeCleanUser(staff)
		})

		res.status(200).json({
			success: 'Update store commission successfully',
			store
		})
	} catch (error) {
		res.status(400).json({
			error: errorHandler(error as MongoError)
		})
	}
}

// OPEN STORE
export const openStore: RequestHandler = async (
	req: StoreRequest,
	res: Response
) => {
	try {
		const { isOpen } = req.body as { isOpen: boolean }

		const store = await Store.findOneAndUpdate(
			{ _id: req.store._id },
			{ $set: { isOpen } },
			{ new: true }
		)
			.populate('ownerId')
			.populate('staffIds')
			.populate('commissionId', '_id name fee')
			.exec()

		if (!store) {
			res.status(404).json({
				error: 'Store not found'
			})
			return
		}

		// Cast to IUser before using cleanUser
		store.ownerId = safeCleanUser(store.ownerId)
		store.staffIds.forEach((staff, index) => {
			store.staffIds[index] = safeCleanUser(staff)
		})

		res.status(200).json({
			success: 'Update store status successfully',
			store
		})
	} catch (error) {
		res.status(400).json({
			error: errorHandler(error as MongoError)
		})
	}
}

// UPDATE AVATAR
export const updateAvatar = async (
	req: StoreRequest,
	res: Response
): Promise<Response | void> => {
	try {
		const oldpath = req.store.avatar

		const store = await Store.findOneAndUpdate(
			{ _id: req.store._id },
			{ $set: { avatar: req.filepaths ? req.filepaths[0] : '' } },
			{ new: true }
		)
			.populate('ownerId')
			.populate('staffIds')
			.populate('commissionId', '_id name fee')
			.exec()

		if (!store) {
			try {
				if (req.filepaths) {
					fs.unlinkSync('public' + req.filepaths[0])
				}
			} catch { }

			return res.status(500).json({
				error: 'Store not found'
			})
		}

		if (oldpath && oldpath !== '/uploads/default.webp') {
			try {
				fs.unlinkSync('public' + oldpath)
			} catch { }
		}

		// Cast to IUser before using cleanUser
		store.ownerId = safeCleanUser(store.ownerId)
		store.staffIds.forEach((staff, index) => {
			store.staffIds[index] = safeCleanUser(staff)
		})

		return res.status(200).json({
			success: 'Update avatar successfully',
			store
		})
	} catch (error) {
		try {
			if (req.filepaths) {
				fs.unlinkSync('public' + req.filepaths[0])
			}
		} catch { }

		return res.status(500).json({
			error: errorHandler(error as MongoError)
		})
	}
}

// UPDATE COVER
export const updateCover = async (
	req: StoreRequest,
	res: Response
): Promise<Response | void> => {
	try {
		const oldpath = req.store.cover

		const store = await Store.findOneAndUpdate(
			{ _id: req.store._id },
			{ $set: { cover: req.filepaths ? req.filepaths[0] : '' } },
			{ new: true }
		)
			.populate('ownerId')
			.populate('staffIds')
			.populate('commissionId', '_id name fee')
			.exec()

		if (!store) {
			try {
				if (req.filepaths) {
					fs.unlinkSync('public' + req.filepaths[0])
				}
			} catch { }

			return res.status(500).json({
				error: 'Store not found'
			})
		}

		if (oldpath && oldpath !== '/uploads/default.webp') {
			try {
				fs.unlinkSync('public' + oldpath)
			} catch { }
		}

		// Cast to IUser before using cleanUser
		store.ownerId = safeCleanUser(store.ownerId)
		store.staffIds.forEach((staff, index) => {
			store.staffIds[index] = safeCleanUser(staff)
		})

		return res.status(200).json({
			success: 'Update cover successfully',
			store
		})
	} catch (error) {
		try {
			if (req.filepaths) {
				fs.unlinkSync('public' + req.filepaths[0])
			}
		} catch { }

		return res.status(500).json({
			error: errorHandler(error as MongoError)
		})
	}
}

// GET LIST FEATURE IMAGES
export const getListFeatureImages = (
	req: StoreRequest,
	res: Response
): Response => {
	const featured_images = req.store.featured_images
	return res.status(200).json({
		success: 'load cover successfully',
		featured_images
	})
}

// ADD FEATURE IMAGE
export const addFeatureImage = async (
	req: StoreRequest,
	res: Response
): Promise<Response | void> => {
	try {
		const featured_images = req.store.featured_images

		const index = featured_images.length
		if (index >= 7) {
			try {
				if (req.filepaths) {
					fs.unlinkSync('public' + req.filepaths[0])
				}
			} catch { }

			return res.status(400).json({
				error: 'Limit is 7 images'
			})
		}

		const store = await Store.findOneAndUpdate(
			{ _id: req.store._id },
			{ $push: { featured_images: req.filepaths ? req.filepaths[0] : '' } },
			{ new: true }
		)
			.populate('ownerId')
			.populate('staffIds')
			.populate('commissionId', '_id name fee')
			.exec()

		if (!store) {
			try {
				if (req.filepaths) {
					fs.unlinkSync('public' + req.filepaths[0])
				}
			} catch { }

			return res.status(500).json({
				error: 'Store not found'
			})
		}

		// Cast to IUser before using cleanUser
		store.ownerId = safeCleanUser(store.ownerId)
		store.staffIds.forEach((staff, index) => {
			store.staffIds[index] = safeCleanUser(staff)
		})

		return res.status(200).json({
			success: 'Add featured image successfully',
			store
		})
	} catch (error) {
		try {
			if (req.filepaths) {
				fs.unlinkSync('public' + req.filepaths[0])
			}
		} catch { }

		return res.status(500).json({
			error: errorHandler(error as MongoError)
		})
	}
}

// UPDATE FEATURE IMAGE
export const updateFeatureImage = async (
	req: StoreRequest,
	res: Response
): Promise<Response | void> => {
	try {
		const index = req.query.index ? parseInt(req.query.index) : -1
		const image = req.filepaths ? req.filepaths[0] : undefined

		if (index === -1 || !image) {
			return res.status(400).json({
				error: 'Update feature image failed'
			})
		}

		const featured_images = req.store.featured_images
		if (index >= featured_images.length) {
			try {
				fs.unlinkSync('public' + image)
			} catch { }

			return res.status(404).json({
				error: 'Feature image not found'
			})
		}

		const oldpath = featured_images[index]
		featured_images[index] = image

		const store = await Store.findOneAndUpdate(
			{ _id: req.store._id },
			{ $set: { featured_images } },
			{ new: true }
		)
			.populate('ownerId')
			.populate('staffIds')
			.populate('commissionId', '_id name fee')
			.exec()

		if (!store) {
			try {
				fs.unlinkSync('public' + image)
			} catch { }

			return res.status(500).json({
				error: 'Store not found'
			})
		}

		if (oldpath && oldpath !== '/uploads/default.webp') {
			try {
				fs.unlinkSync('public' + oldpath)
			} catch { }
		}

		// Cast to IUser before using cleanUser
		store.ownerId = safeCleanUser(store.ownerId)
		store.staffIds.forEach((staff, index) => {
			store.staffIds[index] = safeCleanUser(staff)
		})

		return res.status(200).json({
			success: 'Update feature image successfully',
			store
		})
	} catch (error) {
		try {
			if (req.filepaths) {
				fs.unlinkSync('public' + req.filepaths[0])
			}
		} catch { }

		return res.status(400).json({
			error: errorHandler(error as MongoError)
		})
	}
}

// REMOVE FEATURED IMAGE
export const removeFeaturedImage = async (
	req: StoreRequest,
	res: Response
): Promise<Response | void> => {
	try {
		const index = req.query.index ? parseInt(req.query.index) : -1
		if (index === -1) {
			return res.status(400).json({
				error: 'Update feature image failed'
			})
		}

		const featured_images = req.store.featured_images
		if (index >= featured_images.length) {
			return res.status(404).json({
				error: 'Feature image not found'
			})
		}

		try {
			fs.unlinkSync('public' + featured_images[index])
		} catch { }

		featured_images.splice(index, 1)

		const store = await Store.findOneAndUpdate(
			{ _id: req.store._id },
			{ $set: { featured_images } },
			{ new: true }
		)
			.populate('ownerId')
			.populate('staffIds')
			.populate('commissionId', '_id name fee')
			.exec()

		if (!store) {
			return res.status(500).json({
				error: 'Store not found'
			})
		}

		// Cast to IUser before using cleanUser
		store.ownerId = safeCleanUser(store.ownerId)
		store.staffIds.forEach((staff, index) => {
			store.staffIds[index] = safeCleanUser(staff)
		})

		return res.status(200).json({
			success: 'Remove featured image successfully',
			store
		})
	} catch (error) {
		return res.status(400).json({
			error: errorHandler(error as MongoError)
		})
	}
}

// GET LIST STAFF
export const getStaffs = async (
	req: StoreRequest,
	res: Response
): Promise<Response | void> => {
	try {
		const store = await Store.findOne({ _id: req.store._id })
			.select('staffIds')
			.populate(
				'staffIds',
				'_id firstName lastName slug email phone id_card point avatar cover'
			)
			.exec()

		if (!store) {
			return res.status(500).json({
				error: 'Store not found'
			})
		}

		// Create a properly typed copy of the populated staff data
		const staffWithMaskedInfo = store.staffIds.map((staff) => {
			const staffObj = staff as unknown as IUser
			// Create a copy to avoid modifying the original
			const maskedStaff = {
				...(staffObj.toObject ? staffObj.toObject() : staffObj)
			}

			if (maskedStaff.email)
				maskedStaff.email = maskedStaff.email.slice(0, 6) + '******'
			if (maskedStaff.phone)
				maskedStaff.phone = '*******' + maskedStaff.phone.slice(-3)
			if (maskedStaff.id_card)
				maskedStaff.id_card = maskedStaff.id_card.slice(0, 3) + '******'

			return maskedStaff
		})

		return res.status(200).json({
			success: 'Load list staff successfully',
			staff: staffWithMaskedInfo
		})
	} catch (error) {
		return res.status(500).json({
			error: 'Load list staff failed'
		})
	}
}

// ADD STAFF
export const addStaff = async (
	req: StoreRequest,
	res: Response
): Promise<Response | void> => {
	try {
		const { staff } = req.body as { staff: string[] }
		const staffIds = req.store.staffIds

		if (staff.length > 6 - staffIds.length) {
			return res.status(400).json({
				error: 'The limit is 6 staff'
			})
		}

		const count = await User.countDocuments({
			_id: { $in: staff },
			role: 'user'
		})

		if (count !== staff.length) {
			return res.status(400).json({
				error: 'User is invalid'
			})
		}

		// Add unique staff IDs
		const newStaffIds = [...staffIds]
		for (const staffId of staff) {
			if (!newStaffIds.includes(staffId)) {
				newStaffIds.push(staffId)
			}
		}

		const store = await Store.findOneAndUpdate(
			{ _id: req.store._id },
			{ $set: { staffIds: newStaffIds } },
			{ new: true }
		)
			.populate('ownerId')
			.populate('staffIds')
			.populate('commissionId', '_id name fee')
			.exec()

		if (!store) {
			return res.status(500).json({
				error: 'Store not found'
			})
		}

		store.ownerId = safeCleanUser(store.ownerId)
		store.staffIds.forEach((staff) => {
			staff = safeCleanUser(staff)
		})

		return res.status(200).json({
			success: 'Add staff successfully',
			store
		})
	} catch (error) {
		return res.status(400).json({
			error: errorHandler(error as MongoError)
		})
	}
}

// CANCEL STAFF
export const cancelStaff = async (
	req: StoreRequest,
	res: Response
): Promise<Response | void> => {
	try {
		const userId = req.user._id
		const staffIds = [...req.store.staffIds]

		const index = staffIds.indexOf(userId)
		if (index === -1) {
			return res.status(400).json({
				error: 'User is not staff'
			})
		}

		staffIds.splice(index, 1)

		const store = await Store.findOneAndUpdate(
			{ _id: req.store._id },
			{ $set: { staffIds } },
			{ new: true }
		)
			.populate('ownerId')
			.populate('staffIds')
			.populate('commissionId', '_id name fee')
			.exec()

		if (!store) {
			return res.status(500).json({
				error: 'Store not found'
			})
		}

		return res.status(200).json({
			success: 'Cancel staff successfully'
		})
	} catch (error) {
		return res.status(400).json({
			error: errorHandler(error as MongoError)
		})
	}
}

// REMOVE STAFF
export const removeStaff = async (
	req: StoreRequest,
	res: Response
): Promise<Response | void> => {
	try {
		const { staff } = req.body as { staff: string }
		if (!staff) {
			return res.status(400).json({
				error: 'Staff is required'
			})
		}

		const staffIds = [...req.store.staffIds]
		const index = staffIds.indexOf(staff)
		if (index === -1) {
			return res.status(400).json({
				error: 'User is not staff'
			})
		}

		staffIds.splice(index, 1)

		const store = await Store.findOneAndUpdate(
			{ _id: req.store._id },
			{ $set: { staffIds } },
			{ new: true }
		)
			.populate('ownerId')
			.populate('staffIds')
			.populate('commissionId', '_id name fee')
			.exec()

		if (!store) {
			return res.status(500).json({
				error: 'Store not found'
			})
		}

		store.ownerId = safeCleanUser(store.ownerId)
		store.staffIds.forEach((staff) => {
			staff = safeCleanUser(staff)
		})

		return res.status(200).json({
			success: 'Remove staff successfully',
			store
		})
	} catch (error) {
		return res.status(400).json({
			error: errorHandler(error as MongoError)
		})
	}
}

// GET STORE COMMISSIONS
export const getStoreCommissions = (
	req: StoreRequest,
	res: Response,
	next: NextFunction
): void => {
	Store.distinct(
		'commissionId',
		{},
		(error: Error, commissions: mongoose.Types.ObjectId[]) => {
			if (error) {
				return res.status(400).json({
					error: 'Commissions not found'
				})
			}

			req.loadedCommissions = commissions
			next()
		}
	)
}

// GET STORES
export const getStores = (req: StoreRequest, res: Response): void => {
	const search = req.query.search ? req.query.search : ''
	const sortBy = req.query.sortBy ? req.query.sortBy : '_id'
	const sortMoreBy = req.query.sortMoreBy ? req.query.sortMoreBy : '_id'
	const order =
		req.query.order && (req.query.order == 'asc' || req.query.order == 'desc')
			? req.query.order
			: 'asc'

	const limit =
		req.query.limit && Number(req.query.limit) > 0
			? parseInt(req.query.limit)
			: 6
	const page =
		req.query.page && Number(req.query.page) > 0 ? parseInt(req.query.page) : 1
	let skip = limit * (page - 1)

	const commissionId = req.query.commissionId
		? [req.query.commissionId]
		: req.loadedCommissions

	const filter: StoreFilterType = {
		search: search as string,
		sortBy: sortBy as string,
		sortMoreBy: sortMoreBy as string,
		order: order as string,
		commissionId: commissionId as string[],
		limit,
		pageCurrent: page
	}

	const filterArgs = {
		$or: [
			{
				name: {
					$regex: search,
					$options: 'i'
				}
			},
			{ bio: { $regex: search, $options: 'i' } }
		],
		isActive: true,
		commissionId: { $in: commissionId }
	}

	Store.countDocuments(filterArgs, (error: Error, count: number) => {
		if (error) {
			return res.status(404).json({
				error: 'Stores not found'
			})
		}

		const size = count
		const pageCount = Math.ceil(size / limit)
		filter.pageCount = pageCount

		if (page > pageCount) {
			skip = (pageCount - 1) * limit
		}

		if (count <= 0) {
			return res.status(200).json({
				success: 'Load list stores successfully',
				filter,
				size,
				stores: []
			})
		}

		Store.find(filterArgs)
			.select('-e_wallet')
			.sort({
				[sortBy as string]: order,
				[sortMoreBy as string]: order,
				_id: 1
			})
			.skip(skip)
			.limit(limit)
			.populate('ownerId')
			.populate('staffIds')
			.populate('commissionId', '_id name fee')
			.exec()
			.then((stores) => {
				stores.forEach((store) => {
					store.ownerId = safeCleanUser(store.ownerId)
					store.staffIds = store.staffIds.map((staff) => safeCleanUser(staff))
				})

				return res.status(200).json({
					success: 'Load list stores successfully',
					filter,
					size,
					stores
				})
			})
			.catch(() => {
				return res.status(500).json({
					error: 'Load list stores failed'
				})
			})
	})
}

// GET STORES BY USER
export const getStoresByUser = (req: StoreRequest, res: Response): void => {
	const search = req.query.search ? req.query.search : ''

	let isActive: boolean[] = [true, false]
	if (req.query.isActive == 'true') isActive = [true]
	if (req.query.isActive == 'false') isActive = [false]

	const sortBy = req.query.sortBy ? req.query.sortBy : '_id'
	const sortMoreBy = req.query.sortMoreBy ? req.query.sortMoreBy : '_id'
	const order =
		req.query.order && (req.query.order == 'asc' || req.query.order == 'desc')
			? req.query.order
			: 'asc'

	const limit =
		req.query.limit && Number(req.query.limit) > 0
			? parseInt(req.query.limit)
			: 6
	const page =
		req.query.page && Number(req.query.page) > 0 ? parseInt(req.query.page) : 1
	let skip = limit * (page - 1)

	const commissionId = req.query.commissionId
		? [req.query.commissionId]
		: req.loadedCommissions

	const filter: StoreFilterType = {
		search: search as string,
		sortBy: sortBy as string,
		sortMoreBy: sortMoreBy as string,
		order: order as string,
		isActive,
		commissionId: commissionId as string[],
		limit,
		pageCurrent: page
	}

	const filterArgs = {
		$or: [
			{
				name: {
					$regex: search,
					$options: 'i'
				},
				ownerId: req.user._id
			},
			{
				name: {
					$regex: search,
					$options: 'i'
				},
				staffIds: req.user._id
			},
			{
				bio: {
					$regex: search,
					$options: 'i'
				},
				ownerId: req.user._id
			},
			{
				bio: {
					$regex: search,
					$options: 'i'
				},
				staffIds: req.user._id
			}
		],
		isActive: { $in: isActive },
		commissionId: { $in: commissionId }
	}

	Store.countDocuments(filterArgs, (error: Error, count: number) => {
		if (error) {
			return res.status(404).json({
				error: 'Stores not found'
			})
		}

		const size = count
		const pageCount = Math.ceil(size / limit)
		filter.pageCount = pageCount

		if (page > pageCount) {
			skip = (pageCount - 1) * limit
		}

		if (count <= 0) {
			return res.status(200).json({
				success: 'Load list stores successfully',
				filter,
				size,
				stores: []
			})
		}

		Store.find(filterArgs)
			.select('-e_wallet')
			.sort({
				[sortBy as string]: order,
				[sortMoreBy as string]: order,
				_id: 1
			})
			.skip(skip)
			.limit(limit)
			.populate('ownerId')
			.populate('staffIds')
			.populate('commissionId', '_id name fee')
			.exec()
			.then((stores) => {
				stores.forEach((store) => {
					store.ownerId = safeCleanUser(store.ownerId)
					store.staffIds = store.staffIds.map((staff) => safeCleanUser(staff))
				})

				return res.status(200).json({
					success: 'Load list stores by user successfully',
					filter,
					size,
					stores
				})
			})
			.catch(() => {
				return res.status(500).json({
					error: 'Load list stores failed'
				})
			})
	})
}

// GET STORES FOR ADMIN
export const getStoresForAdmin = (req: StoreRequest, res: Response): void => {
	const search = req.query.search ? req.query.search : ''

	let isActive: boolean[] = [true, false]
	if (req.query.isActive == 'true') isActive = [true]
	if (req.query.isActive == 'false') isActive = [false]

	const sortBy = req.query.sortBy ? req.query.sortBy : '_id'
	const sortMoreBy = req.query.sortMoreBy ? req.query.sortMoreBy : '_id'
	const order =
		req.query.order && (req.query.order == 'asc' || req.query.order == 'desc')
			? req.query.order
			: 'asc'

	const limit =
		req.query.limit && Number(req.query.limit) > 0
			? parseInt(req.query.limit)
			: 6
	const page =
		req.query.page && Number(req.query.page) > 0 ? parseInt(req.query.page) : 1
	let skip = limit * (page - 1)

	const commissionId = req.query.commissionId
		? [req.query.commissionId]
		: req.loadedCommissions

	const filter: StoreFilterType = {
		search: search as string,
		sortBy: sortBy as string,
		sortMoreBy: sortMoreBy as string,
		order: order as string,
		isActive,
		commissionId: commissionId as string[],
		limit,
		pageCurrent: page
	}

	const filterArgs = {
		$or: [
			{
				name: {
					$regex: search,
					$options: 'i'
				}
			},
			{
				bio: { $regex: search, $options: 'i' }
			}
		],
		isActive: { $in: isActive },
		commissionId: { $in: commissionId }
	}

	Store.countDocuments(filterArgs, (error: Error, count: number) => {
		if (error) {
			return res.status(404).json({
				error: 'Stores not found'
			})
		}

		const size = count
		const pageCount = Math.ceil(size / limit)
		filter.pageCount = pageCount

		if (page > pageCount) {
			skip = (pageCount - 1) * limit
		}

		if (count <= 0) {
			return res.status(200).json({
				success: 'Load list stores successfully',
				filter,
				size,
				stores: []
			})
		}

		Store.find(filterArgs)
			.select('-e_wallet')
			.sort({
				[sortBy as string]: order,
				[sortMoreBy as string]: order,
				_id: 1
			})
			.skip(skip)
			.limit(limit)
			.populate('ownerId')
			.populate('staffIds')
			.populate('commissionId', '_id name fee')
			.exec()
			.then((stores) => {
				stores.forEach((store) => {
					store.ownerId = safeCleanUserLess(store.ownerId)
					store.staffIds = store.staffIds.map((staff) =>
						safeCleanUserLess(staff)
					)
				})

				return res.status(200).json({
					success: 'Load list stores successfully',
					filter,
					size,
					stores
				})
			})
			.catch(() => {
				return res.status(500).json({
					error: 'Load list stores failed'
				})
			})
	})
}
