import express from 'express'
const router = express.Router()

// Import route constants
import { ROUTES } from '../constants/route.constant'

//import controllers
import { isAuth, isAdmin, isManager } from '../controllers/auth.controller'
import { userById } from '../controllers/user.controller'
import { getStoreById } from '../controllers/store.controller'
import { checkCategoryChild } from '../controllers/category.controller'
import {
	uploadMultipleImagesController,
	uploadSingleImage
} from '../controllers/upload.controller'
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

// GET PRODUCT
router.get(ROUTES.PRODUCT.GET_PRODUCT, getProduct)

// GET PRODUCT FOR MANAGER
router.get(
	ROUTES.PRODUCT.PRODUCT_FOR_MANAGER,
	isAuth,
	isManager,
	getProductForSeller
)

// GET ACTIVE PRODUCT LIST
router.get(ROUTES.PRODUCT.ACTIVE, getProductCategories, getProducts)

// GET SELLING PRODUCT LIST BY STORE
router.get(
	ROUTES.PRODUCT.PRODUCTS_BY_STORE,
	getProductCategoriesByStore,
	getProductsByStore
)

// GET PRODUCT LIST BY STORE FOR MANAGER
router.get(
	ROUTES.PRODUCT.PRODUCTS_BY_STORE_FOR_MANAGER,
	isAuth,
	isManager,
	getProductCategoriesByStore,
	getStoreProductsForSeller
)

// GET PRODUCT LIST FOR ADMIN
router.get(
	ROUTES.PRODUCT.PRODUCTS_FOR_ADMIN,
	isAuth,
	isAdmin,
	getProductsForAdmin
)

// CREATE PRODUCT
router.post(
	ROUTES.PRODUCT.CREATE,
	isAuth,
	isManager,
	uploadSingleImage,
	checkCategoryChild,
	createProduct
)

// UPDATE PRODUCT
router.put(
	ROUTES.PRODUCT.UPDATE,
	isAuth,
	isManager,
	uploadSingleImage,
	checkCategoryChild,
	updateProduct
)

// SELLING PRODUCT
router.put(ROUTES.PRODUCT.SELLING, isAuth, isManager, sellingProduct)

// ACTIVE PRODUCT
router.put(ROUTES.PRODUCT.ACTIVE, isAuth, isAdmin, activeProduct)

// ADD PRODUCT IMAGE
router.post(
	ROUTES.PRODUCT.IMAGES_ADD,
	isAuth,
	isManager,
	uploadMultipleImagesController,
	addToListImages
)

// UPDATE PRODUCT IMAGE
router.put(
	ROUTES.PRODUCT.IMAGES_UPDATE,
	isAuth,
	isManager,
	uploadMultipleImagesController,
	updateListImages
)

// REMOVE PRODUCT IMAGE
router.delete(
	ROUTES.PRODUCT.IMAGES_REMOVE,
	isAuth,
	isManager,
	removeFromListImages
)

// ROUTER PARAMS
router.param('productId', getProductById)
router.param('userId', userById)
router.param('storeId', getStoreById)

export default router
