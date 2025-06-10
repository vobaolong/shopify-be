import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import morgan from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import http from 'http'
import rateLimit from 'express-rate-limit'
import routes from './routes'
import { initSocketServer } from './socketServer'
import { Request, Response, NextFunction } from 'express'

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

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { error: 'Too many requests, please try again later.' }
})

// Apply rate limiter to API routes
// app.use('/api', apiLimiter)

app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())

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
app.use(routes)

// Root route for health check
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'API is running',
    version: '1.0',
    nodeVersion: process.version
  })
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

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' })
})
// Start server
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`✅⚡ Server is running on port ${PORT}`)
  console.log(`✅⚡ Node.js version: ${process.version}`)
})

// Initialize Socket.IO server
initSocketServer(server)
