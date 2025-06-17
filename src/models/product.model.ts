import mongoose, { Schema, Document } from 'mongoose'
import slugify from 'slugify'

interface IProduct extends Document {
  name: string
  slug: string
  description: string
  price: mongoose.Types.Decimal128
  salePrice: mongoose.Types.Decimal128
  quantity: number
  sold: number
  isActive: boolean
  isSelling: boolean
  listImages: string[]
  categoryId: mongoose.Types.ObjectId
  brandId?: mongoose.Types.ObjectId
  variantValueIds: mongoose.Types.ObjectId[]
  storeId: mongoose.Types.ObjectId
  rating: number
  createdAt: Date
  updatedAt: Date
}

function listImagesLimit(val: string[]): boolean {
  return val.length > 0 && val.length <= 7
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      maxLength: 120
    },
    slug: {
      type: String,
      unique: true
    },
    description: {
      type: String,
      trim: true,
      required: true,
      maxLength: 3000
    },
    price: {
      type: mongoose.Types.Decimal128,
      required: true,
      min: 0
    },
    salePrice: {
      type: mongoose.Types.Decimal128,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    sold: {
      type: Number,
      required: true,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isSelling: {
      type: Boolean,
      default: true
    },
    listImages: {
      type: [String],
      validate: [listImagesLimit, 'Limit is 7 images'],
      default: []
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: 'Brand'
    },
    variantValueIds: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'VariantValue'
        }
      ],
      default: []
    },
    storeId: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: 'Store'
    },
    rating: {
      type: Number,
      default: 4,
      min: 0,
      max: 5
    }
  },
  { timestamps: true }
)

productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true })
  }
  next()
})

const ProductModel = mongoose.model<IProduct>('Product', productSchema)

export default ProductModel
export type { IProduct }
