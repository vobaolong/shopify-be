"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const store_route_1 = __importDefault(require("./routes/store.route"));
const userLevel_route_1 = __importDefault(require("./routes/userLevel.route"));
const storeLevel_route_1 = __importDefault(require("./routes/storeLevel.route"));
const commission_route_1 = __importDefault(require("./routes/commission.route"));
const userFollowStore_route_1 = __importDefault(require("./routes/userFollowStore.route"));
const userFavoriteProduct_route_1 = __importDefault(require("./routes/userFavoriteProduct.route"));
const category_route_1 = __importDefault(require("./routes/category.route"));
const variant_route_1 = __importDefault(require("./routes/variant.route"));
const brand_route_1 = __importDefault(require("./routes/brand.route"));
const variantValue_route_1 = __importDefault(require("./routes/variantValue.route"));
const product_route_1 = __importDefault(require("./routes/product.route"));
const cart_route_1 = __importDefault(require("./routes/cart.route"));
const order_route_1 = __importDefault(require("./routes/order.route"));
const transaction_route_1 = __importDefault(require("./routes/transaction.route"));
const review_route_1 = __importDefault(require("./routes/review.route"));
const address_route_1 = __importDefault(require("./routes/address.route"));
const report_route_1 = __importDefault(require("./routes/report.route"));
const notification_route_1 = __importDefault(require("./routes/notification.route"));
const upload_route_1 = __importDefault(require("./routes/upload.route"));
const socketServer_1 = require("./socketServer");
// Initialize environment variables
dotenv_1.default.config();
// Handle __dirname for CommonJS
const __dirname = path_1.default.resolve();
// Create Express app
const app = (0, express_1.default)();
mongoose_1.default
    .connect(process.env.DATABASE || '')
    .then(() => {
    console.log('✅ DB connected successfully');
})
    .catch((error) => {
    console.error('⚠️ Error connecting to database:', error);
    process.exit(1);
});
// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific handling logic here
});
// Morgan logging in development mode
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
// Static files middleware
app.use('/static', express_1.default.static(path_1.default.join(__dirname, 'public'), {
    maxAge: '1d', // Cache static assets for 1 day
    immutable: true
}));
// Rate limiting middleware
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { error: 'Too many requests, please try again later.' }
});
// Apply rate limiter to API routes
app.use('/api', apiLimiter);
// JSON and cookie parsers
app.use(express_1.default.json({ limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
// CORS configuration for Node.js 22
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    maxAge: 86400 // Cache preflight requests for 24 hours
}));
// Extended URL-encoded data parsing
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Router middleware
app.use('/api', auth_route_1.default);
app.use('/api', user_route_1.default);
app.use('/api', store_route_1.default);
app.use('/api', userLevel_route_1.default);
app.use('/api', storeLevel_route_1.default);
app.use('/api', commission_route_1.default);
app.use('/api', userFollowStore_route_1.default);
app.use('/api', userFavoriteProduct_route_1.default);
app.use('/api', category_route_1.default);
app.use('/api', variant_route_1.default);
app.use('/api', brand_route_1.default);
app.use('/api', variantValue_route_1.default);
app.use('/api', product_route_1.default);
app.use('/api', cart_route_1.default);
app.use('/api', order_route_1.default);
app.use('/api', transaction_route_1.default);
app.use('/api', review_route_1.default);
app.use('/api', address_route_1.default);
app.use('/api', report_route_1.default);
app.use('/api', notification_route_1.default);
app.use('/api', upload_route_1.default);
// Root route for health check
app.get('/', (req, res) => {
    res.json({
        message: 'API is running',
        version: '1.0',
        nodeVersion: process.version
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Error handler middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message
    });
});
// Create HTTP server
const server = http_1.default.createServer(app);
// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`✅ Node.js version: ${process.version}`);
});
// Initialize Socket.IO server
(0, socketServer_1.initSocketServer)(server);
