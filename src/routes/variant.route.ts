import express from 'express'
const router = express.Router()

// Import route constants
import { ROUTES } from '../constants/route.constant'

// Middlewares
import { isAuth, isAdmin } from '../middlewares/auth.middleware'
import { getUserById } from '../controllers/user.controller'
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
import { adminAuth } from './user.route'

// Middleware groups
const variantValidator = [checkListCategoriesChild, checkVariant]

// ----------- GET ROUTES -----------
router.get(ROUTES.VARIANT.BY_ID, ...adminAuth, getVariant)
router.get(ROUTES.VARIANT.ACTIVE, getActiveVariants)
router.get(ROUTES.VARIANT.LIST, ...adminAuth, getVariants)

// ----------- POST ROUTES -----------
router.post(
  ROUTES.VARIANT.CREATE,
  ...adminAuth,
  ...variantValidator,
  createVariant
)

// ----------- PUT ROUTES -----------
router.put(
  ROUTES.VARIANT.UPDATE,
  ...adminAuth,
  ...variantValidator,
  updateVariant
)

// ----------- DELETE ROUTES -----------
router.delete(
  ROUTES.VARIANT.DELETE,
  ...adminAuth,
  removeVariant,
  removeAllValues
)

// ----------- RESTORE ROUTES -----------
router.get(
  ROUTES.VARIANT.RESTORE,
  ...adminAuth,
  restoreVariant,
  restoreAllValues
)

// ----------- PARAMS -----------
router.param('variantId', getVariantById)
router.param('userId', getUserById)

export default router
