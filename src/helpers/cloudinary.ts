import cloudinary from '../config/cloudinary'
import { promises as fs } from 'fs'
import path from 'path'

interface CloudinaryUploadResult {
	public_id: string
	url: string
	width: number
	height: number
	format: string
	resource_type: string
}

const __dirname = process.cwd()

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

export const deleteImage = async (publicId: string): Promise<any> => {
	try {
		return await cloudinary.uploader.destroy(publicId)
	} catch (error: any) {
		console.error('Cloudinary delete error:', error)
		throw new Error(`Failed to delete image: ${error.message}`)
	}
}

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
