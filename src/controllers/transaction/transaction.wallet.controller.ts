import { RequestHandler } from 'express'
import { User, Store, Transaction } from '../../models/index.model'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { TransactionRequest } from './transaction.types'
import mongoose from 'mongoose'

export const requestTransaction: RequestHandler = async (req, res, next) => {
  const { isUp, code, amount } = req.body
  if (
    (!req.store && !req.user) ||
    (isUp !== 'true' && isUp !== 'false') ||
    !amount
  ) {
    res.status(400).json({ error: 'All fields are required' })
    return
  }
  req.createTransaction = {
    isUp: isUp === 'true',
    code,
    amount: Number(amount)
  }
  if (!req.store && req.user) {
    req.createTransaction.userId = req.user._id
  } else if (req.store) {
    req.createTransaction.storeId = req.store._id as mongoose.Types.ObjectId
  }
  if (next) next()
}

export const updateEWallet: RequestHandler = async (req, res, next) => {
  if (!req.createTransaction) {
    res.status(400).json({ error: 'Transaction data missing' })
    return
  }
  const { userId, storeId, isUp, amount } = req.createTransaction
  if ((!userId && !storeId) || typeof isUp !== 'boolean' || !amount) {
    res.status(400).json({ error: 'All fields are required!' })
    return
  }
  const updateAmount = isUp ? +amount : -amount
  const updateQuery = { $inc: { e_wallet: updateAmount } }
  try {
    if (userId) {
      const user = await User.findOneAndUpdate({ _id: userId }, updateQuery, {
        new: true
      })
      if (!user) {
        res.status(500).json({ error: 'User not found' })
      }
    } else if (storeId) {
      const store = await Store.findOneAndUpdate(
        { _id: storeId },
        updateQuery,
        { new: true }
      )
      if (!store) {
        res.status(500).json({ error: 'Store not found' })
      }
    }
    if (next) next()
  } catch (error) {
    res.status(500).json({
      error: userId
        ? 'Update user e_wallet failed'
        : 'Update store e_wallet failed'
    })
  }
}
