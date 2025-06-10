import { RequestHandler, Response } from 'express'
import Commission from '../../models/commission.model'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { CommissionRequest } from './commission.types'

export const createCommission: RequestHandler = async (
  req: CommissionRequest,
  res: Response
) => {
  try {
    const { name, fee, description } = req.body
    const commission = new Commission({
      name,
      fee,
      description
    })
    await commission.save()
    res.status(201).json({
      success: 'Create commission successfully'
    })
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const updateCommission: RequestHandler = async (
  req: CommissionRequest,
  res: Response
) => {
  try {
    const commissionId = req.params.commissionId
    const { name, fee, description } = req.body
    const commission = await Commission.findOneAndUpdate(
      { _id: commissionId },
      { $set: { name, fee, description } }
    )
    if (!commission) {
      res.status(404).json({
        error: 'Commission not found'
      })
      return
    }
    res.status(200).json({
      success: 'Update commission successfully'
    })
  } catch (error) {
    res.status(404).json({
      error: 'Commission not found'
    })
  }
}

export const removeCommission: RequestHandler = async (
  req: CommissionRequest,
  res: Response
) => {
  try {
    const commissionId = req.params.commissionId
    const commission = await Commission.findOneAndUpdate(
      { _id: commissionId },
      { $set: { isDeleted: true } }
    )
    if (!commission) {
      res.status(404).json({
        error: 'Commission not found'
      })
      return
    }
    res.status(200).json({
      success: 'Remove commission successfully'
    })
  } catch (error) {
    res.status(404).json({
      error: 'Commission not found'
    })
  }
}

export const restoreCommission: RequestHandler = async (
  req: CommissionRequest,
  res: Response
) => {
  try {
    const commissionId = req.params.commissionId
    const commission = await Commission.findOneAndUpdate(
      { _id: commissionId },
      { $set: { isDeleted: false } }
    )
    if (!commission) {
      res.status(404).json({
        error: 'Commission not found'
      })
      return
    }
    res.status(200).json({
      success: 'Restore commission successfully'
    })
  } catch (error) {
    res.status(404).json({
      error: 'Commission not found'
    })
  }
}
