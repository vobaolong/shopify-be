import mongoose, { Document, Schema, Model } from 'mongoose'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import slugify from 'slugify'

interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  userName: string
  name: string
  slug: string
  email?: string
  phone?: string
  isEmailActive: boolean
  email_code?: string
  isPhoneActive: boolean
  id_card?: string
  salt?: string
  hashed_password?: string
  forgot_password_code?: string
  role: 'user' | 'admin'
  addresses: string[]
  avatar: string
  cover: string
  e_wallet: mongoose.Types.Decimal128
  point: number
  googleId?: string
  gender?: 'male' | 'female'
  dateOfBirth?: Date
  createdAt?: Date
  updatedAt?: Date
  password?: string
  _password?: string

  encryptPassword(password: string, salt?: string): string
  authenticate(plaintext: string): boolean
}

const userSchema: Schema<IUser> = new Schema(
  {
    userName: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      immutable: true,
      maxLength: 32
    },
    name: {
      type: String,
      trim: true,
      required: true,
      maxLength: 32,
      validate: [nameAvailable, 'Name is invalid']
    },
    slug: {
      type: String,
      unique: true
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    isEmailActive: {
      type: Boolean,
      default: false
    },
    email_code: {
      type: String
    },
    isPhoneActive: {
      type: Boolean,
      default: false
    },
    id_card: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    salt: String,
    hashed_password: {
      type: String
    },
    forgot_password_code: {
      type: String
    },
    role: {
      type: String,
      default: 'user',
      enum: ['user', 'admin']
    },
    addresses: {
      type: [
        {
          type: String,
          trim: true,
          maxLength: 200,
          validate: [addressesLimit, 'The limit is 10 addresses']
        }
      ],
      default: []
    },
    avatar: {
      type: String,
      default: '/uploads/default.webp'
    },
    cover: {
      type: String,
      default: '/uploads/default.webp'
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
    googleId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      default: 'male'
    },
    dateOfBirth: {
      type: Date
    }
  },
  { timestamps: true }
)

// Tạo slug trước khi lưu
userSchema.pre('save', function (next) {
  if (this.isModified('userName')) {
    this.slug = slugify(`${this.userName}`, {
      lower: true,
      strict: true
    })
  }
  next()
})

// Virtual: password
userSchema
  .virtual('password')
  .set(function (this: IUser, password: string) {
    this._password = password
    this.salt = uuidv4()
    this.hashed_password = this.encryptPassword(password)
  })
  .get(function (this: IUser) {
    return this._password
  })

// Methods
userSchema.methods.encryptPassword = function (
  this: IUser,
  password: string,
  salt = this.salt
): string {
  if (!password) return ''
  try {
    return crypto.createHmac('sha1', salt!).update(password).digest('hex')
  } catch (err) {
    return ''
  }
}

userSchema.methods.authenticate = function (plaintext: string): boolean {
  return this.encryptPassword(plaintext) === this.hashed_password
}

function addressesLimit(val: string[]) {
  return val.length <= 10
}

function nameAvailable(val: string) {
  const regex = [/buy[^\w]*now/i]
  return !regex.some((r) => r.test(val))
}

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema)
export default User
export type { IUser }
