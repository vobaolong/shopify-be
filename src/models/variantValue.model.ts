import mongoose, { Schema, Document } from 'mongoose'

interface IVariantValue extends Document {
  name: string
  variantId: mongoose.Types.ObjectId
  isDeleted: boolean
  createdAt?: Date
  updatedAt?: Date
}

const variantValueSchema = new Schema<IVariantValue>(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxLength: 32
    },
    variantId: {
      type: Schema.Types.ObjectId,
      ref: 'Variant',
      required: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

variantValueSchema.index({ name: 1, variantId: 1 }, { unique: true })

const VariantValue = mongoose.model<IVariantValue>(
  'VariantValue',
  variantValueSchema
)

export default VariantValue
export type { IVariantValue }
