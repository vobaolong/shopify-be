import express from 'express'
const router = express.Router()
// Import route constants
import { ROUTES } from '../constants/route.constant'
// Middlewares
import { isAuth, isAdmin } from '../middlewares/auth.middleware'
import { getUserById } from '../controllers/user'
import {
  getBrandById,
  getBrand,
  checkBrand,
  createBrand,
  updateBrand,
  removeBrand,
  restoreBrand,
  listBrands,
  getBrandCategories,
  checkBrandNameExist
} from '../controllers/brand'

// Middleware groups
const adminAuth = [isAuth, isAdmin]

// ----------- GET ROUTES -----------
router.get(ROUTES.BRAND.GET_BY_ID, ...adminAuth, getBrand)
router.get(ROUTES.BRAND.ACTIVE, getBrandCategories, listBrands)
router.get(ROUTES.BRAND.LIST_FOR_ADMIN, ...adminAuth, listBrands)
router.get(ROUTES.BRAND.CHECK_NAME, checkBrandNameExist)

// ----------- POST ROUTES -----------
router.post(ROUTES.BRAND.CREATE, ...adminAuth, checkBrand, createBrand)

// ----------- PUT ROUTES -----------
router.put(ROUTES.BRAND.UPDATE, ...adminAuth, checkBrand, updateBrand)

// ----------- DELETE ROUTES -----------
router.delete(ROUTES.BRAND.DELETE, ...adminAuth, removeBrand)

// ----------- RESTORE ROUTES -----------
router.get(ROUTES.BRAND.RESTORE, ...adminAuth, restoreBrand)

// ----------- PARAMS -----------
router.param('brandId', getBrandById)
router.param('userId', getUserById)

export default router
