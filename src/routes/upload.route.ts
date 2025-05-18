import express from 'express'
import {
  uploadSingleImage,
  uploadMultipleImagesController,
  uploadBase64Image,
  deleteImageController,
  deleteMultipleImagesController
} from '../controllers/upload.controller'
import {
  uploadSingle,
  uploadMultiple,
  handleMulterError
} from '../middlewares/uploadMiddleware'
import { isAdmin, isAuth } from '../controllers/auth.controller'

// Import route constants
import { ROUTES } from '../constants/route.constant'

const router = express.Router()

// Route upload một ảnh
router.post(
  ROUTES.UPLOAD.IMAGE,
  isAuth,
  uploadSingle,
  handleMulterError,
  uploadSingleImage
)

// Route upload nhiều ảnh
router.post(
  ROUTES.UPLOAD.MULTIPLE,
  isAuth,
  uploadMultiple,
  handleMulterError,
  uploadMultipleImagesController
)

// Route upload ảnh dạng base64
router.post(ROUTES.UPLOAD.BASE64, isAuth, uploadBase64Image)

// Route xóa ảnh (cần quyền admin hoặc người dùng đã xác thực)
router.delete(ROUTES.UPLOAD.DELETE, isAuth, deleteImageController)

// Route xóa nhiều ảnh (chỉ admin)
router.delete(
  ROUTES.UPLOAD.DELETE_MULTIPLE,
  isAuth,
  isAdmin,
  deleteMultipleImagesController
)

export default router
