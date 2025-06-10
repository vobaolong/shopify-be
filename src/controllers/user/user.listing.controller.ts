import { RequestHandler, Response } from 'express'
import { User } from '../../models/index.model'
import { cleanUser, cleanUserLess } from '../../helpers/userHandler'
import { UserRequest, FilterType } from './user.types'

export const listUser: RequestHandler = async (
  req: UserRequest,
  res: Response
) => {
  try {
    const search = req.query.search ? (req.query.search as string) : ''
    const sortBy = req.query.sortBy ? (req.query.sortBy as string) : '_id'
    const order =
      req.query.order &&
      (req.query.order === 'asc' || req.query.order === 'desc')
        ? req.query.order
        : 'asc'
    const limit =
      req.query.limit &&
      !isNaN(parseInt(req.query.limit as string)) &&
      parseInt(req.query.limit as string) > 0
        ? parseInt(req.query.limit as string)
        : 6
    const page =
      req.query.page &&
      !isNaN(parseInt(req.query.page as string)) &&
      parseInt(req.query.page as string) > 0
        ? parseInt(req.query.page as string)
        : 1

    const filter: FilterType = {
      search,
      sortBy,
      order,
      limit,
      pageCurrent: page
    }

    const searchField = req.query.searchField as string | undefined
    let filterArgs: any = { role: { $ne: 'admin' } }
    if (searchField && search) {
      if (searchField === 'name') {
        filterArgs.$or = [
          { userName: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } }
        ]
      } else {
        filterArgs[searchField] = { $regex: search, $options: 'i' }
      }
    } else if (search) {
      filterArgs.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    }

    const count = await User.countDocuments(filterArgs)
    const size = count
    const pageCount = Math.ceil(size / limit)
    filter.pageCount = pageCount

    let skip = (page - 1) * limit
    if (page > pageCount) {
      skip = (pageCount - 1) * limit
    }
    if (count <= 0) {
      res.status(200).json({
        success: 'Load list users successfully',
        filter,
        size,
        users: []
      })
      return
    }
    const users = await User.find(filterArgs)
      .lean()
      .sort({ [sortBy as string]: order, _id: 1 })
      .limit(limit)
      .skip(skip)
    const cleanedUsers = users.map((user: any) => cleanUser(user))
    res.status(200).json({
      success: 'Load list users successfully',
      filter,
      size,
      users: cleanedUsers
    })
  } catch (error) {
    res.status(500).json({ error: 'Load list users failed' })
  }
}

export const listUserForAdmin: RequestHandler = async (
  req: UserRequest,
  res: Response
) => {
  try {
    const search = req.query.search ? String(req.query.search) : ''
    const sortBy = req.query.sortBy ? String(req.query.sortBy) : '_id'
    const order =
      req.query.order === 'asc' || req.query.order === 'desc'
        ? req.query.order
        : 'asc'
    const limit =
      req.query.limit && parseInt(req.query.limit) > 0
        ? parseInt(req.query.limit)
        : 6
    const page =
      req.query.page && parseInt(req.query.page) > 0
        ? parseInt(req.query.page)
        : 1
    const createdAtFrom = req.query.createdAtFrom as string | undefined
    const createdAtTo = req.query.createdAtTo as string | undefined
    const searchField = req.query.searchField as string | undefined
    const isEmailActive =
      typeof req.query.isEmailActive !== 'undefined'
        ? req.query.isEmailActive === 'true'
        : undefined

    let filterArgs: any = { role: { $ne: 'admin' } }

    if (searchField && search) {
      if (searchField === 'name') {
        filterArgs.$or = [
          { userName: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } }
        ]
      } else {
        filterArgs[searchField] = { $regex: search, $options: 'i' }
      }
    } else if (search) {
      filterArgs.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    }

    if (typeof isEmailActive !== 'undefined') {
      filterArgs.isEmailActive = isEmailActive
    }

    if (createdAtFrom || createdAtTo) {
      filterArgs.createdAt = {}
      if (createdAtFrom) filterArgs.createdAt.$gte = new Date(createdAtFrom)
      if (createdAtTo) filterArgs.createdAt.$lte = new Date(createdAtTo)
    }

    const count = await User.countDocuments(filterArgs)
    const size = count
    const pageCount = Math.ceil(size / limit)
    const filter: FilterType = {
      search,
      sortBy,
      order,
      limit,
      pageCurrent: page,
      pageCount
    }
    let skip = (page - 1) * limit
    if (page > pageCount) {
      skip = (pageCount - 1) * limit
    }

    if (count <= 0) {
      res.status(200).json({
        success: 'Load list users successfully',
        filter,
        size,
        users: []
      })
      return
    }
    const users = await User.find(filterArgs)
      .lean()
      .sort({ [sortBy]: order, _id: 1 })
      .skip(skip)
      .limit(limit)
    const cleanedUsers = users.map((user: any) => cleanUserLess(user))
    res.status(200).json({
      success: 'Load list users successfully',
      filter,
      size,
      users: cleanedUsers
    })
  } catch (error) {
    res.status(500).json({ error: 'Load list users failed' })
  }
}
