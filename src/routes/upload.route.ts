import express from 'express'
const router = express.Router()

import {
  uploadSingleImage,
  uploadMultipleImagesController,
  uploadBase64Image,
  deleteImageController,
  deleteMultipleImagesController
} from '../controllers/upload.controller'
import { isAdmin, isAuth } from '../middlewares/auth.middleware'
import {
  uploadCloudinarySingle,
  uploadCloudinaryMultiple
} from '../middlewares/uploadCloudinary'
import { ROUTES } from '../constants/route.constant'

// Route upload một ảnh
router.post(
  ROUTES.UPLOAD.IMAGE,
  isAuth,
  uploadCloudinarySingle,
  uploadSingleImage
)

// Route upload nhiều ảnh
router.post(
  ROUTES.UPLOAD.MULTIPLE,
  isAuth,
  uploadCloudinaryMultiple,
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
