import { Request } from 'express'

export interface UploadRequest extends Omit<Request, 'files'> {
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
