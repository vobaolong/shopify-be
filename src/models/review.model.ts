import mongoose, { Schema, Document } from 'mongoose'

interface IReview extends Document {
	userId: mongoose.Types.ObjectId
	storeId: mongoose.Types.ObjectId
	orderId: mongoose.Types.ObjectId
	productId: mongoose.Types.ObjectId
	content: string
	rating: number
	createdAt?: Date
	updatedAt?: Date
}

const reviewSchema = new Schema<IReview>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		productId: {
			type: Schema.Types.ObjectId,
			ref: 'Product',
			required: true
		},
		storeId: {
			type: Schema.Types.ObjectId,
			ref: 'Store',
			required: true
		},
		orderId: {
			type: Schema.Types.ObjectId,
			ref: 'Order',
			required: true
		},
		content: {
			type: String,
			trim: true,
			maxLength: 1000
		},
		rating: {
			type: Number,
			default: 4,
			min: 0,
			max: 5
		}
	},
	{ timestamps: true }
)

reviewSchema.index({ userId: 1, productId: 1, orderId: 1 }, { unique: true })
const Review = mongoose.model<IReview>('Review', reviewSchema)

export default Review
export type { IReview }
