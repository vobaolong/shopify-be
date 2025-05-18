import mongoose, { Schema, Document } from 'mongoose'
import { ReturnStatus } from '../enums/index.enum'

interface IReturn extends Document {
  orderId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  reason: string
  status: ReturnStatus
  createdAt?: Date
  updatedAt?: Date
}

const returnSchema = new Schema<IReturn>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      required: true,
      maxLength: 100
    },
    status: {
      type: String,
      default: ReturnStatus.PENDING,
      enum: [ReturnStatus.PENDING, ReturnStatus.APPROVED, ReturnStatus.REJECTED]
    }
  },
  { timestamps: true }
)

const Return = mongoose.model<IReturn>('Return', returnSchema)

export default Return
export type { IReturn }
