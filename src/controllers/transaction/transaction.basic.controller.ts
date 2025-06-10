import { RequestHandler, RequestParamHandler } from 'express'
import { Transaction, User, Store } from '../../models/index.model'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { TransactionRequest } from './transaction.types'
import mongoose from 'mongoose'

export const getTransactionById: RequestParamHandler = async (
  req,
  res,
  next,
  id: string
) => {
  try {
    const transaction = await Transaction.findById(id)
    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' })
      return
    }
    req.transaction = transaction
    next()
  } catch (error) {
    res.status(404).json({ error: errorHandler(error as MongoError) })
  }
}

export const readTransaction: RequestHandler = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.transaction?._id })
      .populate('userId', '_id userName name avatar')
      .populate('storeId', '_id name avatar isOpen isActive')
      .exec()
    if (!transaction) {
      res.status(500).json({ error: 'Transaction not found' })
      return
    }
    res.status(200).json({
      success: 'Read transaction successfully',
      transaction
    })
  } catch (error) {
    res.status(500).json({ error: errorHandler(error as MongoError) })
  }
}

export const createTransaction: RequestHandler = async (req, res, next) => {
  const transactionReq = req as TransactionRequest
  if (!transactionReq.createTransaction) {
    res.status(400).json({ error: 'Transaction data missing' })
    return
  }
  const { userId, storeId, isUp, code, amount } =
    transactionReq.createTransaction
  if ((!userId && !storeId) || typeof isUp !== 'boolean' || !amount) {
    res.status(400).json({ error: 'All fields are required!' })
    return
  }
  try {
    const transaction = new Transaction({
      userId,
      storeId,
      isUp,
      code,
      amount
    })
    await transaction.save()
    if (next) next()
  } catch (error) {
    res.status(500).json({ error: errorHandler(error as MongoError) })
  }
}
