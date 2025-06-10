import mongoose, { Schema, Document } from 'mongoose'

interface IVariant extends Document {
  name: string
  categoryIds: mongoose.Types.ObjectId[]
  isDeleted: boolean
  createdAt?: Date
  updatedAt?: Date
}
const variantSchema: Schema<IVariant> = new Schema(
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

const Variant = mongoose.model<IVariant>('Variant', variantSchema)

export default Variant
export type { IVariant }
