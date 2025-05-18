import express from 'express'
const router = express.Router()
// Import route constants
import { ROUTES } from '../constants/route.constant'
// Middlewares
import { isAuth, isAdmin } from '../controllers/auth.controller'
import { userById } from '../controllers/user.controller'
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


/**
 * @swagger
 * tags:
 *   - name: Brand
 *     description: Quản lý thương hiệu
 * components:
 *   schemas:
 *     Brand:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *         categories:
 *           type: array
 *           items:
 *             type: string
 *         isActive:
 *           type: boolean
 *         # Thêm các trường khác nếu có
 */
// ----------- GET ROUTES -----------
/**
 * @swagger
 * /brand/{brandId}:
 *   get:
 *     summary: Lấy thông tin thương hiệu theo ID
 *     tags:
 *       - Brand
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: brandId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID thương hiệu
 *     responses:
 *       200:
 *         description: Lấy brand thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                 brand:
 *                   $ref: '#/components/schemas/Brand'
 *       404:
 *         description: Không tìm thấy brand
 */
router.get(ROUTES.BRAND.GET_BY_ID, ...adminAuth, getBrand)
/**
 * @swagger
 * /brand/active:
 *   get:
 *     summary: Lấy danh sách thương hiệu đang hoạt động
 *     tags:
 *       - Brand
 *     responses:
 *       200:
 *         description: Danh sách brand active
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                 brands:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Brand'
 */
router.get(ROUTES.BRAND.ACTIVE, getBrandCategories, listBrands)
/**
 * @swagger
 * /brands:
 *   get:
 *     summary: Lấy danh sách tất cả thương hiệu
 *     tags:
 *       - Brand
 *     responses:
 *       200:
 *         description: Danh sách brand
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                 brands:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Brand'
 */
router.get(ROUTES.BRAND.LIST, listBrands)
/**
 * @swagger
 * /brands-for-admin:
 *   get:
 *     summary: Lấy danh sách thương hiệu cho admin
 *     tags:
 *       - Brand
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách brand cho admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                 brands:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Brand'
 */
router.get(ROUTES.BRAND.LIST_FOR_ADMIN, ...adminAuth, listBrands)
/**
 * @swagger
 * /brand/create:
 *   post:
 *     summary: Tạo thương hiệu mới
 *     tags:
 *       - Brand
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Tạo brand thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                 brand:
 *                   $ref: '#/components/schemas/Brand'
 *       400:
 *         description: Lỗi dữ liệu
 */
router.post(ROUTES.BRAND.CREATE, ...adminAuth, ...brandValidator, createBrand)
/**
 * @swagger
 * /brand/update:
 *   put:
 *     summary: Cập nhật thương hiệu
 *     tags:
 *       - Brand
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               brandId:
 *                 type: string
 *               name:
 *                 type: string
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Cập nhật brand thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                 brand:
 *                   $ref: '#/components/schemas/Brand'
 *       400:
 *         description: Lỗi dữ liệu
 */
router.put(ROUTES.BRAND.UPDATE, ...adminAuth, ...brandValidator, updateBrand)
/**
 * @swagger
 * /brand/delete:
 *   delete:
 *     summary: Xóa thương hiệu
 *     tags:
 *       - Brand
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: brandId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID thương hiệu
 *     responses:
 *       200:
 *         description: Xóa brand thành công
 *       404:
 *         description: Không tìm thấy brand
 */
router.delete(ROUTES.BRAND.DELETE, ...adminAuth, removeBrand)
/**
 * @swagger
 * /brand/restore:
 *   get:
 *     summary: Khôi phục thương hiệu đã xóa
 *     tags:
 *       - Brand
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: brandId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID thương hiệu
 *     responses:
 *       200:
 *         description: Khôi phục brand thành công
 *       404:
 *         description: Không tìm thấy brand
 */
router.get(ROUTES.BRAND.RESTORE, ...adminAuth, restoreBrand)

// ----------- PARAMS -----------
router.param('brandId', getBrandById)
router.param('userId', userById)

export default router
