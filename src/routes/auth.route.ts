import express, { RequestHandler } from 'express'
const router = express.Router()

// Import route constants
import { ROUTES } from '../constants/route.constant'
// Middlewares
import authValidator from '../validators/auth.validator'
import { validateHandler } from '../helpers/validateHandler'
// Import controllers
import {
  signup,
  signin,
  forgotPassword,
  changePassword,
  refreshToken,
  signout,
  authSocial,
  createToken,
  authUpdate,
  sendOTPEmail,
  verifyOTP,
  checkEmailExists
} from '../controllers/auth.controller'
import { isAuth } from '../middlewares/auth.middleware'
import { getUserById } from '../controllers/user.controller'
import { sendChangePasswordEmail } from '../controllers/email.controller'
import { User } from '../models/index.model'

// Middleware groups
const signupValidator = [authValidator.signup(), validateHandler]
const signinValidator = [authValidator.signin(), validateHandler]
const socialValidator = [authValidator.authSocial(), validateHandler]
const forgotPasswordValidator = [
  authValidator.forgotPassword(),
  validateHandler
]
const changePasswordValidator = [
  authValidator.changePassword(),
  validateHandler
]

// ----------- POST ROUTES -----------
router.post(
  ROUTES.AUTH.SIGNUP,
  ...signupValidator,
  signup as unknown as RequestHandler
)
router.post(ROUTES.AUTH.SIGNIN, ...signinValidator, signin, createToken)
router.post(
  ROUTES.AUTH.SOCIAL,
  ...socialValidator,
  authSocial,
  authUpdate,
  createToken
)
router.post(ROUTES.AUTH.SIGNOUT, signout)
router.post(ROUTES.AUTH.REFRESH_TOKEN, refreshToken)
router.post(
  ROUTES.AUTH.FORGOT_PASSWORD,
  ...forgotPasswordValidator,
  forgotPassword,
  sendChangePasswordEmail
)
router.post(ROUTES.AUTH.SEND_OTP, sendOTPEmail)
router.post(ROUTES.AUTH.VERIFY_OTP, verifyOTP)
router.post(ROUTES.AUTH.CHECK_EMAIL, checkEmailExists)

// ----------- PUT ROUTES -----------
router.put(
  ROUTES.AUTH.CHANGE_PASSWORD,
  ...changePasswordValidator,
  changePassword
)

// ----------- PARAMS -----------
router.param('userId', getUserById)

export default router
