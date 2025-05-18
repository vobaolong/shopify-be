import express from 'express'
const router = express.Router()
import storeValidator from '../validators/store.validator'
import { validateHandler } from '../helpers/validateHandler'

// Import route constants
import { ROUTES } from '../constants/route.constant'

import {
  isAuth,
  isAdmin,
  isManager,
  isOwner
} from '../controllers/auth.controller'
import { userById } from '../controllers/user.controller'
import {
  uploadMultipleImagesController,
  uploadSingleImage
} from '../controllers/upload.controller'
import {
  getStoreById,
  getStore,
  createStore,
  getStoreProfile,
  updateStore,
  activeStore,
  updateCommission,
  openStore,
  updateAvatar,
  updateCover,
  getListFeatureImages,
  addFeatureImage,
  updateFeatureImage,
  removeFeaturedImage,
  addStaff,
  cancelStaff,
  getStaffs,
  removeStaff,
  getStoreCommissions,
  getStores,
  getStoresByUser,
  getStoresForAdmin,
  getCommission
} from '../controllers/store.controller'
import { activeAllProduct } from '../controllers/product.controller'

router.get(ROUTES.STORE.GET_STORE, getStore)

router.get(ROUTES.STORE.PROFILE, isAuth, isManager, getStoreProfile)

router.get(ROUTES.STORE.LIST_STORES, getStoreCommissions, getStores)

router.get(
  ROUTES.STORE.STORES_BY_USER,
  isAuth,
  getStoreCommissions,
  getStoresByUser
)

router.get(
  ROUTES.STORE.STORES_FOR_ADMIN,
  isAuth,
  isAdmin,
  getStoreCommissions,
  getStoresForAdmin
)

router.post(ROUTES.STORE.CREATE, isAuth, uploadSingleImage, createStore)

router.put(
  ROUTES.STORE.UPDATE,
  isAuth,
  isManager,
  storeValidator.updateStore(),
  validateHandler,
  updateStore
)

router.put(
  ROUTES.STORE.ACTIVE,
  isAuth,
  isAdmin,
  storeValidator.activeStore(),
  validateHandler,
  activeStore,
  activeAllProduct
)

router.get(ROUTES.STORE.COMMISSION, getCommission)

router.put(
  ROUTES.STORE.COMMISSION_UPDATE,
  isAuth,
  isAdmin,
  storeValidator.updateCommission(),
  validateHandler,
  updateCommission
)

router.put(
  ROUTES.STORE.OPEN,
  isAuth,
  isManager,
  storeValidator.openStore(),
  validateHandler,
  openStore
)

router.put(
  ROUTES.STORE.AVATAR,
  isAuth,
  isManager,
  uploadSingleImage,
  updateAvatar
)

router.put(
  ROUTES.STORE.COVER,
  isAuth,
  isManager,
  uploadSingleImage,
  updateCover
)

router.get(ROUTES.STORE.FEATURED_IMAGES, getListFeatureImages)

router.post(
  ROUTES.STORE.ADD_FEATURED_IMAGE,
  isAuth,
  isManager,
  uploadMultipleImagesController,
  addFeatureImage
)

router.put(
  ROUTES.STORE.UPDATE_FEATURED_IMAGE,
  isAuth,
  isManager,
  uploadMultipleImagesController,
  updateFeatureImage
)

router.delete(
  ROUTES.STORE.DELETE_FEATURED_IMAGE,
  isAuth,
  isManager,
  removeFeaturedImage
)

router.get(ROUTES.STORE.STAFF, isAuth, isManager, getStaffs)

router.post(ROUTES.STORE.ADD_STAFF, isAuth, isOwner, addStaff)

router.delete(ROUTES.STORE.REMOVE_STAFF, isAuth, isOwner, removeStaff)

router.delete(ROUTES.STORE.CANCEL_STAFF, isAuth, isManager, cancelStaff)

//router params
router.param('userId', userById)

router.param('storeId', getStoreById)

export default router
