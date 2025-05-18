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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const slugify_1 = __importDefault(require("slugify"));
function listImagesLimit(val) {
    return val.length > 0 && val.length <= 7;
}
const productSchema = new mongoose_1.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        maxLength: 120
    },
    slug: {
        type: String,
        unique: true
    },
    description: {
        type: String,
        trim: true,
        required: true,
        maxLength: 3000
    },
    price: {
        type: mongoose_1.default.Types.Decimal128,
        required: true,
        min: 0
    },
    salePrice: {
        type: mongoose_1.default.Types.Decimal128,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    sold: {
        type: Number,
        required: true,
        default: 0
    },
    isActive: {
        type: Boolean,
        required: true
    },
    isSelling: {
        type: Boolean,
        default: true
    },
    listImages: {
        type: [String],
        validate: [listImagesLimit, 'Limit is 7 images'],
        default: []
    },
    categoryId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    brandId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Brand'
    },
    variantValueIds: {
        type: [
            {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'VariantValue'
            }
        ],
        default: []
    },
    storeId: {
        required: true,
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Store'
    },
    rating: {
        type: Number,
        default: 4,
        min: 0,
        max: 5
    }
}, { timestamps: true });
productSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = (0, slugify_1.default)(this.name, { lower: true, strict: true });
    }
    next();
});
const ProductModel = mongoose_1.default.model('Product', productSchema);
exports.default = ProductModel;
