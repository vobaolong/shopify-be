"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const upload_controller_1 = require("../controllers/upload.controller");
const uploadMiddleware_1 = require("../middlewares/uploadMiddleware");
const auth_controller_1 = require("../controllers/auth.controller");
// Import route constants
const route_constant_1 = require("../constants/route.constant");
const router = express_1.default.Router();
// Route upload một ảnh
router.post(route_constant_1.ROUTES.UPLOAD.IMAGE, auth_controller_1.isAuth, uploadMiddleware_1.uploadSingle, uploadMiddleware_1.handleMulterError, upload_controller_1.uploadSingleImage);
// Route upload nhiều ảnh
router.post(route_constant_1.ROUTES.UPLOAD.MULTIPLE, auth_controller_1.isAuth, uploadMiddleware_1.uploadMultiple, uploadMiddleware_1.handleMulterError, upload_controller_1.uploadMultipleImagesController);
// Route upload ảnh dạng base64
router.post(route_constant_1.ROUTES.UPLOAD.BASE64, auth_controller_1.isAuth, upload_controller_1.uploadBase64Image);
// Route xóa ảnh (cần quyền admin hoặc người dùng đã xác thực)
router.delete(route_constant_1.ROUTES.UPLOAD.DELETE, auth_controller_1.isAuth, upload_controller_1.deleteImageController);
// Route xóa nhiều ảnh (chỉ admin)
router.delete(route_constant_1.ROUTES.UPLOAD.DELETE_MULTIPLE, auth_controller_1.isAuth, auth_controller_1.isAdmin, upload_controller_1.deleteMultipleImagesController);
exports.default = router;
