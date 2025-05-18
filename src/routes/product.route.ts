import express from 'express'
const router = express.Router()

// Import route constants
import { ROUTES } from '../constants/route.constant'

// Middlewares
import { isAuth, isAdmin, isManager } from '../controllers/auth.controller'
import { userById } from '../controllers/user.controller'
import { getStoreById } from '../controllers/store.controller'
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
import { uploadProductSingle, uploadProductMultiple } from '../middlewares/uploadCloudinary'

// Middleware groups
const managerAuth = [isAuth, isManager]
const adminAuth = [isAuth, isAdmin]

// ----------- PRODUCT ROUTES -----------
// Get product
router.get(ROUTES.PRODUCT.GET_PRODUCT, getProduct)

// Get product for manager
router.get(ROUTES.PRODUCT.PRODUCT_FOR_MANAGER, ...managerAuth, getProductForSeller)

// Get active product list
router.get(ROUTES.PRODUCT.ACTIVE, getProductCategories, getProducts)

// Get selling product list by store
router.get(ROUTES.PRODUCT.PRODUCTS_BY_STORE, getProductCategoriesByStore, getProductsByStore)

// Get product list by store for manager
router.get(ROUTES.PRODUCT.PRODUCTS_BY_STORE_FOR_MANAGER, ...managerAuth, getProductCategoriesByStore, getStoreProductsForSeller)

// Get product list for admin
router.get(ROUTES.PRODUCT.PRODUCTS_FOR_ADMIN, ...adminAuth, getProductsForAdmin)

// Create product
router.post(ROUTES.PRODUCT.CREATE, ...managerAuth, uploadProductSingle, checkCategoryChild, createProduct)

// Update product
router.put(ROUTES.PRODUCT.UPDATE, ...managerAuth, uploadProductSingle, checkCategoryChild, updateProduct)

// Selling product
router.put(ROUTES.PRODUCT.SELLING, ...managerAuth, sellingProduct)

// Active product
router.put(ROUTES.PRODUCT.ACTIVE, ...adminAuth, activeProduct)

// Add product image
router.post(ROUTES.PRODUCT.IMAGES_ADD, ...managerAuth, uploadProductMultiple, addToListImages)

// Update product image
router.put(ROUTES.PRODUCT.IMAGES_UPDATE, ...managerAuth, uploadProductMultiple, updateListImages)

// Remove product image
router.delete(ROUTES.PRODUCT.IMAGES_REMOVE, ...managerAuth, removeFromListImages)

// ----------- PARAMS -----------
router.param('productId', getProductById)
router.param('userId', userById)
router.param('storeId', getStoreById)

export default router
