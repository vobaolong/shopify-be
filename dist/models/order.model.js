"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const index_enum_1 = require("../enums/index.enum");
const orderSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    commissionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Commission',
        required: true
    },
    status: {
        type: String,
        default: index_enum_1.OrderStatus.NOT_PROCESSED,
        enum: [
            index_enum_1.OrderStatus.NOT_PROCESSED,
            index_enum_1.OrderStatus.PROCESSING,
            index_enum_1.OrderStatus.SHIPPED,
            index_enum_1.OrderStatus.DELIVERED,
            index_enum_1.OrderStatus.CANCELLED,
            index_enum_1.OrderStatus.RETURNED
        ]
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    shippingFee: {
        type: mongoose_1.Schema.Types.Decimal128,
        required: true
    },
    amountFromUser: {
        type: mongoose_1.Schema.Types.Decimal128,
        required: true,
        min: 0
    },
    amountFromStore: {
        type: mongoose_1.Schema.Types.Decimal128,
        required: true,
        min: 0
    },
    amountToStore: {
        type: mongoose_1.Schema.Types.Decimal128,
        required: true,
        min: 0
    },
    amountToPlatform: {
        type: mongoose_1.Schema.Types.Decimal128,
        required: true,
        min: 0
    },
    isPaidBefore: {
        type: Boolean,
        default: false
    },
    returnRequests: {
        type: Object,
        required: false
    }
}, { timestamps: true });
const OrderModel = mongoose_1.default.model('Order', orderSchema);
exports.default = OrderModel;
