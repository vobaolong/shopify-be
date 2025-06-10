import { RequestHandler } from 'express'
import Address from '../../models/address.model'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { AuthenticatedRequest, AddressData } from './address.types'

export const getAddress: RequestHandler = async (req, res) => {
  try {
    const { address } = req.params
    const addressInfo = await Address.findOne({ address })
    if (!addressInfo) {
      res.status(404).json({ error: 'Address not found' })
      return
    }
    res.status(200).json({
      success: 'Get address successfully',
      address: addressInfo
    })
  } catch (error) {
    res.status(500).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const getAddressById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params
    const addressInfo = await Address.findById(id)

    if (!addressInfo) {
      res.status(404).json({ error: 'Address not found' })
      return
    }
    res.status(200).json({
      success: 'Get address successfully',
      address: addressInfo
    })
  } catch (error) {
    res.status(500).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const createAddress: RequestHandler = async (
  req: AuthenticatedRequest,
  res
) => {
  try {
    const {
      provinceID,
      provinceName,
      districtID,
      districtName,
      wardID,
      wardName,
      address
    }: AddressData = req.body

    if (!provinceID || !districtID || !wardID || !address) {
      res.status(400).json({
        error: 'Province ID, District ID, Ward ID, and address are required'
      })
      return
    }

    const existingAddress = await Address.findOne({
      provinceID,
      districtID,
      wardID,
      address
    })

    if (existingAddress) {
      res.status(409).json({ error: 'Address already exists' })
      return
    }

    const newAddress = new Address({
      provinceID,
      provinceName,
      districtID,
      districtName,
      wardID,
      wardName,
      address
    })

    await newAddress.save()

    res.status(201).json({
      success: 'Address created successfully',
      address: newAddress
    })
  } catch (error) {
    res.status(500).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const updateAddress: RequestHandler = async (
  req: AuthenticatedRequest,
  res
) => {
  try {
    const { id } = req.params
    const {
      provinceID,
      provinceName,
      districtID,
      districtName,
      wardID,
      wardName,
      address
    }: AddressData = req.body

    const existingAddress = await Address.findById(id)
    if (!existingAddress) {
      res.status(404).json({ error: 'Address not found' })
      return
    }

    const updateData: AddressData = {}
    if (provinceID !== undefined) updateData.provinceID = provinceID
    if (provinceName !== undefined) updateData.provinceName = provinceName
    if (districtID !== undefined) updateData.districtID = districtID
    if (districtName !== undefined) updateData.districtName = districtName
    if (wardID !== undefined) updateData.wardID = wardID
    if (wardName !== undefined) updateData.wardName = wardName
    if (address !== undefined) updateData.address = address

    const updatedAddress = await Address.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    })

    res.status(200).json({
      success: 'Address updated successfully',
      address: updatedAddress
    })
  } catch (error) {
    res.status(500).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const deleteAddress: RequestHandler = async (
  req: AuthenticatedRequest,
  res
) => {
  try {
    const { id } = req.params

    const deletedAddress = await Address.findByIdAndDelete(id)
    if (!deletedAddress) {
      res.status(404).json({ error: 'Address not found' })
      return
    }

    res.status(200).json({
      success: 'Address deleted successfully',
      address: deletedAddress
    })
  } catch (error) {
    res.status(500).json({
      error: errorHandler(error as MongoError)
    })
  }
}
