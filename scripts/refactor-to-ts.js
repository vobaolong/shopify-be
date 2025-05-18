const fs = require('fs')
const path = require('path')
const util = require('util')
const readdir = util.promisify(fs.readdir)
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)
const stat = util.promisify(fs.stat)

// Paths to process
const ROOT_DIR = path.resolve(__dirname, '../src')

// Function to check if a file is a TypeScript file
const isTypeScriptFile = (filePath) => {
  return filePath.endsWith('.ts') && !filePath.endsWith('.d.ts')
}

// Function to get all .ts files recursively
async function getFilesRecursively(directory) {
  const dirents = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = path.resolve(directory, dirent.name)
      return dirent.isDirectory() ? getFilesRecursively(res) : res
    })
  )
  return Array.prototype.concat(...files).filter(isTypeScriptFile)
}

// Update imports and add type annotations to function parameters
function refactorCode(content) {
  // Add Express imports if they're missing
  if (
    content.includes('req, res') ||
    content.includes('req,res') ||
    content.includes('(req, res,') ||
    content.includes('(req,res,')
  ) {
    if (
      !content.includes('import { Request, Response') &&
      !content.includes('import {Request, Response')
    ) {
      content = `import { Request, Response, NextFunction } from 'express'\n${content}`
    }
  }

  // Replace route handlers with typed versions
  content = content.replace(
    /export const ([a-zA-Z0-9_]+) = async \(req, res(?:, next)?\) => {/g,
    `export const $1 = async (req: Request, res: Response): Promise<void> => {`
  )

  content = content.replace(
    /export const ([a-zA-Z0-9_]+) = async \(req, res, next\) => {/g,
    `export const $1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {`
  )

  // Replace return res.json with res.json and return keywords
  content = content.replace(/return res\.json\(/g, 'res.json(')
  content = content.replace(
    /return res\.status\([0-9]+\)\.json\(/g,
    (match) => {
      return match.replace('return ', '')
    }
  )

  // Add return statements after res.json or res.status calls when needed
  content = content.replace(
    /res\.json\((.*)\)(;?)\s+}/gm,
    'res.json($1)$2\n    return;\n  }'
  )
  content = content.replace(
    /res\.status\([0-9]+\)\.json\((.*)\)(;?)\s+}/gm,
    'res.status($1).json($2)$3\n    return;\n  }'
  )

  // Add type annotations to middleware parameters
  content = content.replace(
    /export const ([a-zA-Z0-9_]+) = \((req, res, next)\) => {/g,
    `export const $1 = (req: Request, res: Response, next: NextFunction): void => {`
  )

  // Handle JSDoc comments
  content = content.replace(
    /@param {Object} req - Express request object/g,
    '@param req - Express request object'
  )
  content = content.replace(
    /@param {Object} res - Express response object/g,
    '@param res - Express response object'
  )
  content = content.replace(
    /@param {Function} next - Express next middleware function/g,
    '@param next - Express next middleware function'
  )

  return content
}

// Process a single file
async function processFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8')
    const refactoredContent = refactorCode(content)

    if (content !== refactoredContent) {
      await writeFile(filePath, refactoredContent, 'utf8')
      console.log(`✅ Refactored: ${filePath}`)
    } else {
      console.log(`⏭ Skipped (no changes): ${filePath}`)
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error)
  }
}

// Main function
async function main() {
  try {
    const files = await getFilesRecursively(ROOT_DIR)
    console.log(`Found ${files.length} TypeScript files.`)

    // Process files in batches to avoid memory issues
    const batchSize = 10
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize)
      await Promise.all(batch.map((file) => processFile(file)))
      console.log(
        `Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          files.length / batchSize
        )}`
      )
    }

    console.log('Refactoring complete.')
  } catch (error) {
    console.error('Error:', error)
  }
}

main().catch(console.error)
