import mongoose, { Document, Schema } from 'mongoose'

interface IAddress extends Document {
  provinceID: string
  provinceName?: string
  districtID: string
  districtName?: string
  wardID: string
  wardName?: string
  address: string
  createdAt?: Date
  updatedAt?: Date
}

const addressSchema: Schema<IAddress> = new Schema(
  {
    provinceID: {
      type: String,
      required: true
    },
    provinceName: {
      type: String
    },
    districtID: {
      type: String,
      required: true
    },
    districtName: {
      type: String
    },
    wardID: {
      type: String,
      required: true
    },
    wardName: {
      type: String
    },
    address: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

const Address = mongoose.model<IAddress>('Address', addressSchema)

export default Address
export type { IAddress }
