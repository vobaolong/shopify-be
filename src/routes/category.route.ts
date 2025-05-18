import express from 'express'
const router = express.Router()
// Import route constants
import { ROUTES } from '../constants/route.constant'
// Middlewares
import { isAuth, isAdmin } from '../controllers/auth.controller'
import { getStoreById } from '../controllers/store.controller'
import { uploadSingleImage } from '../controllers/upload.controller'
import {
	getCategoryById,
	getCategory,
	checkCategory,
	createCategory,
	updateCategory,
	removeCategory,
	restoreCategory,
	getActiveCategories,
	getCategories,
	getCategoriesByStore
} from '../controllers/category.controller'
import { getProductCategoriesByStore } from '../controllers/product.controller'
import { uploadCategorySingle } from '../middlewares/uploadCloudinary'

// Middleware groups
const adminAuth = [isAuth, isAdmin]
const categoryValidator = [uploadCategorySingle, checkCategory]
/**
 * @swagger
 * tags:
 *   - name: Category
 *     description: Quản lý danh mục sản phẩm
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *         image:
 *           type: string
 *         isActive:
 *           type: boolean
 */
// ----------- GET ROUTES -----------
/**
 * @swagger
 * /category/{categoryId}:
 *   get:
 *     summary: Lấy thông tin danh mục theo ID
 *     tags:
 *       - Category
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID danh mục
 *     responses:
 *       200:
 *         description: Lấy category thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                 category:
 *                   $ref: '#/components/schemas/Category'
 *       404:
 *         description: Không tìm thấy category
 */
router.get(ROUTES.CATEGORY.GET_BY_ID, getCategory)
/**
 * @swagger
 * /category/active:
 *   get:
 *     summary: Lấy danh sách danh mục đang hoạt động
 *     tags:
 *       - Category
 *     responses:
 *       200:
 *         description: Danh sách category active
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 */
router.get(ROUTES.CATEGORY.ACTIVE, getActiveCategories)
/**
 * @swagger
 * /category/by-store/{storeId}:
 *   get:
 *     summary: Lấy danh sách danh mục theo cửa hàng
 *     tags:
 *       - Category
 *     parameters:
 *       - in: path
 *         name: storeId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID cửa hàng
 *     responses:
 *       200:
 *         description: Danh sách category theo store
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 */
router.get(ROUTES.CATEGORY.LIST_BY_STORE, getProductCategoriesByStore, getCategoriesByStore)
/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get list of categories for admin
 *     tags:
 *       - Category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by category name
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort field (default _id)
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (default asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Number of items per page (default 6)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number (default 1)
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by parent category ID
 *     responses:
 *       200:
 *         description: List of categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                   example: Load list categories successfully
 *                 filter:
 *                   type: object
 *                   properties:
 *                     search:
 *                       type: string
 *                     sortBy:
 *                       type: string
 *                     order:
 *                       type: string
 *                     limit:
 *                       type: integer
 *                     pageCurrent:
 *                       type: integer
 *                     pageCount:
 *                       type: integer
 *                     categoryId:
 *                       type: string
 *                 size:
 *                   type: integer
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *       500:
 *         description: Failed to load categories
 */
router.get(ROUTES.CATEGORY.LIST_BY_ADMIN, ...adminAuth, getCategories)

// ----------- POST ROUTES -----------
/**
 * @swagger
 * /category/create:
 *   post:
 *     summary: Tạo danh mục mới
 *     tags:
 *       - Category
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Tạo category thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                 category:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Lỗi dữ liệu
 */
router.post(ROUTES.CATEGORY.CREATE, ...adminAuth, ...categoryValidator, createCategory)

// ----------- PUT ROUTES -----------
/**
 * @swagger
 * /category/update:
 *   put:
 *     summary: Cập nhật danh mục
 *     tags:
 *       - Category
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId:
 *                 type: string
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Cập nhật category thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                 category:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Lỗi dữ liệu
 */
router.put(ROUTES.CATEGORY.UPDATE, ...adminAuth, ...categoryValidator, updateCategory)

// ----------- DELETE ROUTES -----------
/**
 * @swagger
 * /category/delete:
 *   delete:
 *     summary: Xóa danh mục
 *     tags:
 *       - Category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID danh mục
 *     responses:
 *       200:
 *         description: Xóa category thành công
 *       404:
 *         description: Không tìm thấy category
 */
router.delete(ROUTES.CATEGORY.DELETE, ...adminAuth, removeCategory)

// ----------- RESTORE ROUTES -----------
/**
 * @swagger
 * /category/restore:
 *   get:
 *     summary: Khôi phục danh mục đã xóa
 *     tags:
 *       - Category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID danh mục
 *     responses:
 *       200:
 *         description: Khôi phục category thành công
 *       404:
 *         description: Không tìm thấy category
 */
router.get(ROUTES.CATEGORY.RESTORE, ...adminAuth, restoreCategory)

// ----------- PARAMS -----------
router.param('categoryId', getCategoryById)
router.param('storeId', getStoreById)

export default router
