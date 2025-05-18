import express from 'express'
const router = express.Router()

// Import route constants
import { ROUTES } from '../constants/route.constant'

//import controllers
import { isAuth, isAdmin } from '../controllers/auth.controller'
import { userById } from '../controllers/user.controller'
import { checkListCategoriesChild } from '../controllers/category.controller'
import {
	getBrandById,
	getBrand,
	checkBrand,
	createBrand,
	updateBrand,
	removeBrand,
	restoreBrand,
	listBrands,
	getBrandCategories
} from '../controllers/brand.controller'

//routes
router.get(ROUTES.BRAND.GET_BY_ID, isAuth, isAdmin, getBrand)
router.get(ROUTES.BRAND.ACTIVE, getBrandCategories, listBrands)
router.get(ROUTES.BRAND.LIST, listBrands)
router.get(ROUTES.BRAND.LIST_FOR_ADMIN, isAuth, isAdmin, listBrands)
router.post(
	ROUTES.BRAND.CREATE,
	isAuth,
	isAdmin,
	checkListCategoriesChild,
	checkBrand,
	createBrand
)
router.put(
	ROUTES.BRAND.UPDATE,
	isAuth,
	isAdmin,
	checkListCategoriesChild,
	checkBrand,
	updateBrand
)
router.delete(ROUTES.BRAND.DELETE, isAuth, isAdmin, removeBrand)
router.get(ROUTES.BRAND.RESTORE, isAuth, isAdmin, restoreBrand)

//router params
router.param('brandId', getBrandById)
router.param('userId', userById)

export default router
