import mongoose, { Schema, Document } from 'mongoose'

interface StoreLevel extends Document {
  name: string
  minPoint: number
  discount: mongoose.Types.Decimal128
  color: string
  isDeleted: boolean
  createdAt?: Date
  updatedAt?: Date
}

const storeLevelSchema = new Schema<StoreLevel>(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      maxLength: 8
    },
    minPoint: {
      type: Number,
      required: true,
      unique: true
    },
    discount: {
      type: Schema.Types.Decimal128,
      required: true,
      min: 0
    },
    color: {
      type: String,
      trim: true,
      required: true,
      maxLength: 8
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  { timestamps: true }
)

const StoreLevel = mongoose.model<StoreLevel>('StoreLevel', storeLevelSchema)

export default StoreLevel
export type { StoreLevel }
