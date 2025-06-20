import { RequestParamHandler, RequestHandler } from 'express'
import { VariantValue } from '../../models/index.model'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { VariantValueRequest } from './variantValue.types'

export const getVariantValueById: RequestParamHandler = async (
  req: VariantValueRequest,
  res,
  next,
  id: string
) => {
  try {
    const variantValue = await VariantValue.findById(id)
    if (!variantValue) {
      res.status(404).json({ error: 'VariantValue not found' })
      return
    }
    req.variantValue = variantValue
    next()
  } catch (error) {
    res.status(404).json({ error: 'VariantValue not found' })
  }
}

export const readVariantValue: RequestHandler = async (
  req: VariantValueRequest,
  res
) => {
  try {
    const variantValue = await VariantValue.findOne({
      _id: req.variantValue._id
    }).populate({
      path: 'variantId',
      select: '_id name isDeleted categoryIds',
      populate: {
        path: 'categoryIds',
        select: '_id name isDeleted'
      }
    })

    if (!variantValue) {
      res.status(500).json({ error: 'Not found!' })
      return
    }

    res.status(200).json({
      success: 'Read variant value successfully',
      variantValue
    })
  } catch (error) {
    res.status(500).json({ error: 'Not found!' })
  }
}

export const createVariantValue: RequestHandler = async (
  req: VariantValueRequest,
  res
) => {
  try {
    const { name, value, variantId } = req.body

    if (!name || !variantId) {
      res.status(400).json({
        error: 'Name and variant ID are required'
      })
      return
    }

    const existingVariantValue = await VariantValue.findOne({
      name,
      variantId
    })
    if (existingVariantValue) {
      res.status(409).json({
        error: 'Variant value already exists'
      })
      return
    }

    const variantValue = new VariantValue({ name, value, variantId })
    await variantValue.save()

    res.status(201).json({
      success: 'Create variant value successfully',
      variantValue
    })
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const updateVariantValue: RequestHandler = async (
  req: VariantValueRequest,
  res
) => {
  try {
    const { name, value, variantId } = req.body

    if (!name && !value && !variantId) {
      res.status(400).json({
        error: 'At least one field is required for update'
      })
      return
    }
    const updateData: any = {}
    if (name) updateData.name = name
    if (value !== undefined) updateData.value = value
    if (variantId) updateData.variantId = variantId

    const variantValue = await VariantValue.findOneAndUpdate(
      { _id: req.variantValue._id },
      { $set: updateData },
      { new: true }
    ).populate({
      path: 'variantId',
      select: '_id name isDeleted categoryIds',
      populate: {
        path: 'categoryIds',
        select: '_id name isDeleted'
      }
    })

    if (!variantValue) {
      res.status(400).json({
        error: 'Update variant value failed'
      })
      return
    }

    res.status(200).json({
      success: 'Update variant value successfully',
      variantValue
    })
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const removeVariantValue: RequestHandler = async (
  req: VariantValueRequest,
  res
) => {
  try {
    const variantValue = await VariantValue.findOneAndUpdate(
      { _id: req.variantValue._id },
      { $set: { isDeleted: true } },
      { new: true }
    )

    if (!variantValue) {
      res.status(400).json({
        error: 'Remove variant value failed'
      })
      return
    }

    res.status(200).json({
      success: 'Remove variant value successfully',
      variantValue
    })
  } catch (error) {
    res.status(400).json({
      error: 'Remove variant value failed'
    })
  }
}

export const restoreVariantValue: RequestHandler = async (
  req: VariantValueRequest,
  res
) => {
  try {
    const variantValue = await VariantValue.findOneAndUpdate(
      { _id: req.variantValue._id },
      { $set: { isDeleted: false } },
      { new: true }
    )

    if (!variantValue) {
      res.status(400).json({
        error: 'Restore variant value failed'
      })
      return
    }

    res.status(200).json({
      success: 'Restore variant value successfully',
      variantValue
    })
  } catch (error) {
    res.status(400).json({
      error: 'Restore variant value failed'
    })
  }
}
