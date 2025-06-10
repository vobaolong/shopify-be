import { RequestHandler } from 'express'
import { Transaction } from '../../models/index.model'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { FilterType, TransactionRequest } from './transaction.types'
import mongoose from 'mongoose'

export const getTransactions: RequestHandler = async (req, res) => {
  try {
    const sortBy = req.query.sortBy?.toString() || 'createdAt'
    const order = ['asc', 'desc'].includes(req.query.order?.toString() || '')
      ? req.query.order?.toString()
      : 'desc'
    const limit = Math.max(parseInt(req.query.limit?.toString() || '6'), 1)
    const page = Math.max(parseInt(req.query.page?.toString() || '1'), 1)
    const search = req.query.search?.toString() || ''
    const searchField = req.query.searchField?.toString() || ''
    const type = req.query.type?.toString() || ''
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
    if (type === 'deposit') filterArgs.isUp = true
    if (type === 'withdraw') filterArgs.isUp = false
    if (createdAtFrom || createdAtTo) {
      filterArgs.createdAt = {}
      if (createdAtFrom) filterArgs.createdAt.$gte = new Date(createdAtFrom)
      if (createdAtTo) filterArgs.createdAt.$lte = new Date(createdAtTo)
    }
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
    let count = 0
    let transactions: any[] = []
    if (search && searchField === 'ownerName') {
      const matchStage: any = { ...filterArgs }
      delete matchStage.$or
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
              { 'userInfo.userName': { $regex: search, $options: 'i' } },
              { 'userInfo.name': { $regex: search, $options: 'i' } },
              {
                userInfo: { $exists: true, $ne: null },
                $expr: {
                  $regexMatch: {
                    input: {
                      $concat: ['$userInfo.userName', ' ', '$userInfo.name']
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
      const countPipeline = aggregatePipeline.slice(0, 5)
      countPipeline.push({ $count: 'total' })
      const countResult = await Transaction.aggregate(countPipeline)
      count = countResult[0]?.total || 0
      transactions = await Transaction.aggregate(aggregatePipeline)
      transactions = transactions.map((tx) => ({
        ...tx,
        userId: tx.userInfo
          ? {
              _id: tx.userInfo._id,
              userName: tx.userInfo.userName,
              name: tx.userInfo.name,
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
        .populate('userId', '_id userName name avatar')
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
