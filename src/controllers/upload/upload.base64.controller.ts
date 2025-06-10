import { RequestHandler } from 'express'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { promises as fs } from 'fs'
import { createTempDirectory, uploadImage } from '../../helpers/cloudinary'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { UploadRequest } from './upload.types'

export const uploadBase64Image: RequestHandler = async (
  req: UploadRequest,
  res
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
      message: errorHandler(error as MongoError)
    })
    return
  }
}
