import { Request, Response, NextFunction } from 'express'
import multer, { FileFilterCallback, MulterError } from 'multer'
import path from 'path'
import fs from 'fs'

// Thiết lập cho __dirname trong Node.js với TypeScript
const __dirname = process.cwd()

// Tạo thư mục uploads nếu chưa tồn tại
const uploadDir = path.join(__dirname, 'src/uploads')
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true })
}

// Định nghĩa kiểu cho các callback của multer
type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void

// Cấu hình storage cho multer
const storage = multer.diskStorage({
	destination: (
		req: Request,
		file: Express.Multer.File,
		cb: DestinationCallback
	): void => {
		cb(null, uploadDir)
	},
	filename: (
		req: Request,
		file: Express.Multer.File,
		cb: FileNameCallback
	): void => {
		// Tạo tên file không trùng lặp
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
		const extension = path.extname(file.originalname)
		cb(null, uniqueSuffix + extension)
	}
})

// Lọc file, chỉ cho phép upload ảnh
const fileFilter = (
	req: Request,
	file: Express.Multer.File,
	cb: FileFilterCallback
): void => {
	// Kiểm tra mimetype của file có phải là ảnh không
	if (file.mimetype.startsWith('image/')) {
		cb(null, true)
	} else {
		cb(new Error('Only image files are allowed!'))
	}
}

// Giới hạn kích thước file (5MB)
const limits = {
	fileSize: 5 * 1024 * 1024 // 5MB
}

// Middleware xử lý upload một ảnh
export const uploadSingle = multer({
	storage,
	fileFilter,
	limits
}).single('image')

// Middleware xử lý upload nhiều ảnh (tối đa 5 ảnh)
export const uploadMultiple = multer({
	storage,
	fileFilter,
	limits
}).array('images', 5)

// Middleware bắt lỗi từ multer
export const handleMulterError = (
	err: Error | MulterError,
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	if (err instanceof MulterError) {
		if (err.code === 'LIMIT_FILE_SIZE') {
			res.status(400).json({
				error: 'File size exceeded. Maximum file size is 5MB.'
			})
			return
		}
		if (err.code === 'LIMIT_FILE_COUNT') {
			res.status(400).json({
				error: 'Too many files. Maximum is 5 files at once.'
			})
			return
		}
		res.status(400).json({
			error: `Upload error: ${err.message}`
		})
		return
	}

	if (err) {
		res.status(400).json({
			error: err.message
		})
		return
	}

	next()
}
