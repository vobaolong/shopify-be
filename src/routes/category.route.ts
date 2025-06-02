import express from 'express'
const router = express.Router()
// Import route constants
import { ROUTES } from '../constants/route.constant'
// Middlewares
import { isAuth, isAdmin } from '../middlewares/auth.middleware'
import { getStoreById } from '../controllers/store.controller'
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
import { uploadCategorySingle } from '../middlewares/uploadCloudinary'

// Middleware groups
const adminAuth = [isAuth, isAdmin]

// ----------- GET ROUTES -----------
router.get(ROUTES.CATEGORY.GET_BY_ID, getCategory)
router.get(ROUTES.CATEGORY.ACTIVE, getActiveCategories)
router.get(
  ROUTES.CATEGORY.LIST_BY_STORE,
  getProductCategoriesByStore,
  getCategoriesByStore
)
router.get(ROUTES.CATEGORY.LIST_BY_ADMIN, ...adminAuth, getCategories)

// ----------- POST ROUTES -----------
router.post(
  ROUTES.CATEGORY.CREATE,
  ...adminAuth,
  uploadCategorySingle,
  checkCategory,
  createCategory
)

// ----------- PUT ROUTES -----------
router.put(
  ROUTES.CATEGORY.UPDATE,
  ...adminAuth,
  uploadCategorySingle,
  checkCategory,
  updateCategory
)

// ----------- DELETE ROUTES -----------
router.delete(ROUTES.CATEGORY.DELETE, ...adminAuth, removeCategory)

// ----------- RESTORE ROUTES -----------
router.get(ROUTES.CATEGORY.RESTORE, ...adminAuth, restoreCategory)

// ----------- PARAMS -----------
router.param('categoryId', getCategoryById)
router.param('storeId', getStoreById)

export default router
