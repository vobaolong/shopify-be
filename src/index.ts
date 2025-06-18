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
import compression from 'compression'

const app = express()

app.use(
  compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false
      }
      return compression.filter(req, res)
    }
  })
)

mongoose.set('bufferCommands', false)

mongoose
  .connect(process.env.DATABASE || '', {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxIdleTimeMS: 30000,
    connectTimeoutMS: 10000
  })
  .then(() => {
    console.log('✅ DB connected successfully with optimized settings')
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
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
})

app.use('/api', apiLimiter)

app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    maxAge: 86400
  })
)

app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use(routes)

app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'API is running',
    version: '1.0',
    nodeVersion: process.version
  })
})

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message
  })
})

const server = http.createServer(app)

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' })
})
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`)
  console.log(`✅ Node.js version: ${process.version}`)
})

initSocketServer(server)
