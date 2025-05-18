import mongoose, { Schema, Document } from 'mongoose'

interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId
  storeId: mongoose.Types.ObjectId
  isUp: boolean
  code: string
  amount: mongoose.Types.Decimal128
  account: string
  createdAt?: Date
  updatedAt?: Date
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store'
    },
    isUp: {
      type: Boolean,
      required: true
    },
    code: {
      type: String
    },
    amount: {
      type: Schema.Types.Decimal128,
      required: true,
      min: 0
    },
    account: {
      type: String
    }
  },
  { timestamps: true }
)

const Transaction = mongoose.model<ITransaction>(
  'Transaction',
  transactionSchema
)

export default Transaction
export type { ITransaction }
