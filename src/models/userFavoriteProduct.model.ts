import mongoose, { Schema, Document } from 'mongoose'

interface IUserFavoriteProduct extends Document {
  userId: mongoose.Types.ObjectId
  productId: mongoose.Types.ObjectId
  isDeleted: boolean
  createdAt?: Date
  updatedAt?: Date
}

const userFavoriteProductSchema = new Schema<IUserFavoriteProduct>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product'
    },
    isDeleted: {
      type: Boolean
    }
  },
  { timestamps: true }
)

userFavoriteProductSchema.index({ userId: 1, productId: 1 }, { unique: true })

const UserFavoriteProduct = mongoose.model<IUserFavoriteProduct>(
  'UserFavoriteProduct',
  userFavoriteProductSchema
)
export default UserFavoriteProduct
export type { IUserFavoriteProduct }
