import mongoose, { Schema, Document } from 'mongoose'
import { OrderStatus } from '../enums/index.enum'

interface IOrder extends Document {
  userId: mongoose.Types.ObjectId
  storeId: mongoose.Types.ObjectId
  commissionId: mongoose.Types.ObjectId
  status: OrderStatus
  address: string
  phone: string
  userName: string
  name: string
  shippingFee: mongoose.Types.Decimal128
  amountFromUser: mongoose.Types.Decimal128
  amountFromStore: mongoose.Types.Decimal128
  amountToStore: mongoose.Types.Decimal128
  amountToPlatform: mongoose.Types.Decimal128
  isPaidBefore: boolean
  returnRequests?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

const orderSchema: Schema<IOrder> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true
    },
    commissionId: {
      type: Schema.Types.ObjectId,
      ref: 'Commission',
      required: true
    },
    status: {
      type: String,
      default: OrderStatus.PENDING,
      enum: [
        OrderStatus.PENDING,
        OrderStatus.PROCESSING,
        OrderStatus.SHIPPED,
        OrderStatus.DELIVERED,
        OrderStatus.CANCELLED,
        OrderStatus.RETURNED
      ]
    },
    address: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    shippingFee: {
      type: Schema.Types.Decimal128,
      required: true
    },
    amountFromUser: {
      type: Schema.Types.Decimal128,
      required: true,
      min: 0
    },
    amountFromStore: {
      type: Schema.Types.Decimal128,
      required: true,
      min: 0
    },
    amountToStore: {
      type: Schema.Types.Decimal128,
      required: true,
      min: 0
    },
    amountToPlatform: {
      type: Schema.Types.Decimal128,
      required: true,
      min: 0
    },
    isPaidBefore: {
      type: Boolean,
      default: false
    },
    returnRequests: {
      type: Object,
      required: false
    }
  },
  { timestamps: true }
)

const OrderModel = mongoose.model<IOrder>('Order', orderSchema)

export default OrderModel
export type { IOrder }
