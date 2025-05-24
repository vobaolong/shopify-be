import { Transaction, User, Store } from '../models/index.model'
import { errorHandler, MongoError } from '../helpers/errorHandler'
import { FilterType } from '../types/controller.types'
import mongoose from 'mongoose'
import { RequestHandler, RequestParamHandler } from 'express'

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
      .populate('userId', '_id firstName lastName avatar')
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

export const createTransaction: RequestHandler = async (req, res, next) => {
  if (!req.createTransaction) {
    res.status(400).json({ error: 'Transaction data missing' })
    return
  }
  const { userId, storeId, isUp, code, amount } = req.createTransaction
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

export const getTransactions: RequestHandler = async (req, res) => {
  try {
    const sortBy = req.query.sortBy?.toString() || 'createdAt'
    const order = ['asc', 'desc'].includes(req.query.order?.toString() || '')
      ? req.query.order?.toString()
      : 'desc'
    const limit = Math.max(parseInt(req.query.limit?.toString() || '6'), 1)
    const page = Math.max(parseInt(req.query.page?.toString() || '1'), 1)

    // Lấy các filter nâng cao
    const search = req.query.search?.toString() || ''
    const searchField = req.query.searchField?.toString() || ''
    const type = req.query.type?.toString() || '' // 'deposit' | 'withdraw'
    const createdAtFrom = req.query.createdAtFrom?.toString()
    const createdAtTo = req.query.createdAtTo?.toString()

    const filter: FilterType = {
      search: search || '',
      sortBy: sortBy || 'createdAt',
      order: order || 'desc',
      limit,
      pageCurrent: page
    }
    if (!req.store && !req.user) {
      res.status(404).json({ error: 'List transactions not found' })
      return
    }
    let filterArgs: Record<string, any> = {}
    if (!req.store && req.user && req.user.role === 'user') {
      filterArgs = { userId: req.user._id }
    } else if (req.store) {
      filterArgs = { storeId: req.store._id }
    }
    // Lọc theo loại giao dịch
    if (type === 'deposit') filterArgs.isUp = true
    if (type === 'withdraw') filterArgs.isUp = false
    // Lọc theo thời gian
    if (createdAtFrom || createdAtTo) {
      filterArgs.createdAt = {}
      if (createdAtFrom) filterArgs.createdAt.$gte = new Date(createdAtFrom)
      if (createdAtTo) filterArgs.createdAt.$lte = new Date(createdAtTo)
    }
    // Lọc theo mã giao dịch hoặc code
    if (search && searchField === 'transactionId') {
      filterArgs.$or = [
        {
          _id: mongoose.Types.ObjectId.isValid(search)
            ? new mongoose.Types.ObjectId(search)
            : undefined
        },
        { code: { $regex: search, $options: 'i' } }
      ].filter((cond) => Object.values(cond)[0] !== undefined)
    }
    // Đếm tổng số bản ghi
    let count = 0
    let transactions: any[] = []
    // Nếu search theo tên người thực hiện, dùng aggregate để join user và filter theo tên
    if (search && searchField === 'ownerName') {
      const matchStage: any = { ...filterArgs }
      delete matchStage.$or // Không dùng $or khi search theo tên
      const aggregatePipeline: any[] = [
        { $match: matchStage },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
        {
          $match: {
            $or: [
              { 'userInfo.firstName': { $regex: search, $options: 'i' } },
              { 'userInfo.lastName': { $regex: search, $options: 'i' } },
              { 'userInfo.fullName': { $regex: search, $options: 'i' } },
              {
                userInfo: { $exists: true, $ne: null },
                $expr: {
                  $regexMatch: {
                    input: {
                      $concat: [
                        '$userInfo.firstName',
                        ' ',
                        '$userInfo.lastName'
                      ]
                    },
                    regex: search,
                    options: 'i'
                  }
                }
              }
            ]
          }
        },
        { $sort: { [sortBy]: order === 'asc' ? 1 : -1, _id: 1 } },
        { $skip: limit * (page - 1) },
        { $limit: limit },
        {
          $lookup: {
            from: 'stores',
            localField: 'storeId',
            foreignField: '_id',
            as: 'storeInfo'
          }
        },
        { $unwind: { path: '$storeInfo', preserveNullAndEmptyArrays: true } }
      ]
      // Đếm tổng số bản ghi
      const countPipeline = aggregatePipeline.slice(0, 5) // đến trước $sort
      countPipeline.push({ $count: 'total' })
      const countResult = await Transaction.aggregate(countPipeline)
      count = countResult[0]?.total || 0
      transactions = await Transaction.aggregate(aggregatePipeline)
      // Map lại userId, storeId cho giống populate
      transactions = transactions.map((tx) => ({
        ...tx,
        userId: tx.userInfo
          ? {
              _id: tx.userInfo._id,
              firstName: tx.userInfo.firstName,
              lastName: tx.userInfo.lastName,
              avatar: tx.userInfo.avatar
            }
          : undefined,
        storeId: tx.storeInfo
          ? {
              _id: tx.storeInfo._id,
              name: tx.storeInfo.name,
              avatar: tx.storeInfo.avatar,
              isActive: tx.storeInfo.isActive,
              isOpen: tx.storeInfo.isOpen
            }
          : undefined
      }))
    } else {
      count = await Transaction.countDocuments(filterArgs)
      if (count <= 0) {
        res.status(200).json({
          success: 'Load list transactions successfully',
          filter,
          size: 0,
          transactions: []
        })
        return
      }
      const pageCount = Math.ceil(count / limit) || 1
      filter.pageCount = pageCount
      const skip = limit * (Math.min(page, pageCount) - 1)
      transactions = await Transaction.find(filterArgs)
        .sort({ [sortBy]: order === 'asc' ? 1 : -1, _id: 1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', '_id firstName lastName avatar')
        .populate('storeId', '_id name avatar isActive isOpen')
        .exec()
    }
    res.status(200).json({
      success: 'Load list transactions successfully',
      filter,
      size: count,
      transactions
    })
  } catch (error) {
    res.status(500).json({ error: errorHandler(error as MongoError) })
  }
}
