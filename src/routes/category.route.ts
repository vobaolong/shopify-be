import express from 'express'
const router = express.Router()

// Import route constants
import { ROUTES } from '../constants/route.constant'

// Import controllers
import { isAuth, isAdmin } from '../controllers/auth.controller'
import { userById } from '../controllers/user.controller'
import { getStoreById } from '../controllers/store.controller'
import { uploadSingleImage } from '../controllers/upload.controller'
import {
	getCategoryById,
	getCategory,
	checkCategory,
	createCategory,
	updateCategory,
	removeCategory,
	restoreCategory,
	getActiveCategories,
	getCategories,
	getCategoriesByStore
} from '../controllers/category.controller'
import { getProductCategoriesByStore } from '../controllers/product.controller'

// Routes
router.get(ROUTES.CATEGORY.GET_BY_ID, getCategory)
router.get(ROUTES.CATEGORY.ACTIVE, getActiveCategories)
router.get(
	ROUTES.CATEGORY.LIST_BY_STORE,
	getProductCategoriesByStore,
	getCategoriesByStore
)
router.get(ROUTES.CATEGORY.LIST_BY_USER, isAuth, isAdmin, getCategories)
router.post(
	ROUTES.CATEGORY.CREATE,
	isAuth,
	isAdmin,
	uploadSingleImage,
	checkCategory,
	createCategory
)
router.put(
	ROUTES.CATEGORY.UPDATE,
	isAuth,
	isAdmin,
	uploadSingleImage,
	checkCategory,
	updateCategory
)
router.delete(ROUTES.CATEGORY.DELETE, isAuth, isAdmin, removeCategory)
router.get(ROUTES.CATEGORY.RESTORE, isAuth, isAdmin, restoreCategory)

// Params
router.param('categoryId', getCategoryById)
router.param('userId', userById)
router.param('storeId', getStoreById)

export default router
