import { RequestHandler } from 'express'
import { uploadImage } from '../../helpers/cloudinary'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { UploadRequest } from './upload.types'

export const uploadSingleImage: RequestHandler = async (
  req: UploadRequest,
  res
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
      message: errorHandler(error as MongoError)
    })
    return
  }
}
