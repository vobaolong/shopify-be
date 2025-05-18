import mongoose, { Schema, Document } from 'mongoose'

interface ICommission extends Document {
  name: string
  fee: mongoose.Types.Decimal128
  description: string
  isDeleted: boolean
  createdAt?: Date
  updatedAt?: Date
}

const commissionSchema: Schema<ICommission> = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      maxLength: 32
    },
    fee: {
      type: Schema.Types.Decimal128,
      required: true,
      min: 0
    },
    description: {
      type: String,
      trim: true,
      required: true,
      maxLength: 3000
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  { timestamps: true }
)

const Commission = mongoose.model<ICommission>('Commission', commissionSchema)
export default Commission
export type { ICommission }
