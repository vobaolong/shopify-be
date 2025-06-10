import { RequestHandler } from 'express'
import { deleteImage, deleteMultipleImages } from '../../helpers/cloudinary'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { UploadRequest } from './upload.types'

export const deleteImageController: RequestHandler = async (
  req: UploadRequest,
  res
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
      message: errorHandler(error as MongoError)
    })
    return
  }
}

export const deleteMultipleImagesController: RequestHandler = async (
  req: UploadRequest,
  res
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
      message: errorHandler(error as MongoError)
    })
    return
  }
}
