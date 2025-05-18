import { VariantValue } from '../models/index.model'
import { errorHandler, MongoError } from '../helpers/errorHandler'
import { Request, Response, NextFunction, RequestHandler } from 'express'

export const getValueById: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const variantValue = await VariantValue.findById(req.params.id)
		if (!variantValue) {
			res.status(404).json({ error: 'Variant value not found' })
			return
		}
		(req as any).variantValue = variantValue
		next()
	} catch (error) {
		res.status(404).json({ error: 'Variant value not found' })
	}
}

export const createValue: RequestHandler = async (req: Request, res: Response) => {
	try {
		const { name, variantId } = req.body
		if (!name || !variantId) {
			res.status(400).json({ error: 'All fields are required' })
			return
		}
		const variantValue = new VariantValue({ name, variantId })
		const savedVariantValue = await variantValue.save()
		res.status(200).json({ success: 'Create variant value successfully', variantValue: savedVariantValue })
	} catch (error) {
		res.status(400).json({ error: errorHandler(error as MongoError) })
	}
}

export const updateValue: RequestHandler = async (req: Request, res: Response) => {
	try {
		const { name } = req.body
		if (!name) {
			res.status(400).json({ error: 'All fields are required' })
			return
		}
		const variantValue = await VariantValue.findOneAndUpdate(
			{ _id: (req as any).variantValue._id },
			{ $set: { name } },
			{ new: true }
		)
		if (!variantValue) {
			res.status(500).json({ error: 'Variant value not found' })
			return
		}
		res.status(200).json({ success: 'Update variantValue successfully', variantValue })
	} catch (error) {
		res.status(400).json({ error: errorHandler(error as MongoError) })
	}
}

export const removeValue: RequestHandler = async (req: Request, res: Response) => {
	try {
		const variantValue = await VariantValue.findOneAndUpdate(
			{ _id: (req as any).variantValue._id },
			{ $set: { isDeleted: true } },
			{ new: true }
		)
		if (!variantValue) {
			res.status(500).json({ error: 'Variant value not found' })
			return
		}
		res.status(200).json({ success: 'Remove variantValue successfully', variantValue })
	} catch (error) {
		res.status(400).json({ error: errorHandler(error as MongoError) })
	}
}

export const restoreValue: RequestHandler = async (req: Request, res: Response) => {
	try {
		const variantValue = await VariantValue.findOneAndUpdate(
			{ _id: (req as any).variantValue._id },
			{ $set: { isDeleted: false } },
			{ new: true }
		)
		if (!variantValue) {
			res.status(500).json({ error: 'Variant value not found' })
			return
		}
		res.status(200).json({ success: 'Restore variant Value successfully', variantValue })
	} catch (error) {
		res.status(400).json({ error: errorHandler(error as MongoError) })
	}
}

interface VariantRequest extends Request {
	variant?: any
}

export const removeAllValues: RequestHandler = async (req: Request, res: Response) => {
	try {
		await VariantValue.updateMany(
			{ variantId: (req as any).variant._id },
			{ $set: { isDeleted: true } }
		)
		res.status(200).json({ success: 'Remove variant & values successfully', variant: (req as any).variant })
	} catch (error) {
		res.status(400).json({ error: errorHandler(error as MongoError) })
	}
}

export const restoreAllValues: RequestHandler = async (req: Request, res: Response) => {
	try {
		await VariantValue.updateMany(
			{ variantId: (req as any).variant._id },
			{ $set: { isDeleted: false } }
		)
		res.status(200).json({ success: 'Restore variant & values successfully', variant: (req as any).variant })
	} catch (error) {
		res.status(400).json({ error: errorHandler(error as MongoError) })
	}
}

export const getActiveVariantValues: RequestHandler = async (req: Request, res: Response) => {
	try {
		const values = await VariantValue.find({
			variantId: (req as any).variant._id,
			isDeleted: false
		})
			.populate('variantId')
			.sort({ name: 1, _id: 1 })
		res.status(200).json({
			success: 'Load list values of variant successfully',
			variantValues: values,
			variant: (req as any).variant
		})
	} catch (error) {
		res.status(500).json({ error: 'Load list values of variant failed' })
	}
}

export const getVariantValues: RequestHandler = async (req: Request, res: Response) => {
	try {
		const values = await VariantValue.find({ variantId: (req as any).variant._id })
			.populate('variantId')
			.sort({ name: 1, _id: 1 })
		res.status(200).json({
			success: 'Load list values of variant successfully',
			variantValues: values,
			variant: (req as any).variant
		})
	} catch (error) {
		res.status(500).json({ error: 'Load list values of variant failed' })
	}
}
