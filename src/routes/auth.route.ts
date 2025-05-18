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
	isAuth,
	refreshToken,
	signout,
	authSocial,
	createToken,
	authUpdate
} from '../controllers/auth.controller'
import { userById } from '../controllers/user.controller'
import {
	sendChangePasswordEmail,
	sendConfirmationEmail,
	verifyEmail
} from '../controllers/email.controller'

// Middleware groups
const signupValidator = [authValidator.signup(), validateHandler]
const signinValidator = [authValidator.signin(), validateHandler]
const socialValidator = [authValidator.authSocial(), validateHandler]
const forgotPasswordValidator = [authValidator.forgotPassword(), validateHandler]
const changePasswordValidator = [authValidator.changePassword(), validateHandler]

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Các API xác thực và quản lý tài khoản người dùng
 */
// ----------- AUTH ROUTES -----------
/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 */
router.post(ROUTES.AUTH.SIGNUP, ...signupValidator, signup as unknown as RequestHandler)
/**
 * @swagger
 * /auth/signin:
 *   post:
 *     summary: Đăng nhập
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 */
router.post(ROUTES.AUTH.SIGNIN, ...signinValidator, signin, createToken)
/**
 * @swagger
 * /auth/social:
 *   post:
 *     summary: Đăng nhập mạng xã hội (Google)
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               googleId:
 *                 type: string
 *                 description: Google ID
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng nhập mạng xã hội thành công
 *       400:
 *         description: Thiếu googleId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: googleId is required
 *       500:
 *         description: Lỗi hệ thống khi đăng nhập mạng xã hội
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Signing in with Google failed
 */
router.post(ROUTES.AUTH.SOCIAL, ...socialValidator, authSocial, authUpdate, createToken)
/**
 * @swagger
 * /auth/signout:
 *   post:
 *     summary: Đăng xuất
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token cần xóa khi đăng xuất
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                   example: Sign out successfully
 *       401:
 *         description: Thiếu refreshToken
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: refreshToken is required
 *       500:
 *         description: Lỗi hệ thống khi xóa refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Sign out and remove refresh token failed
 */
router.post(ROUTES.AUTH.SIGNOUT, signout)
/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Làm mới token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token hiện tại
 *     responses:
 *       200:
 *         description: Làm mới token thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                   example: Refresh token successfully
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Thiếu refreshToken hoặc refreshToken không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: refreshToken is required
 *       404:
 *         description: refreshToken không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: refreshToken is invalid
 *       500:
 *         description: Lỗi hệ thống khi tạo JWT mới
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Create JWT failed, try again later
 */
router.post(ROUTES.AUTH.REFRESH_TOKEN, refreshToken)
/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Quên mật khẩu
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Gửi yêu cầu thành công, vui lòng kiểm tra email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                   example: Request successfully, please wait for email
 *       404:
 *         description: Không tìm thấy user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Lỗi hệ thống
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found
 */
router.post(ROUTES.AUTH.FORGOT_PASSWORD, ...forgotPasswordValidator, forgotPassword, sendChangePasswordEmail)
/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     summary: Đổi mật khẩu
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: path
 *         name: forgotPasswordCode
 *         schema:
 *           type: string
 *         required: true
 *         description: Mã xác thực đổi mật khẩu (lấy từ email)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                   example: Update password successfully
 *       404:
 *         description: Không tìm thấy user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Lỗi hệ thống khi đổi mật khẩu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Update password failed, please request to send email again
 */
router.put(ROUTES.AUTH.CHANGE_PASSWORD, ...changePasswordValidator, changePassword)
/**
 * @swagger
 * /auth/confirm-email:
 *   get:
 *     summary: Gửi email xác nhận
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Gửi email xác nhận thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                   example: Send email successfully
 *       400:
 *         description: Không có email hoặc email đã xác thực
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No email provided
 *       500:
 *         description: Lỗi hệ thống hoặc không tìm thấy user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found
 */
router.get(ROUTES.AUTH.CONFIRM_EMAIL, isAuth, sendConfirmationEmail)
/**
 * @swagger
 * /auth/verify-email:
 *   get:
 *     summary: Xác thực email
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: path
 *         name: emailCode
 *         schema:
 *           type: string
 *         required: true
 *         description: Mã xác thực email (lấy từ email)
 *     responses:
 *       200:
 *         description: Xác thực email thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                   example: Confirm email successfully
 *       500:
 *         description: Lỗi hệ thống hoặc không tìm thấy user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found
 */
router.get(ROUTES.AUTH.VERIFY_EMAIL, verifyEmail)

// ----------- PARAMS -----------
router.param('userId', userById)

export default router
