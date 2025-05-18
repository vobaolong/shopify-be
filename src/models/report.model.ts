import mongoose, { Schema, Document } from 'mongoose'
import { ModelReport } from '../enums/index.enum'

interface IReport extends Document {
  objectId: mongoose.Types.ObjectId
  isStore: boolean
  isProduct: boolean
  isReview?: boolean
  reason: string
  reportBy: mongoose.Types.ObjectId
  onModel: ModelReport
  createdAt?: Date
  updatedAt?: Date
}
const reportSchema = new Schema<IReport>(
  {
    objectId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'onModel'
    },
    isStore: {
      type: Boolean,
      required: true
    },
    isProduct: {
      type: Boolean,
      required: true
    },
    isReview: {
      type: Boolean,
      default: false
    },
    reason: {
      type: String,
      required: true,
      maxLength: 100
    },
    reportBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    onModel: {
      type: String,
      required: true,
      enum: [ModelReport.STORE, ModelReport.PRODUCT, ModelReport.REVIEW]
    }
  },
  { timestamps: true }
)

const Report = mongoose.model<IReport>('Report', reportSchema)
export default Report
export type { IReport }
