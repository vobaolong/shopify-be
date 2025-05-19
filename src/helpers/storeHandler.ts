import mongoose from 'mongoose'

interface IStore {
  ownerId?: mongoose.Types.ObjectId
  staffIds?: mongoose.Types.ObjectId[]
  e_wallet?: mongoose.Types.Decimal128
  total_revenue?: number
  [key: string]: any
}

export const cleanStore = (
  store: IStore | null | undefined
): IStore | undefined => {
  if (!store) return undefined
  const cleanedStore: IStore = { ...store }
  cleanedStore.ownerId = undefined
  cleanedStore.staffIds = undefined
  cleanedStore.e_wallet = undefined
  cleanedStore.total_revenue = undefined
  return cleanedStore
}
