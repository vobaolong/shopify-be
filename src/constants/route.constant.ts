export const ROUTES = {
  // Auth routes
  AUTH: {
    BASE: '/auth',
    SIGNUP: '/auth/signup',
    SIGNIN: '/auth/signin',
    SOCIAL: '/auth/social',
    SIGNOUT: '/auth/signout',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    CHANGE_PASSWORD: '/auth/change-password/:forgot-password-code',
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    CHECK_EMAIL: '/auth/check-email'
  },

  // User routes
  USER: {
    BASE: '/user',
    GET_USER: '/user/:userId',
    PROFILE: '/user/profile/:userId',
    PROFILE_UPDATE: '/user/profile/:userId',
    PASSWORD_UPDATE: '/user/password/:userId',
    LIST_USERS: '/users',
    LIST_USERS_ADMIN: '/admin/users',
    ADDRESS_ADD: '/user/address/:userId',
    ADDRESS_UPDATE: '/user/address/:userId',
    ADDRESS_DELETE: '/user/address/:userId',
    AVATAR_UPDATE: '/user/avatar/:userId',
    COVER_UPDATE: '/user/cover/:userId'
  },

  // Product routes
  PRODUCT: {
    BASE: '/product',
    GET_PRODUCT: '/product/:productId',
    PRODUCT_FOR_MANAGER: '/store/:storeId/manager/:userId/product/:productId',

    PRODUCTS_ACTIVE: '/products/active',
    PRODUCTS_BY_STORE: '/store/:storeId/products/active',
    PRODUCTS_BY_STORE_FOR_MANAGER: '/store/:storeId/manager/:userId/products',
    PRODUCTS_FOR_ADMIN: '/admin/products',

    CREATE: '/store/:storeId/user/:userId/product',
    UPDATE: '/store/:storeId/user/:userId/product/:productId',
    // Selling status
    SELLING: '/store/:storeId/user/:userId/product/:productId/selling',
    ACTIVE: '/admin/active-product/:productId',
    // Image routes
    IMAGES_ADD: '/store/:storeId/user/:userId/product/:productId/images',
    IMAGES_UPDATE: '/store/:storeId/user/:userId/product/:productId/images',
    IMAGES_REMOVE: '/store/:storeId/user/:userId/product/:productId/images'
  },
  // User Favorite Product routes
  USER_FAVORITE_PRODUCT: {
    FAVORITE_COUNT: '/product/favorite-count/:productId',
    FAVORITE_PRODUCT: '/favorite/product/:productId/:userId',
    UNFAVORITE_PRODUCT: '/unfavorite/product/:productId/:userId',
    LIST_FAVORITE_PRODUCTS: '/favorite/products/:userId',
    CHECK_FAVORITE_PRODUCT: '/check/favorite/products/:productId/:userId'
  },
  // Address routes
  ADDRESS: {
    BASE: '/address',
    GET_ADDRESS: '/address/:address',
    GET_PROVINCES: '/provinces'
  },

  // Brand routes
  BRAND: {
    GET_BY_ID: '/brand/:brandId',
    ACTIVE: '/brands/active',
    LIST: '/admin/brands',
    LIST_FOR_ADMIN: '/admin/brands',
    CREATE: '/admin/brand',
    UPDATE: '/admin/brand/:brandId',
    DELETE: '/admin/brand/:brandId',
    RESTORE: '/admin/brand/:brandId/restore',
    CHECK_NAME: '/admin/brand/check-name'
  },
  // Cart routes
  CART: {
    COUNT: '/user/:userId/cart/count',
    LIST: '/user/:userId/cart',
    ITEMS: '/user/:userId/cart/:cartId/items',
    ADD: '/user/:userId/cart',
    UPDATE: '/user/:userId/cart/item/:cartItemId',
    REMOVE: '/user/:userId/cart/item/:cartItemId'
  },
  // Category routes
  CATEGORY: {
    BASE: '/category',
    GET_BY_ID: '/category/:categoryId',
    LIST_BY_ADMIN: '/admin/categories',
    LIST_BY_STORE: '/store/:storeId/categories',
    ACTIVE: '/categories/active',
    CREATE: '/category/create',
    UPDATE: '/category/:categoryId',
    DELETE: '/category/:categoryId',
    RESTORE: '/category/:categoryId/restore'
  },
  // Commission routes
  COMMISSION: {
    BASE: '/commission',
    LIST: '/admin/commissions',
    CREATE: '/commission',
    UPDATE: '/commission/:commissionId',
    DELETE: '/commission/:commissionId',
    RESTORE: '/commission/:commissionId/restore',
    ACTIVE_LIST: '/commission/active'
  }, // Notification routes
  NOTIFICATION: {
    BASE: '/notification',
    GET: '/notification/:userId',
    UPDATE_READ: '/notification/:userId/read',
    DELETE: '/notification/:userId',

    SEND: {
      BAN_STORE: '/notification/send/ban-store/:userId/:storeId',
      CREATE_STORE: '/notification/send/create-store/:userId/:storeId',
      ACTIVE_STORE: '/notification/send/active-store/:userId/:storeId',
      BAN_PRODUCT: '/notification/send/ban-product/:userId',
      ACTIVE_PRODUCT: '/notification/send/active-product/:userId',
      DELIVERY_SUCCESS: '/notification/send/delivery-success/:userId',
      REPORT_STORE: '/notification/send/report-store/:userId/:storeId',
      REPORT_PRODUCT: '/notification/send/report-product/:userId'
    }
  },
  // Order routes
  ORDER: {
    BASE: '/order',
    COUNT: '/order/count',

    USER: {
      LIST: '/order/user/:userId',
      DETAIL: '/order/user/:orderId/:userId',
      ITEMS: '/order/user/:userId/:orderId/items',
      UPDATE: '/order/user/:userId/:orderId/update'
    },

    STORE: {
      LIST: '/store/:storeId/orders',
      DETAIL: '/store/:storeId/orders/:orderId',
      ITEMS: '/store/:storeId/orders/:orderId/items',
      UPDATE: '/store/:storeId/orders/:orderId/update'
    },

    ADMIN: {
      LIST: '/admin/orders',
      DETAIL: '/admin/order/:orderId',
      ITEMS: '/admin/order/:orderId/items'
    },

    RETURN: {
      REQUEST: '/order/return/request/:userId/:orderId',
      BY_STORE: '/order/return/store/:storeId/:userId',
      APPROVE: '/order/return/approve/:storeId/:userId/:orderId'
    },

    CREATE: '/order/create/:cartId/:userId'
  },
  // Report routes
  REPORT: {
    BASE: '/report',
    LIST: '/admin/reports',
    CREATE: '/report',
    DELETE: '/admin/report/:id'
  },
  // Review routes
  REVIEW: {
    BASE: '/review',
    LIST: '/reviews',
    CHECK: '/review-check/:userId',
    CREATE: '/review/:userId',
    UPDATE: '/review/:reviewId/:userId',
    DELETE: '/review/:reviewId/:userId',
    ADMIN_DELETE: '/admin/review/:reviewId'
  },
  // Store routes
  STORE: {
    BASE: '/store',
    GET_STORE: '/store/:storeId',
    PROFILE: '/store/profile/:storeId/:userId',
    LIST_STORES: '/stores',
    STORES_BY_USER: '/user/stores/:userId',
    STORES_FOR_ADMIN: '/admin/stores',
    CREATE: '/store-create/:userId',
    UPDATE: '/store/:storeId/:userId',
    ACTIVE: '/admin/store-active/:storeId',
    COMMISSION: '/store/commission/:storeId',
    COMMISSION_UPDATE: '/store/commission-update/:storeId/:userId',
    OPEN: '/store/open/:storeId/:userId',
    AVATAR: '/store/avatar/:storeId/:userId',
    COVER: '/store/cover/:storeId/:userId',
    FEATURED_IMAGES: '/store/featured-images/:storeId',
    ADD_FEATURED_IMAGE: '/store/featured-image/:storeId/:userId',
    UPDATE_FEATURED_IMAGE: '/store/featured-image/:storeId/:userId',
    DELETE_FEATURED_IMAGE: '/store/featured-image/:storeId/:userId',
    STAFF: '/store/staff/:storeId/:userId',
    ADD_STAFF: '/store/staff/:storeId/:userId',
    REMOVE_STAFF: '/store/staff-remove/:storeId/:userId',
    CANCEL_STAFF: '/store/staff-cancel/:storeId/:userId'
  },
  // Store Level routes
  STORE_LEVEL: {
    BASE: '/store-level',
    GET_LEVEL: '/store/level/:storeId',
    ACTIVE_LEVELS: '/store/levels-active',
    LEVELS: '/admin/store-levels',
    CREATE: '/admin/store-level',
    UPDATE: '/admin/store-level/:storeLevelId',
    DELETE: '/admin/store-level/:storeLevelId',
    RESTORE: '/admin/store-level/restore/:storeLevelId'
  },
  // User Level routes
  USER_LEVEL: {
    BASE: '/user-level',
    GET_LEVEL: '/user/level/:userId',
    ACTIVE_LEVELS: '/user-levels/active',
    LEVELS: '/admin/user-levels',
    CREATE: '/admin/user-level',
    UPDATE: '/admin/user-level/:userLevelId',
    DELETE: '/admin/user-level/:userLevelId',
    RESTORE: '/admin/user-level/restore/:userLevelId'
  },
  // Transaction routes
  TRANSACTION: {
    BASE: '/transaction',
    BY_USER: '/user/transactions/:userId',
    BY_STORE: '/store/transactions/:storeId/:userId',
    BY_ADMIN: '/admin/transactions',
    CREATE_BY_USER: '/user/transaction/:userId',
    CREATE_BY_STORE: '/store/transaction/:storeId/:userId'
  },
  // Upload routes
  UPLOAD: {
    BASE: '/upload',
    IMAGE: '/upload/image',
    MULTIPLE: '/upload/multiple',
    BASE64: '/upload/base64',
    DELETE: '/upload/:publicId',
    DELETE_MULTIPLE: '/upload/multiple'
  },
  // User Follow Store routes
  USER_FOLLOW_STORE: {
    BASE: '/follow',
    FOLLOWER_COUNT: '/store/follower-count/:storeId',
    FOLLOW_STORE: '/follow/store/:storeId/:userId',
    UNFOLLOW_STORE: '/unfollow/store/:storeId/:userId',
    FOLLOWING_STORES: '/following/stores/:userId',
    CHECK_FOLLOWING_STORE: '/check/following/stores/:storeId/:userId'
  },

  // Variant routes
  VARIANT: {
    BASE: '/variant',
    BY_ID: '/variant-by-id/:variantId/:userId',
    ACTIVE: '/variants-active',
    LIST: '/variants/:userId',
    CREATE: '/variant-create/:userId',
    UPDATE: '/variant-update/:variantId/:userId',
    DELETE: '/variant-delete/:variantId/:userId',
    RESTORE: '/variant-restore/:variantId/:userId'
  },
  // Variant Value routes
  VARIANT_VALUE: {
    BASE: '/variants/:variantId/values',

    ACTIVE: '/variants/:variantId/values/active',
    LIST: '/variants/:variantId/user/:userId/values',

    CREATE: '/users/:userId/variant-values',
    UPDATE: '/users/:userId/variant-values/:variantValueId',
    DELETE: '/users/:userId/variant-values/:variantValueId',
    RESTORE: '/users/:userId/variant-values/:variantValueId/restore'
  }
}
