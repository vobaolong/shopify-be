import { RequestParamHandler, RequestHandler } from 'express'
import { Variant } from '../../models/index.model'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { VariantRequest } from './variant.types'

export const getVariantById: RequestParamHandler = async (
  req: VariantRequest,
  res,
  next,
  id: string
) => {
  try {
    const variant = await Variant.findById(id)
    if (!variant) {
      res.status(404).json({ error: 'Variant not found' })
      return
    }
    req.variant = variant
    next()
  } catch (error) {
    res.status(404).json({ error: 'Variant not found' })
  }
}

export const readVariant: RequestHandler = async (req: VariantRequest, res) => {
  try {
    const variant = await Variant.findOne({ _id: req.variant._id }).populate(
      'categoryId',
      '_id name isDeleted'
    )
    if (!variant) {
      res.status(500).json({ error: 'Not found!' })
      return
    }
    res.status(200).json({
      success: 'Read variant successfully',
      variant
    })
  } catch (error) {
    res.status(500).json({ error: 'Not found!' })
  }
}

export const createVariant: RequestHandler = async (
  req: VariantRequest,
  res
) => {
  try {
    const { name, categoryIds } = req.body

    if (
      !name ||
      !categoryIds ||
      !Array.isArray(categoryIds) ||
      categoryIds.length === 0
    ) {
      res
        .status(400)
        .json({ error: 'Name and at least one category is required' })
      return
    }

    const existingVariant = await Variant.findOne({ name, categoryIds })
    if (existingVariant) {
      res.status(409).json({
        error: 'Variant already exists'
      })
      return
    }

    const variant = new Variant({ name, categoryIds })
    await variant.save()

    res.status(201).json({
      success: 'Create variant successfully',
      variant
    })
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const updateVariant: RequestHandler = async (
  req: VariantRequest,
  res
) => {
  try {
    const { name, categoryIds } = req.body

    if (!name && !categoryIds) {
      res.status(400).json({
        error: 'At least one field (name or categoryId) is required for update'
      })
      return
    }

    const updateData: any = {}
    if (name) updateData.name = name
    if (categoryIds) updateData.categoryIds = categoryIds

    const variant = await Variant.findOneAndUpdate(
      { _id: req.variant._id },
      { $set: updateData },
      { new: true }
    ).populate('categoryId', '_id name isDeleted')

    if (!variant) {
      res.status(400).json({
        error: 'Update variant failed'
      })
      return
    }

    res.status(200).json({
      success: 'Update variant successfully',
      variant
    })
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const removeVariant: RequestHandler = async (
  req: VariantRequest,
  res
) => {
  try {
    const variant = await Variant.findOneAndUpdate(
      { _id: req.variant._id },
      { $set: { isDeleted: true } },
      { new: true }
    )

    if (!variant) {
      res.status(400).json({
        error: 'Remove variant failed'
      })
      return
    }

    res.status(200).json({
      success: 'Remove variant successfully',
      variant
    })
  } catch (error) {
    res.status(400).json({
      error: 'Remove variant failed'
    })
  }
}

export const restoreVariant: RequestHandler = async (
  req: VariantRequest,
  res
) => {
  try {
    const variant = await Variant.findOneAndUpdate(
      { _id: req.variant._id },
      { $set: { isDeleted: false } },
      { new: true }
    )

    if (!variant) {
      res.status(400).json({
        error: 'Restore variant failed'
      })
      return
    }

    res.status(200).json({
      success: 'Restore variant successfully',
      variant
    })
  } catch (error) {
    res.status(400).json({
      error: 'Restore variant failed'
    })
  }
}

export const checkVariant: RequestHandler = async (req, res, next) => {
  try {
    const { name, categoryIds } = req.body
    if (
      !name ||
      !categoryIds ||
      !Array.isArray(categoryIds) ||
      categoryIds.length === 0
    ) {
      res
        .status(400)
        .json({ error: 'Name and at least one category is required' })
      return
    }
    const existingVariant = await Variant.findOne({ name, categoryIds })
    if (existingVariant) {
      res.status(409).json({ error: 'Variant already exists' })
      return
    }
    next()
  } catch (error) {
    res.status(400).json({ error: errorHandler(error as MongoError) })
  }
}

export const getActiveVariants: RequestHandler = async (req, res) => {
  try {
    const variants = await Variant.find({ isDeleted: false })
      .sort({ name: 1, _id: 1 })
      .populate('categoryId', '_id name isDeleted')
    res.status(200).json({
      success: 'Load list active variants successfully',
      variants
    })
  } catch (error) {
    res.status(500).json({ error: errorHandler(error as MongoError) })
  }
}
