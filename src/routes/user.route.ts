import express from 'express'
const router = express.Router()

// Import route constants
import { ROUTES } from '../constants/route.constant'

// IMPORT VALIDATORS
import * as userValidator from '../validators/user.validator'
import { validateHandler } from '../helpers/validateHandler'

// IMPORT CONTROLLERS
import { isAuth, isAdmin, verifyPassword } from '../controllers/auth.controller'
import { uploadSingleImage } from '../controllers/upload.controller'
import {
  userById,
  getUser,
  updateProfile,
  addAddress,
  updateAddress,
  removeAddress,
  updateAvatar,
  updateCover,
  listUser,
  getUserProfile,
  listUserForAdmin,
  updatePassword
} from '../controllers/user.controller'

// GET USER
router.get(ROUTES.USER.GET_USER, getUser)

// GET USER PROFILE
router.get(ROUTES.USER.PROFILE, isAuth, getUserProfile)

// UPDATE USER PROFILE
router.put(
  ROUTES.USER.PROFILE_UPDATE,
  isAuth,
  userValidator.updateProfile(),
  validateHandler,
  updateProfile
)

// UPDATE USER PASSWORD
router.put(
  ROUTES.USER.PASSWORD_UPDATE,
  isAuth,
  userValidator.updateAccount(),
  validateHandler,
  verifyPassword,
  updatePassword
)

// LIST USER
router.get(ROUTES.USER.LIST_USERS, listUser)

// LIST USER FOR ADMIN
router.get(ROUTES.USER.LIST_USERS_ADMIN, isAuth, isAdmin, listUserForAdmin)

// ADD USER ADDRESS
router.post(
  ROUTES.USER.ADDRESS_ADD,
  isAuth,
  userValidator.userAddress(),
  validateHandler,
  addAddress
)

// UPDATE USER ADDRESS
router.put(
  ROUTES.USER.ADDRESS_UPDATE,
  isAuth,
  userValidator.userAddress(),
  validateHandler,
  updateAddress
)

// DELETE USER ADDRESS
router.delete(ROUTES.USER.ADDRESS_DELETE, isAuth, removeAddress)

// UPDATE USER AVATAR
router.put(ROUTES.USER.AVATAR_UPDATE, isAuth, uploadSingleImage, updateAvatar)

// UPDATE USER COVER
router.put(ROUTES.USER.COVER_UPDATE, isAuth, uploadSingleImage, updateCover)

// ROUTER PARAMS
router.param('userId', userById)

export default router
