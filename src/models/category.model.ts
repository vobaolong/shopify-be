import mongoose, { Schema, Document } from 'mongoose'

import slugify from 'slugify'

interface ICategory extends Document {
  name: string
  slug: string
  image: string
  categoryId: mongoose.Types.ObjectId
  isDeleted: boolean
  createdAt?: Date
  updatedAt?: Date
}

const categorySchema: Schema<ICategory> = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxLength: 50
    },
    slug: {
      type: String,
      unique: true
    },
    image: {
      type: String,
      trim: true,
      default: '/uploads/default.webp'
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

categorySchema.index({ name: 1, categoryId: 1 }, { unique: true })

categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true })
  }
  next()
})

const Category = mongoose.model<ICategory>('Category', categorySchema)
export default Category
export type { ICategory }
