// shopify-be/src/swaggerConfig.js
import swaggerJSDoc from 'swagger-jsdoc'
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Shopify API',
      version: '1.0.0'
    }
  },
  apis: [
    path.join(__dirname, 'routes/*.ts') // Quét tất cả file .ts trong routes
  ]
}

const swaggerSpec = swaggerJSDoc(options)

// Xuất ra file YAML
fs.writeFileSync(
  path.join(__dirname, '../swagger.yaml'),
  yaml.dump(swaggerSpec),
  'utf8'
)

console.log('Swagger YAML generated at shopify-be/swagger.yaml')
