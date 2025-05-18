import express from 'express'
const router = express.Router()

import { ROUTES } from '../constants/route.constant'

import { isAuth, isAdmin } from '../controllers/auth.controller'
import { userById } from '../controllers/user.controller'
import { getVariantById } from '../controllers/variant.controller'
import {
	getValueById,
	createValue,
	updateValue,
	removeValue,
	restoreValue,
	getActiveVariantValues,
	getVariantValues
} from '../controllers/variantValue.controller'

router.get(ROUTES.VARIANT_VALUE.ACTIVE, getActiveVariantValues)
router.get(ROUTES.VARIANT_VALUE.LIST, isAuth, isAdmin, getVariantValues)
router.post(ROUTES.VARIANT_VALUE.CREATE, isAuth, createValue)
router.put(ROUTES.VARIANT_VALUE.UPDATE, isAuth, isAdmin, updateValue)
router.delete(ROUTES.VARIANT_VALUE.DELETE, isAuth, isAdmin, removeValue)
router.get(ROUTES.VARIANT_VALUE.RESTORE, isAuth, isAdmin, restoreValue)

//router params
router.param('variantValueId', getValueById)
router.param('variantId', getVariantById)
router.param('userId', userById)

export default router
