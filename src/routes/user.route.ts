import express from 'express'
const router = express.Router()

// Import route constants
import { ROUTES } from '../constants/route.constant'

// Middlewares
import * as userValidator from '../validators/user.validator'
import { validateHandler } from '../helpers/validateHandler'
import { isAuth, isAdmin, verifyPassword } from '../middlewares/auth.middleware'
import {
  uploadAvatarSingle,
  uploadCoverSingle
} from '../middlewares/uploadCloudinary'
import {
  getUserById,
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
} from '../controllers/user'

// Middleware groups
export const adminAuth = [isAuth, isAdmin]
const profileValidator = [userValidator.updateProfile(), validateHandler]
const addressValidator = [userValidator.userAddress(), validateHandler]
const passwordValidator = [
  userValidator.updateAccount(),
  validateHandler,
  verifyPassword
]

// ----------- GET ROUTES -----------
router.get(ROUTES.USER.GET_USER, getUser)
router.get(ROUTES.USER.PROFILE, isAuth, getUserProfile)
router.get(ROUTES.USER.LIST_USERS, ...adminAuth, listUser)
router.get(ROUTES.USER.LIST_USERS_ADMIN, ...adminAuth, listUserForAdmin)

// ----------- PUT ROUTES -----------
router.put(
  ROUTES.USER.PROFILE_UPDATE,
  isAuth,
  ...profileValidator,
  updateProfile
)
router.put(
  ROUTES.USER.PASSWORD_UPDATE,
  isAuth,
  ...passwordValidator,
  updatePassword
)

// ----------- ADDRESS ROUTES -----------
router.post(ROUTES.USER.ADDRESS_ADD, isAuth, ...addressValidator, addAddress)
router.put(
  ROUTES.USER.ADDRESS_UPDATE,
  isAuth,
  ...addressValidator,
  updateAddress
)
router.delete(ROUTES.USER.ADDRESS_DELETE, isAuth, removeAddress)

// ----------- AVATAR & COVER ROUTES -----------
router.put(ROUTES.USER.AVATAR_UPDATE, isAuth, uploadAvatarSingle, updateAvatar)
router.put(ROUTES.USER.COVER_UPDATE, isAuth, uploadCoverSingle, updateCover)

// ----------- PARAMS -----------
router.param('userId', getUserById)

export default router
