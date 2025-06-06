import express from 'express'
const router = express.Router()

// Import route constants
import { ROUTES } from '../constants/route.constant'
import { getUserById } from '../controllers/user.controller'
import { getStoreById } from '../controllers/store'
import { checkCategoryChild } from '../controllers/category.controller'

import {
  getProductById,
  getProduct,
  createProduct,
  updateProduct,
  sellingProduct,
  activeProduct,
  addToListImages,
  updateListImages,
  removeFromListImages,
  getProductCategories,
  getProductCategoriesByStore,
  getProducts,
  getProductsByStore,
  getStoreProductsForSeller,
  getProductsForAdmin,
  getProductForSeller
} from '../controllers/product.controller'

import {
  uploadProductSingle,
  uploadProductMultiple
} from '../middlewares/uploadCloudinary'
import { managerAuth } from './store.route'
import { adminAuth } from './user.route'

// ----------- GET ROUTES -----------
router.get(ROUTES.PRODUCT.GET_PRODUCT, getProduct)
router.get(
  ROUTES.PRODUCT.PRODUCT_FOR_MANAGER,
  ...managerAuth,
  getProductForSeller
)
router.get(ROUTES.PRODUCT.PRODUCTS_ACTIVE, getProductCategories, getProducts)
router.get(
  ROUTES.PRODUCT.PRODUCTS_BY_STORE,
  getProductCategoriesByStore,
  getProductsByStore
)
router.get(
  ROUTES.PRODUCT.PRODUCTS_BY_STORE_FOR_MANAGER,
  ...managerAuth,
  getProductCategoriesByStore,
  getStoreProductsForSeller
)
router.get(ROUTES.PRODUCT.PRODUCTS_FOR_ADMIN, ...adminAuth, getProductsForAdmin)

// ----------- POST ROUTES -----------
router.post(
  ROUTES.PRODUCT.CREATE,
  ...managerAuth,
  uploadProductSingle,
  checkCategoryChild,
  createProduct
)
router.post(
  ROUTES.PRODUCT.IMAGES_ADD,
  ...managerAuth,
  uploadProductMultiple,
  addToListImages
)

// ----------- PUT ROUTES -----------
router.put(
  ROUTES.PRODUCT.UPDATE,
  ...managerAuth,
  uploadProductSingle,
  checkCategoryChild,
  updateProduct
)
router.put(ROUTES.PRODUCT.SELLING, ...managerAuth, sellingProduct)
router.put(ROUTES.PRODUCT.ACTIVE, ...adminAuth, activeProduct)
router.put(
  ROUTES.PRODUCT.IMAGES_UPDATE,
  ...managerAuth,
  uploadProductMultiple,
  updateListImages
)

// ----------- DELETE ROUTES -----------
router.delete(
  ROUTES.PRODUCT.IMAGES_REMOVE,
  ...managerAuth,
  removeFromListImages
)

// ----------- PARAMS -----------
router.param('productId', getProductById)
router.param('userId', getUserById)
router.param('storeId', getStoreById)

export default router
