import mongoose, { Document, Schema } from 'mongoose'

interface ICartItem extends Document {
  cartId: mongoose.Types.ObjectId
  productId: mongoose.Types.ObjectId
  variantValueIds: mongoose.Types.ObjectId[]
  count: number
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

const cartItemSchema: Schema<ICartItem> = new Schema(
  {
    cartId: {
      type: Schema.Types.ObjectId,
      ref: 'Cart',
      required: true
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    variantValueIds: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'VariantValue'
        }
      ],
      default: []
    },
    count: {
      type: Number,
      min: 1,
      default: 1,
      required: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

const CartItem = mongoose.model<ICartItem>('CartItem', cartItemSchema)

export default CartItem
export type { ICartItem }
