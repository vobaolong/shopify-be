import express from 'express'
import fs from 'fs'
import path from 'path'

const router = express.Router()

try {
  const files = fs.readdirSync(__dirname)
  files
    .filter((file) => file !== 'index.ts' && file.endsWith('.route.ts'))
    .forEach((file) => {
      try {
        const filePath = path.join(__dirname, file)
        const route = require(filePath).default
        if (route && typeof route.stack !== 'undefined') {
          router.use('/api/v1', route)
          console.log(`Loaded route: ${file}`)
        } else {
          console.error(`Failed to load route: ${file} - Invalid router export`)
        }
      } catch (importError) {
        console.error(`Error importing route file ${file}:`, importError)
      }
    })
  console.log('All routes loaded successfully')
} catch (error) {
  console.error('Error reading routes directory:', error)
}

export default router
