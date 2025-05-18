import express from 'express'
import mongoose from 'mongoose'
import morgan from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path'
import http from 'http'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.route'
import userRoutes from './routes/user.route'
import storeRoutes from './routes/store.route'
import userLevelRoutes from './routes/userLevel.route'
import storeLevelRoutes from './routes/storeLevel.route'
import commissionRoutes from './routes/commission.route'
import userFollowStoreRoutes from './routes/userFollowStore.route'
import userFavoriteProductRoutes from './routes/userFavoriteProduct.route'
import categoryRoutes from './routes/category.route'
import variantRoutes from './routes/variant.route'
import brandRoutes from './routes/brand.route'
import variantValueRoutes from './routes/variantValue.route'
import productRoutes from './routes/product.route'
import cartRoutes from './routes/cart.route'
import orderRoutes from './routes/order.route'
import transactionRoutes from './routes/transaction.route'
import reviewRoutes from './routes/review.route'
import addressRoutes from './routes/address.route'
import reportRoutes from './routes/report.route'
import notificationRoutes from './routes/notification.route'
import uploadRoutes from './routes/upload.route'
import { initSocketServer } from './socketServer'
import { Request, Response, NextFunction } from 'express'

// Initialize environment variables
dotenv.config()

// Handle __dirname for CommonJS
const __dirname = path.resolve()

// Create Express app
const app = express()

mongoose
	.connect(process.env.DATABASE || '')
	.then(() => {
		console.log('✅ DB connected successfully')
	})
	.catch((error) => {
		console.error('⚠️ Error connecting to database:', error)
		process.exit(1)
	})

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
	console.error('Unhandled Rejection at:', promise, 'reason:', reason)
	// Application specific handling logic here
})

// Morgan logging in development mode
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'))
}

// Static files middleware
app.use(
	'/static',
	express.static(path.join(__dirname, 'public'), {
		maxAge: '1d', // Cache static assets for 1 day
		immutable: true
	})
)

// Rate limiting middleware
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per windowMs
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	message: { error: 'Too many requests, please try again later.' }
})

// Apply rate limiter to API routes
app.use('/api', apiLimiter)

// JSON and cookie parsers
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())

// CORS configuration for Node.js 22
app.use(
	cors({
		origin: '*',
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
		credentials: true,
		allowedHeaders: ['Content-Type', 'Authorization'],
		exposedHeaders: ['Content-Range', 'X-Total-Count'],
		maxAge: 86400 // Cache preflight requests for 24 hours
	})
)

// Extended URL-encoded data parsing
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Router middleware
app.use('/api', authRoutes)
app.use('/api', userRoutes)
app.use('/api', storeRoutes)
app.use('/api', userLevelRoutes)
app.use('/api', storeLevelRoutes)
app.use('/api', commissionRoutes)
app.use('/api', userFollowStoreRoutes)
app.use('/api', userFavoriteProductRoutes)
app.use('/api', categoryRoutes)
app.use('/api', variantRoutes)
app.use('/api', brandRoutes)
app.use('/api', variantValueRoutes)
app.use('/api', productRoutes)
app.use('/api', cartRoutes)
app.use('/api', orderRoutes)
app.use('/api', transactionRoutes)
app.use('/api', reviewRoutes)
app.use('/api', addressRoutes)
app.use('/api', reportRoutes)
app.use('/api', notificationRoutes)
app.use('/api', uploadRoutes)

// Root route for health check
app.get('/', (req: Request, res: Response) => {
	res.json({
		message: 'API is running',
		version: '1.0',
		nodeVersion: process.version
	})
})

// 404 handler
app.use((req: Request, res: Response) => {
	res.status(404).json({ error: 'Route not found' })
})

// Error handler middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	console.error('Error:', err)
	res.status(err.status || 500).json({
		error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message
	})
})

// Create HTTP server
const server = http.createServer(app)

// Start server
const PORT = process.env.PORT || 8000
server.listen(PORT, () => {
	console.log(`✅ Server is running on port ${PORT}`)
	console.log(`✅ Node.js version: ${process.version}`)
})

// Initialize Socket.IO server
initSocketServer(server)
