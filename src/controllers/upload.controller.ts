import { promises as fs } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { Request, Response, RequestHandler } from 'express'
import {
	uploadImage,
	uploadMultipleImages,
	deleteImage,
	deleteMultipleImages,
	createTempDirectory
} from '../helpers/cloudinary'

interface UploadRequest extends Omit<Request, 'files'> {
	file?: any
	files?: any
	body: {
		folder?: string
		image?: string
		publicIds?: string[]
	}
	params: {
		publicId?: string
	}
}

const __dirname = process.cwd()

export const uploadSingleImage: RequestHandler = async (
	req: UploadRequest,
	res: Response
) => {
	try {
		if (!req.file) {
			res.status(400).json({ error: 'No image file provided' })
			return
		}

		const { path: filePath } = req.file
		const folder = req.body.folder || 'shopify'

		const result = await uploadImage(filePath, folder)

		res.status(200).json({
			success: true,
			data: result
		})
		return
	} catch (error) {
		res.status(500).json({
			error: 'Error uploading image',
			message: (error as Error).message
		})
		return
	}
}

export const uploadMultipleImagesController: RequestHandler = async (
	req: UploadRequest,
	res: Response
) => {
	try {
		if (
			!req.files ||
			(Array.isArray(req.files) && req.files.length === 0) ||
			(!Array.isArray(req.files) && Object.keys(req.files).length === 0)
		) {
			res.status(400).json({ error: 'No image files provided' })
			return
		}

		let filePaths: string[] = []

		if (Array.isArray(req.files)) {
			filePaths = req.files.map((file) => file.path)
		} else {
			Object.keys(req.files).forEach((key) => {
				const fileArr = req.files[key]
				if (Array.isArray(fileArr)) {
					filePaths = [...filePaths, ...fileArr.map((file) => file.path)]
				}
			})
		}
		const folder = req.body.folder || 'shopify'
		const results = await uploadMultipleImages(filePaths, folder)
		res.status(200).json({
			success: true,
			data: results
		})
		return
	} catch (error) {
		res.status(500).json({
			error: 'Error uploading images',
			message: (error as Error).message
		})
		return
	}
}

export const uploadBase64Image: RequestHandler = async (
	req: UploadRequest,
	res: Response
) => {
	try {
		if (!req.body.image) {
			res.status(400).json({ error: 'No image data provided' })
			return
		}

		const base64String = req.body.image
		const folder = req.body.folder || 'shopify'
		const filename = `${uuidv4()}.png`

		const tempDir = await createTempDirectory()
		const filePath = path.join(tempDir, filename)

		const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '')
		const buffer = Buffer.from(base64Data, 'base64')

		await fs.writeFile(filePath, buffer)

		const result = await uploadImage(filePath, folder)

		res.status(200).json({
			success: true,
			data: result
		})
		return
	} catch (error) {
		res.status(500).json({
			error: 'Error uploading base64 image',
			message: (error as Error).message
		})
		return
	}
}

export const deleteImageController: RequestHandler = async (
	req: UploadRequest,
	res: Response
) => {
	try {
		const { publicId } = req.params

		if (!publicId) {
			res.status(400).json({ error: 'Public ID is required' })
			return
		}

		const result = await deleteImage(publicId)

		if (result.result === 'ok') {
			res.status(200).json({
				success: true,
				message: 'Image deleted successfully'
			})
			return
		} else {
			res.status(400).json({
				success: false,
				message: 'Failed to delete image',
				result
			})
			return
		}
	} catch (error) {
		res.status(500).json({
			error: 'Error deleting image',
			message: (error as Error).message
		})
		return
	}
}

export const deleteMultipleImagesController: RequestHandler = async (
	req: UploadRequest,
	res: Response
) => {
	try {
		const { publicIds } = req.body

		if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
			res.status(400).json({ error: 'Valid array of public IDs is required' })
			return
		}

		const result = await deleteMultipleImages(publicIds)

		res.status(200).json({
			success: true,
			message: 'Images deleted successfully',
			result
		})
		return
	} catch (error) {
		res.status(500).json({
			error: 'Error deleting images',
			message: (error as Error).message
		})
		return
	}
}
