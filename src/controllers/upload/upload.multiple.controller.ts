import { RequestHandler } from 'express'
import { uploadMultipleImages } from '../../helpers/cloudinary'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { UploadRequest } from './upload.types'

export const uploadMultipleImagesController: RequestHandler = async (
  req: UploadRequest,
  res
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
      message: errorHandler(error as MongoError)
    })
    return
  }
}
