import multer from 'multer'
import cloudinary from '../config/cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import slugify from 'slugify'

const MAX_FILE_SIZE = 10 * 1024 * 1024

const createFilename = (nameOrPrefix: string, timestamp = Date.now()) => {
  const slug = slugify(nameOrPrefix, { lower: true, strict: true })
  return `${slug}_${timestamp}`
}

const baseStorage = new CloudinaryStorage({
  cloudinary,
  params: () => ({
    folder: 'shopify',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  })
})

const categoryStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const name = req.body?.name || req.fields?.name || 'category'
    const filename = createFilename(name)

    return {
      folder: 'shopify/categories',
      public_id: filename,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 800, height: 800, crop: 'limit' }]
    }
  }
})

const productStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const name = req.body?.name || req.fields?.name || 'product'
    const filename = createFilename(name)

    return {
      folder: 'shopify/products',
      public_id: filename,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 800, height: 800, crop: 'limit' }]
    }
  }
})

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const id = req.params?.userId || req.params?.storeId || 'user'
    const filename = createFilename(`avatar_${id}`)

    return {
      folder: 'shopify/avatars',
      public_id: filename,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' }
      ]
    }
  }
})

const coverStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const id = req.params?.userId || req.params?.storeId || 'user'
    const filename = createFilename(`cover_${id}`)
    return {
      folder: 'shopify/covers',
      public_id: filename,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, height: 400, crop: 'fill' }]
    }
  }
})

const uploadCloudinarySingle = multer({
  storage: baseStorage,
  limits: { fileSize: MAX_FILE_SIZE }
}).single('image')

const uploadCloudinaryMultiple = multer({
  storage: baseStorage,
  limits: { fileSize: MAX_FILE_SIZE }
}).array('images', 7)

const uploadCategorySingle = multer({
  storage: categoryStorage,
  limits: { fileSize: MAX_FILE_SIZE }
}).single('image')

const uploadProductSingle = multer({
  storage: productStorage,
  limits: { fileSize: MAX_FILE_SIZE }
}).single('image')

const uploadProductMultiple = multer({
  storage: productStorage,
  limits: { fileSize: MAX_FILE_SIZE }
}).array('images', 7)

const uploadAvatarSingle = multer({
  storage: avatarStorage,
  limits: { fileSize: MAX_FILE_SIZE }
}).single('image')

const uploadCoverSingle = multer({
  storage: coverStorage,
  limits: { fileSize: MAX_FILE_SIZE }
}).single('image')

const uploadStoreCreateFiles = multer({
  storage: baseStorage,
  limits: { fileSize: MAX_FILE_SIZE }
}).fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
])

export {
  uploadCloudinarySingle,
  uploadCloudinaryMultiple,
  uploadCategorySingle,
  uploadProductSingle,
  uploadProductMultiple,
  uploadAvatarSingle,
  uploadCoverSingle,
  uploadStoreCreateFiles
}
