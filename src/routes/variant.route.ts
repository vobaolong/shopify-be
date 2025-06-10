import express from 'express'
const router = express.Router()

// Import route constants
import { ROUTES } from '../constants/route.constant'

// Middlewares
import { getUserById } from '../controllers/user'
import {
  getVariantById,
  readVariant,
  checkVariant,
  createVariant,
  updateVariant,
  removeVariant,
  restoreVariant,
  getVariants,
  getActiveVariants
} from '../controllers/variant'
import { adminAuth } from './user.route'

// ----------- GET ROUTES -----------
router.get(ROUTES.VARIANT.BY_ID, ...adminAuth, readVariant)
router.get(ROUTES.VARIANT.ACTIVE, getActiveVariants)
router.get(ROUTES.VARIANT.LIST, ...adminAuth, getVariants)

// ----------- POST ROUTES -----------
router.post(ROUTES.VARIANT.CREATE, ...adminAuth, checkVariant, createVariant)

// ----------- PUT ROUTES -----------
router.put(ROUTES.VARIANT.UPDATE, ...adminAuth, checkVariant, updateVariant)

// ----------- DELETE ROUTES -----------
router.delete(ROUTES.VARIANT.DELETE, ...adminAuth, removeVariant)

// ----------- RESTORE ROUTES -----------
router.get(ROUTES.VARIANT.RESTORE, ...adminAuth, restoreVariant)

// ----------- PARAMS -----------
router.param('variantId', getVariantById)
router.param('userId', getUserById)

export default router
