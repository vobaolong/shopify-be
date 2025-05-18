import mongoose, { Schema, Document } from 'mongoose'

interface ICart extends Document {
  _id: mongoose.Types.ObjectId | string
  userId: mongoose.Types.ObjectId
  storeId: mongoose.Types.ObjectId
  isDeleted: boolean
  createdAt?: Date
  updatedAt?: Date
}

const cartSchema: Schema<ICart> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store'
    },
    isDeleted: {
      type: Boolean
    }
  },
  { timestamps: true }
)

cartSchema.index({ userId: 1, storeId: 1 }, { unique: true })

const Cart = mongoose.model<ICart>('Cart', cartSchema)

export default Cart
export type { ICart }
