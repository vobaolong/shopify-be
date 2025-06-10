import { RequestHandler, Response } from 'express'
import { User, Address } from '../../models/index.model'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { cleanUserLess } from '../../helpers/userHandler'
import { UserRequest } from './user.types'

export const addAddress: RequestHandler = async (
  req: UserRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    let addresses = req.user.addresses
    if (addresses.length >= 10) {
      res.status(400).json({ error: 'The limit is 10 addresses' })
      return
    }

    const addressData = req.body.address as string
    if (!addressData) {
      res.status(400).json({ error: 'Address is required' })
      return
    }

    addresses.push(addressData.trim())
    addresses = [...new Set(addresses)]

    try {
      const address = new Address({ ...req.body })
      await address.save()

      const user = await User.findOneAndUpdate(
        { _id: req.user?._id },
        { $set: { addresses } },
        { new: true }
      )

      if (!user) {
        res.status(500).json({ error: 'User not found' })
        return
      }

      res.status(200).json({
        success: 'Add address successfully',
        user: cleanUserLess(user.toObject ? user.toObject() : user)
      })
    } catch (error) {
      res.status(400).json({ error: errorHandler(error as MongoError) })
    }
  } catch (error) {
    res.status(400).json({ error: errorHandler(error as MongoError) })
  }
}

export const updateAddress: RequestHandler = async (
  req: UserRequest,
  res: Response
) => {
  try {
    const addressIndex =
      req.query.index &&
      !isNaN(parseInt(req.query.index as string)) &&
      parseInt(req.query.index as string) >= 0 &&
      parseInt(req.query.index as string) <= 10
        ? parseInt(req.query.index as string)
        : -1

    if (addressIndex === -1) {
      res.status(400).json({ error: 'index not found' })
      return
    }

    let addresses = req.user.addresses
    if (addresses.length <= addressIndex) {
      res.status(404).json({ error: 'Address not found' })
      return
    }

    const index = addresses.indexOf(req.body.address.trim())
    if (index !== -1 && index !== addressIndex) {
      res.status(400).json({ error: 'Address already exists' })
      return
    }

    const addressDetail = req.body.addressDetail

    if (addressDetail._id) {
      await Address.findByIdAndUpdate(addressDetail._id, {
        provinceID: addressDetail.province,
        provinceName: addressDetail.provinceName,
        districtID: addressDetail.district,
        districtName: addressDetail.districtName,
        wardID: addressDetail.ward,
        wardName: addressDetail.wardName,
        address: addressDetail.street
      })
    } else {
      const newAddress = new Address({
        provinceID: addressDetail.province,
        provinceName: addressDetail.provinceName,
        districtID: addressDetail.district,
        districtName: addressDetail.districtName,
        wardID: addressDetail.ward,
        wardName: addressDetail.wardName,
        address: addressDetail.street
      })
      await newAddress.save()
    }

    addresses.splice(addressIndex, 1, req.body.address.trim())

    const user = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { addresses } },
      { new: true }
    )

    if (!user) {
      res.status(500).json({ error: 'User not found' })
      return
    }

    res.status(200).json({
      success: 'Update address successfully',
      user: cleanUserLess(user.toObject ? user.toObject() : user)
    })
  } catch (error) {
    res.status(400).json({ error: errorHandler(error as MongoError) })
  }
}

export const removeAddress: RequestHandler = async (
  req: UserRequest,
  res: Response
) => {
  try {
    const addressIndex =
      req.query.index &&
      !isNaN(parseInt(req.query.index as string)) &&
      parseInt(req.query.index as string) >= 0 &&
      parseInt(req.query.index as string) <= 10
        ? parseInt(req.query.index as string)
        : -1

    if (addressIndex === -1) {
      res.status(400).json({ error: 'index not found' })
      return
    }

    let addresses = req.user.addresses
    if (addresses.length <= addressIndex) {
      res.status(404).json({ error: 'Address not found' })
      return
    }

    addresses.splice(addressIndex, 1)

    const user = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { addresses } },
      { new: true }
    )

    if (!user) {
      res.status(500).json({ error: 'User not found' })
      return
    }

    res.status(200).json({
      success: 'Remove address successfully',
      user: cleanUserLess(user.toObject ? user.toObject() : user)
    })
  } catch (error) {
    res.status(400).json({ error: errorHandler(error as MongoError) })
  }
}
