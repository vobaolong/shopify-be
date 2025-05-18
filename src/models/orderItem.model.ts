import mongoose, { Document, Schema } from 'mongoose'

interface IOrderItem extends Document {
  orderId: mongoose.Types.ObjectId
  productId: mongoose.Types.ObjectId
  variantValueIds: mongoose.Types.ObjectId[]
  count: number
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

const orderItemSchema: Schema<IOrderItem> = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order'
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product'
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
      required: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

const OrderItemModel = mongoose.model<IOrderItem>('OrderItem', orderItemSchema)

export default OrderItemModel
export type { IOrderItem }
