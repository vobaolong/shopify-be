import express from 'express'
const router = express.Router()

// Import route constants
import { ROUTES } from '../constants/route.constant'

// Middlewares
import * as userValidator from '../validators/user.validator'
import { validateHandler } from '../helpers/validateHandler'
import { isAuth, isAdmin, verifyPassword } from '../controllers/auth.controller'
import { uploadAvatarSingle, uploadCoverSingle } from '../middlewares/uploadCloudinary'
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

// Middleware groups
const adminAuth = [isAuth, isAdmin]
const auth = [isAuth]
const profileValidator = [userValidator.updateProfile(), validateHandler]
const addressValidator = [userValidator.userAddress(), validateHandler]
const passwordValidator = [userValidator.updateAccount(), validateHandler, verifyPassword]
const avatarUploadGroup = [uploadAvatarSingle]
const coverUploadGroup = [uploadCoverSingle]

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// ----------- GET ROUTES -----------
/**
 * @swagger
 * /user/{userId}:
 *   get:
 *     summary: Lấy thông tin user theo ID
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID user
 *     responses:
 *       200:
 *         description: Lấy user thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
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
 */
router.get(ROUTES.USER.GET_USER, getUser)
/**
 * @swagger
 * /user/profile/{userId}:
 *   get:
 *     summary: Lấy profile user
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID user
 *     responses:
 *       200:
 *         description: Lấy profile thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
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
 */
router.get(ROUTES.USER.PROFILE, ...auth, getUserProfile)
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lấy danh sách user (user thường)
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Trường sắp xếp
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Thứ tự sắp xếp
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng mỗi trang
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Trang
 *     responses:
 *       200:
 *         description: Lấy danh sách user thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                 filter:
 *                   type: object
 *                 size:
 *                   type: integer
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         description: Lỗi hệ thống
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get(ROUTES.USER.LIST_USERS, ...adminAuth, listUser)
/**
 * @swagger
 * /users-for-admin/{userId}:
 *   get:
 *     summary: Lấy danh sách user cho admin
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID admin
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Trường sắp xếp
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Thứ tự sắp xếp
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng mỗi trang
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Trang
 *     responses:
 *       200:
 *         description: Lấy danh sách user thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                 filter:
 *                   type: object
 *                 size:
 *                   type: integer
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         description: Lỗi hệ thống
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get(ROUTES.USER.LIST_USERS_ADMIN, ...adminAuth, listUserForAdmin)
// ----------- PUT ROUTES -----------
/**
 * @swagger
 * /user/profile-update/{userId}:
 *   put:
 *     summary: Cập nhật profile user
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID user
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
 *               id_card:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật profile thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Lỗi dữ liệu hoặc không thể cập nhật email Google
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Không tìm thấy user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.put(ROUTES.USER.PROFILE_UPDATE, ...auth, ...profileValidator, updateProfile)
/**
 * @swagger
 * /user/password-update/{userId}:
 *   put:
 *     summary: Đổi mật khẩu user
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
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
 *       400:
 *         description: Lỗi dữ liệu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Không tìm thấy user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.put(ROUTES.USER.PASSWORD_UPDATE, ...auth, ...passwordValidator, updatePassword)
/**
 * @swagger
 * /user/address-add/{userId}:
 *   post:
 *     summary: Thêm địa chỉ cho user
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *               addressDetail:
 *                 type: object
 *                 properties:
 *                   province:
 *                     type: string
 *                   provinceName:
 *                     type: string
 *                   district:
 *                     type: string
 *                   districtName:
 *                     type: string
 *                   ward:
 *                     type: string
 *                   wardName:
 *                     type: string
 *                   street:
 *                     type: string
 *     responses:
 *       200:
 *         description: Thêm địa chỉ thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Lỗi dữ liệu hoặc vượt quá 10 địa chỉ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Không tìm thấy user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post(ROUTES.USER.ADDRESS_ADD, ...auth, ...addressValidator, addAddress)
/**
 * @swagger
 * /user/address-update/{userId}:
 *   put:
 *     summary: Cập nhật địa chỉ user
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID user
 *       - in: query
 *         name: index
 *         schema:
 *           type: integer
 *         required: true
 *         description: Vị trí địa chỉ trong mảng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *               addressDetail:
 *                 type: object
 *                 properties:
 *                   province:
 *                     type: string
 *                   provinceName:
 *                     type: string
 *                   district:
 *                     type: string
 *                   districtName:
 *                     type: string
 *                   ward:
 *                     type: string
 *                   wardName:
 *                     type: string
 *                   street:
 *                     type: string
 *     responses:
 *       200:
 *         description: Cập nhật địa chỉ thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Lỗi dữ liệu hoặc địa chỉ đã tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Không tìm thấy user hoặc địa chỉ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.put(ROUTES.USER.ADDRESS_UPDATE, ...auth, ...addressValidator, updateAddress)
/**
 * @swagger
 * /user/address-delete/{userId}:
 *   delete:
 *     summary: Xóa địa chỉ user
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID user
 *       - in: query
 *         name: index
 *         schema:
 *           type: integer
 *         required: true
 *         description: Vị trí địa chỉ trong mảng
 *     responses:
 *       200:
 *         description: Xóa địa chỉ thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Lỗi dữ liệu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Không tìm thấy user hoặc địa chỉ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.delete(ROUTES.USER.ADDRESS_DELETE, ...auth, removeAddress)
/**
 * @swagger
 * /user/avatar-update/{userId}:
 *   put:
 *     summary: Cập nhật avatar user
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID user
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Cập nhật avatar thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Không có file upload hoặc lỗi dữ liệu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Không tìm thấy user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.put(ROUTES.USER.AVATAR_UPDATE, ...auth, ...avatarUploadGroup, updateAvatar)
/**
 * @swagger
 * /user/cover-update/{userId}:
 *   put:
 *     summary: Cập nhật cover user
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID user
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               cover:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Cập nhật cover thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Không có file upload hoặc lỗi dữ liệu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Không tìm thấy user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.put(ROUTES.USER.COVER_UPDATE, ...auth, ...coverUploadGroup, updateCover)

// ----------- PARAMS -----------
router.param('userId', userById)

export default router
