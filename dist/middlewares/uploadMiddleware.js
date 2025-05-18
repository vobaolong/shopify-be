"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMulterError = exports.uploadMultiple = exports.uploadSingle = void 0;
const multer_1 = __importStar(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Thiết lập cho __dirname trong Node.js với TypeScript
const __dirname = process.cwd();
// Tạo thư mục uploads nếu chưa tồn tại
const uploadDir = path_1.default.join(__dirname, 'src/uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Cấu hình storage cho multer
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Tạo tên file không trùng lặp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const extension = path_1.default.extname(file.originalname);
        cb(null, uniqueSuffix + extension);
    }
});
// Lọc file, chỉ cho phép upload ảnh
const fileFilter = (req, file, cb) => {
    // Kiểm tra mimetype của file có phải là ảnh không
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed!'));
    }
};
// Giới hạn kích thước file (5MB)
const limits = {
    fileSize: 5 * 1024 * 1024 // 5MB
};
// Middleware xử lý upload một ảnh
exports.uploadSingle = (0, multer_1.default)({
    storage,
    fileFilter,
    limits
}).single('image');
// Middleware xử lý upload nhiều ảnh (tối đa 5 ảnh)
exports.uploadMultiple = (0, multer_1.default)({
    storage,
    fileFilter,
    limits
}).array('images', 5);
// Middleware bắt lỗi từ multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer_1.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({
                error: 'File size exceeded. Maximum file size is 5MB.'
            });
            return;
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            res.status(400).json({
                error: 'Too many files. Maximum is 5 files at once.'
            });
            return;
        }
        res.status(400).json({
            error: `Upload error: ${err.message}`
        });
        return;
    }
    if (err) {
        res.status(400).json({
            error: err.message
        });
        return;
    }
    next();
};
exports.handleMulterError = handleMulterError;
