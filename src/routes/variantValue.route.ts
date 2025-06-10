import express from 'express'
const router = express.Router()
import { ROUTES } from '../constants/route.constant'
import { isAuth, isAdmin } from '../middlewares/auth.middleware'
import { getUserById } from '../controllers/user'
import { getVariantById } from '../controllers/variant'
import {
  getVariantValueById,
  createVariantValue,
  updateVariantValue,
  removeVariantValue,
  restoreVariantValue,
  getVariantValues
} from '../controllers/variantValue'
import { adminAuth } from './user.route'

// ----------- GET ROUTES -----------
router.get(ROUTES.VARIANT_VALUE.LIST, ...adminAuth, getVariantValues)

// ----------- POST ROUTES -----------
router.post(ROUTES.VARIANT_VALUE.CREATE, isAuth, createVariantValue)

// ----------- PUT ROUTES -----------
router.put(ROUTES.VARIANT_VALUE.UPDATE, ...adminAuth, updateVariantValue)

// ----------- DELETE ROUTES -----------
router.delete(ROUTES.VARIANT_VALUE.DELETE, ...adminAuth, removeVariantValue)

// ----------- RESTORE ROUTES -----------
router.get(ROUTES.VARIANT_VALUE.RESTORE, ...adminAuth, restoreVariantValue)

// ----------- PARAMS -----------
router.param('variantValueId', getVariantValueById)
router.param('variantId', getVariantById)
router.param('userId', getUserById)

export default router
