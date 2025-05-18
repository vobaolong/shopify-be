import mongoose, { Schema, Document } from 'mongoose'

interface IUserLevel extends Document {
  name: string
  minPoint: number
  discount: mongoose.Types.Decimal128
  color: string
  isDeleted: boolean
  createdAt?: Date
  updatedAt?: Date
}
const userLevelSchema = new Schema<IUserLevel>(
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
      unique: true,
      min: 0
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

const StoreLevel = mongoose.model<IUserLevel>('UserLevel', userLevelSchema)

export default StoreLevel
export type { IUserLevel }
