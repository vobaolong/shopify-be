// Re-export all store controllers from modular structure
// Basic CRUD operations
export {
  getStoreById,
  getStore,
  getStoreProfile,
  createStore,
  updateStore,
  activeStore,
  getCommission,
  updateCommission,
  openStore
} from './store/store.basic.controller'

// Staff management
export {
  getStaffs,
  addStaff,
  cancelStaff,
  removeStaff
} from './store/store.staff.controller'

// Media operations
export {
  updateAvatar,
  updateCover,
  getListFeatureImages,
  addFeatureImage,
  updateFeatureImage,
  removeFeaturedImage
} from './store/store.media.controller'

// Listing and search operations
export {
  getStoreCommissions,
  getStores,
  getStoresByUser,
  getStoresForAdmin
} from './store/store.listing.controller'

// Types and utilities
export type {
  StoreRequest,
  AddressDetailType,
  StoreFilterType
} from './store/store.types'

export { safeCleanUser, buildStoreFilterArgs } from './store/store.types'
