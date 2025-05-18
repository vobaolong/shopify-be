import cloudinary from '../config/cloudinary'
import { promises as fs } from 'fs'
import path from 'path'

// Define TypeScript interfaces for return types
interface CloudinaryUploadResult {
	public_id: string
	url: string
	width: number
	height: number
	format: string
	resource_type: string
}

interface CloudinaryError extends Error {
	message: string
}

// Sử dụng __dirname trong môi trường Node.js
const __dirname = process.cwd()

/**
 * Upload ảnh lên Cloudinary và trả về thông tin
 * @param filePath - Đường dẫn đến file local
 * @param folder - Thư mục lưu trữ trên Cloudinary
 * @returns Kết quả upload
 */
export const uploadImage = async (
	filePath: string,
	folder: string = 'shopify'
): Promise<CloudinaryUploadResult> => {
	try {
		const result = await cloudinary.uploader.upload(filePath, {
			folder: folder,
			resource_type: 'auto',
			use_filename: true,
			unique_filename: true
		})

		// Xóa file tạm sau khi upload
		if (filePath.startsWith(path.join(__dirname, 'src/temp'))) {
			await fs.unlink(filePath)
		}

		return {
			public_id: result.public_id,
			url: result.secure_url,
			width: result.width,
			height: result.height,
			format: result.format,
			resource_type: result.resource_type
		}
	} catch (error: any) {
		console.error('Cloudinary upload error:', error)
		throw new Error(`Upload to Cloudinary failed: ${error.message}`)
	}
}

/**
 * Upload nhiều ảnh lên Cloudinary
 * @param filePaths - Mảng đường dẫn file
 * @param folder - Thư mục lưu trữ
 * @returns Kết quả upload
 */
export const uploadMultipleImages = async (
	filePaths: string[],
	folder: string = 'shopify'
): Promise<CloudinaryUploadResult[]> => {
	try {
		const uploadPromises = filePaths.map((filePath) =>
			uploadImage(filePath, folder)
		)
		return await Promise.all(uploadPromises)
	} catch (error: any) {
		console.error('Multiple uploads error:', error)
		throw new Error(`Multiple uploads failed: ${error.message}`)
	}
}

/**
 * Xóa ảnh trên Cloudinary theo public_id
 * @param publicId - ID công khai của ảnh
 * @returns Kết quả xóa
 */
export const deleteImage = async (publicId: string): Promise<any> => {
	try {
		return await cloudinary.uploader.destroy(publicId)
	} catch (error: any) {
		console.error('Cloudinary delete error:', error)
		throw new Error(`Failed to delete image: ${error.message}`)
	}
}

/**
 * Xóa nhiều ảnh trên Cloudinary
 * @param publicIds - Mảng các public_id
 * @returns Kết quả xóa
 */
export const deleteMultipleImages = async (
	publicIds: string[]
): Promise<any> => {
	try {
		return await cloudinary.api.delete_resources(publicIds)
	} catch (error: any) {
		console.error('Multiple deletion error:', error)
		throw new Error(`Failed to delete multiple images: ${error.message}`)
	}
}

/**
 * Lấy URL ảnh có resize theo kích thước mong muốn
 * @param publicId - ID công khai của ảnh
 * @param width - Chiều rộng mong muốn
 * @param height - Chiều cao mong muốn
 * @param crop - Phương thức crop (fill, scale, fit...)
 * @returns URL của ảnh đã được transform
 */
export const getResizedImageUrl = (
	publicId: string,
	width: number,
	height: number,
	crop: string = 'fill'
): string => {
	return cloudinary.url(publicId, {
		width,
		height,
		crop,
		quality: 'auto',
		fetch_format: 'auto'
	})
}

/**
 * Tạo thư mục tạm để lưu ảnh trước khi upload
 * @returns Đường dẫn đến thư mục tạm
 */
export const createTempDirectory = async (): Promise<string> => {
	const tempDir = path.join(__dirname, 'src/temp')
	try {
		await fs.mkdir(tempDir, { recursive: true })
		return tempDir
	} catch (error: any) {
		console.error('Error creating temp directory:', error)
		throw new Error(`Failed to create temp directory: ${error.message}`)
	}
}
