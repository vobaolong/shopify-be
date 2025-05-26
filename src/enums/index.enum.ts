export enum OrderStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
  RETURNED = 'Returned'
}

export enum ReturnStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export enum ModelReport {
  STORE = 'Store',
  PRODUCT = 'Product',
  REVIEW = 'Review'
}

export enum Role {
  USER = 'user',
  ADMIN = 'admin'
}
