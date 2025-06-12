import mongoose, { Schema, Document } from 'mongoose'

interface IWishlist extends Document {
  userId: mongoose.Types.ObjectId
  productId: mongoose.Types.ObjectId
  isDeleted: boolean
  createdAt?: Date
  updatedAt?: Date
}

const wishlistSchema = new Schema<IWishlist>(
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

wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true })

const Wishlist = mongoose.model<IWishlist>('Wishlist', wishlistSchema)
export default Wishlist
export type { IWishlist }
