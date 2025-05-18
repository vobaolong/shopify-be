# Shopify Backend API

## Introduction

Welcome to the Shopify Backend API, a robust backend solution for a Shopify-like e-commerce platform. This API offers a wide range of endpoints to efficiently manage users, products, stores, orders, and more.

## Features

- **Authentication**: User registration, login, social login, password management, and email verification
- **User Management**: Profile management, address management, avatar/cover image updates
- **Product Management**: Create, update, and manage products with images
- **Store Management**: Create and manage stores
- **Order Processing**: Complete order lifecycle management
- **Cart Functionality**: Add, update, and remove items from cart
- **Favorites**: Allow users to favorite products
- **Categories & Brands**: Organize products by categories and brands
- **Notifications**: System for sending notifications to users

## API Routes

### Authentication

- User signup, signin, and signout
- Social authentication
- Token refresh
- Password management (forgot/change)
- Email verification

### User Management

- User profile operations
- Address management
- Avatar and cover image updates

### Products

- Create, read, update products
- Manage product images
- Control product visibility and selling status

### Orders

- Create and manage orders
- Order status tracking

### Additional Features

- Cart management
- Favorites system
- Category and brand management
- Commission handling
- Notification system

## Getting Started

To get started with the Shopify Backend API, follow these steps:

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment variables**: Create a `.env` file in the root directory with the following variables:

   ```env
   DATABASE='your_mongodb_connection_string'
   NODE_ENV="development"
   ADMIN_ID='your_admin_id'
   ACCESS_TOKEN_SECRET="your_access_token_secret"
   REFRESH_TOKEN_SECRET="your_refresh_token_secret"
   JWT_FORGOT_PASSWORD_SECRET='your_jwt_forgot_password_secret'
   ADMIN_EMAIL_PASSWORD='your_email_password'
   JWT_EMAIL_CONFIRM_SECRET="your_email_confirm_secret"
   PORT=5000
   VNP_HASH_SECRET='your_vnpayment_hash_secret'
   VNP_TMN_CODE='your_vnpayment_tmn_code'
   VNP_URL='your_vnpayment_url'
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

## Technologies

- Node.js
- Express
- MongoDB
- TypeScript

## License

This project is licensed under the MIT License.
