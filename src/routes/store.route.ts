import express from 'express'
const router = express.Router()
import storeValidator from '../validators/store.validator'
import { validateHandler } from '../helpers/validateHandler'

// Import route constants
import { ROUTES } from '../constants/route.constant'

// Middlewares
import { isAuth, isAdmin, isManager, isOwner } from '../controllers/auth.controller'
import { userById } from '../controllers/user.controller'
import { uploadMultipleImagesController, uploadSingleImage } from '../controllers/upload.controller'
import {
	getStoreById,
	getStore,
	createStore,
	getStoreProfile,
	updateStore,
	activeStore,
	updateCommission,
	openStore,
	updateAvatar,
	updateCover,
	getListFeatureImages,
	addFeatureImage,
	updateFeatureImage,
	removeFeaturedImage,
	addStaff,
	cancelStaff,
	getStaffs,
	removeStaff,
	getStoreCommissions,
	getStores,
	getStoresByUser,
	getStoresForAdmin,
	getCommission
} from '../controllers/store.controller'
import { activeAllProduct } from '../controllers/product.controller'
import {
	uploadAvatarSingle,
	uploadCoverSingle,
	uploadProductMultiple,
	uploadCloudinarySingle
} from '../middlewares/uploadCloudinary'

// Middleware groups
const adminAuth = [isAuth, isAdmin]
const managerAuth = [isAuth, isManager]
const ownerAuth = [isAuth, isOwner]
const storeValidatorGroup = [storeValidator.updateStore(), validateHandler]
const commissionValidatorGroup = [storeValidator.updateCommission(), validateHandler]
const openStoreValidatorGroup = [storeValidator.openStore(), validateHandler]
const activeStoreValidatorGroup = [storeValidator.activeStore(), validateHandler]
const avatarUploadGroup = [uploadAvatarSingle]
const coverUploadGroup = [uploadCoverSingle]
const featuredImagesUploadGroup = [uploadProductMultiple]

// ----------- GET ROUTES -----------
router.get(ROUTES.STORE.GET_STORE, getStore)
router.get(ROUTES.STORE.PROFILE, ...managerAuth, getStoreProfile)
router.get(ROUTES.STORE.LIST_STORES, getStoreCommissions, getStores)
router.get(ROUTES.STORE.STORES_BY_USER, isAuth, getStoreCommissions, getStoresByUser)
router.get(ROUTES.STORE.STORES_FOR_ADMIN, ...adminAuth, getStoreCommissions, getStoresForAdmin)
router.get(ROUTES.STORE.COMMISSION, getCommission)
router.get(ROUTES.STORE.FEATURED_IMAGES, getListFeatureImages)
router.get(ROUTES.STORE.STAFF, ...managerAuth, getStaffs)

// ----------- POST ROUTES -----------
router.post(ROUTES.STORE.CREATE, isAuth, uploadCloudinarySingle, createStore)
router.post(ROUTES.STORE.ADD_FEATURED_IMAGE, ...managerAuth, ...featuredImagesUploadGroup, addFeatureImage)
router.post(ROUTES.STORE.ADD_STAFF, ...ownerAuth, addStaff)

// ----------- PUT ROUTES -----------
router.put(ROUTES.STORE.UPDATE, ...managerAuth, ...storeValidatorGroup, updateStore)
router.put(ROUTES.STORE.ACTIVE, ...adminAuth, ...activeStoreValidatorGroup, activeStore, activeAllProduct)
router.put(ROUTES.STORE.COMMISSION_UPDATE, ...adminAuth, ...commissionValidatorGroup, updateCommission)
router.put(ROUTES.STORE.OPEN, ...managerAuth, ...openStoreValidatorGroup, openStore)
router.put(ROUTES.STORE.AVATAR, ...managerAuth, ...avatarUploadGroup, updateAvatar)
router.put(ROUTES.STORE.COVER, ...managerAuth, ...coverUploadGroup, updateCover)
router.put(ROUTES.STORE.UPDATE_FEATURED_IMAGE, ...managerAuth, ...featuredImagesUploadGroup, updateFeatureImage)

// ----------- DELETE ROUTES -----------
router.delete(ROUTES.STORE.DELETE_FEATURED_IMAGE, ...managerAuth, removeFeaturedImage)
router.delete(ROUTES.STORE.REMOVE_STAFF, ...ownerAuth, removeStaff)
router.delete(ROUTES.STORE.CANCEL_STAFF, ...managerAuth, cancelStaff)

// ----------- PARAMS -----------
router.param('userId', userById)
router.param('storeId', getStoreById)

export default router
