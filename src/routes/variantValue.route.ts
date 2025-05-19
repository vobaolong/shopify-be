import express from 'express'
const router = express.Router()
import { ROUTES } from '../constants/route.constant'
import { isAuth, isAdmin } from '../middlewares/auth.middleware'
import { getUserById } from '../controllers/user.controller'
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
import { adminAuth } from './user.route'

// ----------- GET ROUTES -----------
router.get(ROUTES.VARIANT_VALUE.ACTIVE, getActiveVariantValues)
router.get(ROUTES.VARIANT_VALUE.LIST, ...adminAuth, getVariantValues)

// ----------- POST ROUTES -----------
router.post(ROUTES.VARIANT_VALUE.CREATE, isAuth, createValue)

// ----------- PUT ROUTES -----------
router.put(ROUTES.VARIANT_VALUE.UPDATE, ...adminAuth, updateValue)

// ----------- DELETE ROUTES -----------
router.delete(ROUTES.VARIANT_VALUE.DELETE, ...adminAuth, removeValue)

// ----------- RESTORE ROUTES -----------
router.get(ROUTES.VARIANT_VALUE.RESTORE, ...adminAuth, restoreValue)

// ----------- PARAMS -----------
router.param('variantValueId', getValueById)
router.param('variantId', getVariantById)
router.param('userId', getUserById)

export default router
