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
const featured_imagesLimit = (val) => val.length <= 6;
const staffIdsLimit = (val) => val.length <= 6;
const nameAvailable = (val) => {
    const regex = [/buy[^a-z0-9]*now/i];
    return !regex.some((r) => r.test(val));
};
const storeSchema = new mongoose_1.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        maxLength: 300,
        validate: [nameAvailable, 'Store name is invalid']
    },
    slug: {
        type: String,
        unique: true
    },
    address: {
        type: String,
        trim: true,
        required: true
    },
    bio: {
        type: String,
        trim: true,
        required: true,
        maxLength: 3000
    },
    ownerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    staffIds: {
        type: [
            {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        validate: [staffIdsLimit, 'The limit is 6 staff'],
        default: []
    },
    isActive: {
        type: Boolean,
        default: false
    },
    isOpen: {
        type: Boolean,
        default: false
    },
    avatar: {
        type: String,
        required: true
    },
    cover: {
        type: String,
        required: true
    },
    featured_images: {
        type: [String],
        validate: [featured_imagesLimit, 'The limit is 6 images'],
        default: []
    },
    commissionId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Commission',
        required: true
    },
    e_wallet: {
        type: mongoose_1.default.Schema.Types.Decimal128,
        min: 0,
        default: 0
    },
    point: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 4,
        min: 0,
        max: 5
    }
}, { timestamps: true });
storeSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = (0, slugify_1.default)(this.name, { lower: true, strict: true });
    }
    next();
});
const Store = mongoose_1.default.model('Store', storeSchema);
exports.default = Store;
