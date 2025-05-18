import { Request, RequestHandler, Response } from 'express'
import Address from '../models/address.model'
import { errorHandler, MongoError } from '../helpers/errorHandler'

// Hàm lấy thông tin địa chỉ từ địa chỉ string
export const getAddress: RequestHandler = async (req: Request, res: Response) => {
	try {
		const { address } = req.params
		const addressInfo = await Address.findOne({ address })

		if (!addressInfo) {
			res.status(404).json({
				error: 'Address not found'
			})
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

// Hàm lấy danh sách tỉnh thành
export const getProvinces: RequestHandler = async (req: Request, res: Response) => {
	try {
		const addresses = await Address.find({}, 'provinceName')
		const provinces = [
			...new Set(
				addresses
					.map((a) => a.provinceName)
					.filter((name) => name && name.trim() !== '')
			)
		]
		res.status(200).json({
			success: 'Get provinces successfully',
			provinces
		})
	} catch (error) {
		res.status(500).json({
			error: errorHandler(error as MongoError)
		})
	}
}
