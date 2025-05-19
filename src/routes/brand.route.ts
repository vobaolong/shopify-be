import express from 'express'
const router = express.Router()
// Import route constants
import { ROUTES } from '../constants/route.constant'
// Middlewares
import { isAuth, isAdmin } from '../middlewares/auth.middleware'
import { getUserById } from '../controllers/user.controller'
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

// Middleware groups
const adminAuth = [isAuth, isAdmin]
const brandValidator = [checkListCategoriesChild, checkBrand]

// ----------- GET ROUTES -----------
router.get(ROUTES.BRAND.GET_BY_ID, ...adminAuth, getBrand)
router.get(ROUTES.BRAND.ACTIVE, getBrandCategories, listBrands)
router.get(ROUTES.BRAND.LIST, listBrands)
router.get(ROUTES.BRAND.LIST_FOR_ADMIN, ...adminAuth, listBrands)

// ----------- POST ROUTES -----------
router.post(ROUTES.BRAND.CREATE, ...adminAuth, ...brandValidator, createBrand)

// ----------- PUT ROUTES -----------
router.put(ROUTES.BRAND.UPDATE, ...adminAuth, ...brandValidator, updateBrand)

// ----------- DELETE ROUTES -----------
router.delete(ROUTES.BRAND.DELETE, ...adminAuth, removeBrand)

// ----------- RESTORE ROUTES -----------
router.get(ROUTES.BRAND.RESTORE, ...adminAuth, restoreBrand)

// ----------- PARAMS -----------
router.param('brandId', getBrandById)
router.param('userId', getUserById)

export default router
