import express from 'express'
const router = express.Router()

// Import route constants
import { ROUTES } from '../constants/route.constant'

//import controllers
import { isAuth, isAdmin } from '../controllers/auth.controller'
import { userById } from '../controllers/user.controller'
import { checkListCategoriesChild } from '../controllers/category.controller'
import {
	getVariantById,
	getVariant,
	checkVariant,
	createVariant,
	updateVariant,
	removeVariant,
	restoreVariant,
	getVariants,
	getActiveVariants
} from '../controllers/variant.controller'
import {
	removeAllValues,
	restoreAllValues
} from '../controllers/variantValue.controller'

//routes
router.get(ROUTES.VARIANT.BY_ID, isAuth, isAdmin, getVariant)
router.get(ROUTES.VARIANT.ACTIVE, getActiveVariants)
router.get(ROUTES.VARIANT.LIST, isAuth, isAdmin, getVariants)
router.post(
	ROUTES.VARIANT.CREATE,
	isAuth,
	isAdmin,
	checkListCategoriesChild,
	checkVariant,
	createVariant
)
router.put(
	ROUTES.VARIANT.UPDATE,
	isAuth,
	isAdmin,
	checkListCategoriesChild,
	checkVariant,
	updateVariant
)
router.delete(
	ROUTES.VARIANT.DELETE,
	isAuth,
	isAdmin,
	removeVariant,
	removeAllValues
)
router.get(
	ROUTES.VARIANT.RESTORE,
	isAuth,
	isAdmin,
	restoreVariant,
	restoreAllValues
)

//router params
router.param('variantId', getVariantById)
router.param('userId', userById)

export default router
