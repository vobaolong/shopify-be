import express from 'express'
import fs from 'fs'
import path from 'path'

const router = express.Router()

const routeCache = new Map()

try {
  const files = fs.readdirSync(__dirname)
  const routeFiles = files.filter(
    (file) => file !== 'index.ts' && file.endsWith('.route.ts')
  )

  const routePromises = routeFiles.map(async (file) => {
    try {
      const filePath = path.join(__dirname, file)

      if (routeCache.has(filePath)) {
        const route = routeCache.get(filePath)
        router.use('/api/v1', route)
        console.log(`✅ Loaded cached route: ${file}`)
        return
      }

      const route = require(filePath).default
      if (route && typeof route.stack !== 'undefined') {
        // Cache the route
        routeCache.set(filePath, route)
        router.use('/api/v1', route)
        console.log(`✅ Loaded route: ${file}`)
      } else {
        console.error(
          `❌ Failed to load route: ${file} - Invalid router export`
        )
      }
    } catch (importError) {
      console.error(`Error importing route file ${file}:`, importError)
    }
  })

  // Wait for all routes to load
  Promise.all(routePromises).then(() => {
    console.log('✅ All routes loaded successfully')
  })
} catch (error) {
  console.error('❌ Error reading routes directory:', error)
}

export default router
