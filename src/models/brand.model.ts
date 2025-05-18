import mongoose, { Schema, Document } from 'mongoose'

interface IBrand extends Document {
  name: string
  categoryIds: mongoose.Types.ObjectId[]
  isDeleted: boolean
  createdAt?: Date
  updatedAt?: Date
}

const brandSchema: Schema<IBrand> = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxLength: 32
    },
    categoryIds: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Category'
        }
      ],
      default: [],
      required: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

const Brand = mongoose.model<IBrand>('Brand', brandSchema)

export default Brand
export type { IBrand }
