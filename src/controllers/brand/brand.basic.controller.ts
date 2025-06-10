import { Brand } from '../../models/index.model'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { RequestHandler, RequestParamHandler } from 'express'
import { BrandRequest } from './brand.types'

// Basic brand operations
export const getBrandById: RequestParamHandler = async (
  req: BrandRequest,
  res,
  next,
  id: string
) => {
  try {
    // Tìm brand mà không quan tâm isDeleted để có thể update
    const brand = await Brand.findById(id).exec()
    if (!brand) {
      res.status(404).json({
        error: 'Brand not found'
      })
      return
    }
    req.brand = brand || undefined
    next()
  } catch (error) {
    res.status(404).json({
      error: 'Brand not found'
    })
  }
}

export const getBrand: RequestHandler = async (req: BrandRequest, res) => {
  try {
    const brand = await Brand.findOne({ _id: req.brand?._id })
      .populate('categoryIds')
      .exec()
    if (!brand) {
      res.status(500).json({
        error: 'Load brand failed'
      })
      return
    }
    res.status(200).json({
      success: 'Load brand successfully',
      brand
    })
  } catch (error) {
    res.status(500).json({
      error: 'Load brand failed'
    })
  }
}

export const checkBrand: RequestHandler = async (
  req: BrandRequest,
  res,
  next
) => {
  try {
    let { name, categoryIds } = req.body

    // Parse categoryIds if it's a JSON string (for FormData)
    if (typeof categoryIds === 'string') {
      try {
        categoryIds = JSON.parse(categoryIds)
      } catch (parseError) {
        // If parsing fails, continue with original value
      }
    }

    const brandId = req.brand ? req.brand._id : null
    const existingBrand = await Brand.findOne({
      _id: { $ne: brandId },
      name,
      categoryIds
    }).exec()
    if (!existingBrand) {
      if (next) next()
      return
    }
    res.status(400).json({
      error: 'Brand already exists'
    })
  } catch (error) {
    if (next) next()
  }
}

export const createBrand: RequestHandler = async (req: BrandRequest, res) => {
  try {
    let { name, categoryIds } = req.body

    if (!name || !categoryIds) {
      res.status(400).json({
        error: 'All fields are required'
      })
      return
    }

    // Parse categoryIds if it's a JSON string
    if (typeof categoryIds === 'string') {
      try {
        categoryIds = JSON.parse(categoryIds)
      } catch (parseError) {
        res.status(400).json({
          error: 'Invalid categoryIds format'
        })
        return
      }
    }

    const brand = new Brand({
      name,
      categoryIds
    })

    const savedBrand = await brand.save()

    res.status(201).json({
      success: 'Create brand successfully',
      brand: savedBrand
    })
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const updateBrand: RequestHandler = async (req: BrandRequest, res) => {
  try {
    let { name, categoryIds } = req.body
    if (!name || !categoryIds) {
      res.status(400).json({
        error: 'All fields are required'
      })
      return
    }

    // Parse categoryIds if it's a JSON string
    if (typeof categoryIds === 'string') {
      try {
        categoryIds = JSON.parse(categoryIds)
      } catch (parseError) {
        res.status(400).json({
          error: 'Invalid categoryIds format'
        })
        return
      }
    }

    const brand = await Brand.findOneAndUpdate(
      { _id: req.brand?._id },
      { $set: { name, categoryIds } },
      { new: true }
    ).exec()
    if (!brand) {
      res.status(500).json({
        error: 'Brand not found'
      })
      return
    }
    res.status(200).json({
      success: 'Update brand successfully',
      brand
    })
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const removeBrand: RequestHandler = async (req: BrandRequest, res) => {
  try {
    const brand = await Brand.findOneAndUpdate(
      { _id: req.brand?._id },
      { $set: { isDeleted: true } },
      { new: true }
    ).exec()

    if (!brand) {
      res.status(404).json({
        error: 'Brand not found'
      })
      return
    }

    res.status(200).json({
      success: 'Brand deleted successfully',
      brand
    })
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const restoreBrand: RequestHandler = async (req: BrandRequest, res) => {
  try {
    const brand = await Brand.findOneAndUpdate(
      { _id: req.brand?._id },
      { $set: { isDeleted: false } },
      { new: true }
    ).exec()
    if (!brand) {
      res.status(404).json({
        error: 'Brand not found'
      })
      return
    }

    res.status(200).json({
      success: 'Brand restored successfully',
      brand
    })
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const checkBrandNameExist: RequestHandler = async (
  req: BrandRequest,
  res
) => {
  try {
    const { name } = req.query
    if (!name) {
      res.status(400).json({ exists: false, error: 'Missing name' })
      return
    }
    const brandId = req.query.brandId
    const query: any = { name: { $regex: new RegExp(`^${name}$`, 'i') } }
    if (brandId) {
      query._id = { $ne: brandId }
    }
    const exists = await Brand.exists(query)
    res.json({ exists: !!exists })
  } catch (error) {
    res.status(500).json({ exists: false, error: 'Server error' })
  }
}
