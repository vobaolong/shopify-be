"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTempDirectory = exports.getResizedImageUrl = exports.deleteMultipleImages = exports.deleteImage = exports.uploadMultipleImages = exports.uploadImage = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
// Sử dụng __dirname trong môi trường Node.js
const __dirname = process.cwd();
/**
 * Upload ảnh lên Cloudinary và trả về thông tin
 * @param filePath - Đường dẫn đến file local
 * @param folder - Thư mục lưu trữ trên Cloudinary
 * @returns Kết quả upload
 */
const uploadImage = async (filePath, folder = 'shopify') => {
    try {
        const result = await cloudinary_1.default.uploader.upload(filePath, {
            folder: folder,
            resource_type: 'auto',
            use_filename: true,
            unique_filename: true
        });
        // Xóa file tạm sau khi upload
        if (filePath.startsWith(path_1.default.join(__dirname, 'src/temp'))) {
            await fs_1.promises.unlink(filePath);
        }
        return {
            public_id: result.public_id,
            url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            resource_type: result.resource_type
        };
    }
    catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error(`Upload to Cloudinary failed: ${error.message}`);
    }
};
exports.uploadImage = uploadImage;
/**
 * Upload nhiều ảnh lên Cloudinary
 * @param filePaths - Mảng đường dẫn file
 * @param folder - Thư mục lưu trữ
 * @returns Kết quả upload
 */
const uploadMultipleImages = async (filePaths, folder = 'shopify') => {
    try {
        const uploadPromises = filePaths.map((filePath) => (0, exports.uploadImage)(filePath, folder));
        return await Promise.all(uploadPromises);
    }
    catch (error) {
        console.error('Multiple uploads error:', error);
        throw new Error(`Multiple uploads failed: ${error.message}`);
    }
};
exports.uploadMultipleImages = uploadMultipleImages;
/**
 * Xóa ảnh trên Cloudinary theo public_id
 * @param publicId - ID công khai của ảnh
 * @returns Kết quả xóa
 */
const deleteImage = async (publicId) => {
    try {
        return await cloudinary_1.default.uploader.destroy(publicId);
    }
    catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error(`Failed to delete image: ${error.message}`);
    }
};
exports.deleteImage = deleteImage;
/**
 * Xóa nhiều ảnh trên Cloudinary
 * @param publicIds - Mảng các public_id
 * @returns Kết quả xóa
 */
const deleteMultipleImages = async (publicIds) => {
    try {
        return await cloudinary_1.default.api.delete_resources(publicIds);
    }
    catch (error) {
        console.error('Multiple deletion error:', error);
        throw new Error(`Failed to delete multiple images: ${error.message}`);
    }
};
exports.deleteMultipleImages = deleteMultipleImages;
/**
 * Lấy URL ảnh có resize theo kích thước mong muốn
 * @param publicId - ID công khai của ảnh
 * @param width - Chiều rộng mong muốn
 * @param height - Chiều cao mong muốn
 * @param crop - Phương thức crop (fill, scale, fit...)
 * @returns URL của ảnh đã được transform
 */
const getResizedImageUrl = (publicId, width, height, crop = 'fill') => {
    return cloudinary_1.default.url(publicId, {
        width,
        height,
        crop,
        quality: 'auto',
        fetch_format: 'auto'
    });
};
exports.getResizedImageUrl = getResizedImageUrl;
/**
 * Tạo thư mục tạm để lưu ảnh trước khi upload
 * @returns Đường dẫn đến thư mục tạm
 */
const createTempDirectory = async () => {
    const tempDir = path_1.default.join(__dirname, 'src/temp');
    try {
        await fs_1.promises.mkdir(tempDir, { recursive: true });
        return tempDir;
    }
    catch (error) {
        console.error('Error creating temp directory:', error);
        throw new Error(`Failed to create temp directory: ${error.message}`);
    }
};
exports.createTempDirectory = createTempDirectory;
