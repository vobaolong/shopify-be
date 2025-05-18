import mongoose, { Document, Schema } from 'mongoose'
import slugify from 'slugify'

interface IStore extends Document {
  name: string
  slug: string
  address: string
  bio: string
  ownerId: mongoose.Types.ObjectId
  staffIds: mongoose.Types.ObjectId[]
  isActive: boolean
  isOpen: boolean
  avatar: string
  cover: string
  featured_images: string[]
  commissionId: mongoose.Types.ObjectId
  e_wallet: mongoose.Types.Decimal128
  point: number
  rating: number
}

const featured_imagesLimit = (val: string[]): boolean => val.length <= 6

const staffIdsLimit = (val: mongoose.Types.ObjectId[]): boolean =>
  val.length <= 6

const nameAvailable = (val: string): boolean => {
  const regex = [/buy[^a-z0-9]*now/i]
  return !regex.some((r) => r.test(val))
}

const storeSchema = new Schema<IStore>(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      maxLength: 300,
      validate: [nameAvailable, 'Store name is invalid']
    },
    slug: {
      type: String,
      unique: true
    },
    address: {
      type: String,
      trim: true,
      required: true
    },
    bio: {
      type: String,
      trim: true,
      required: true,
      maxLength: 3000
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    staffIds: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
      ],
      validate: [staffIdsLimit, 'The limit is 6 staff'],
      default: []
    },
    isActive: {
      type: Boolean,
      default: false
    },
    isOpen: {
      type: Boolean,
      default: false
    },
    avatar: {
      type: String,
      required: true
    },
    cover: {
      type: String,
      required: true
    },
    featured_images: {
      type: [String],
      validate: [featured_imagesLimit, 'The limit is 6 images'],
      default: []
    },
    commissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Commission',
      required: true
    },
    e_wallet: {
      type: mongoose.Schema.Types.Decimal128,
      min: 0,
      default: 0
    },
    point: {
      type: Number,
      default: 0
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

storeSchema.pre<IStore>('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true })
  }
  next()
})

const Store = mongoose.model<IStore>('Store', storeSchema)

export default Store
export type { IStore }
