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
const crypto_1 = __importDefault(require("crypto"));
const uuid_1 = require("uuid");
const slugify_1 = __importDefault(require("slugify"));
const userSchema = new mongoose_1.Schema({
    firstName: {
        type: String,
        trim: true,
        required: true,
        maxLength: 32,
        validate: [nameAvailable, 'Name is invalid']
    },
    lastName: {
        type: String,
        trim: true,
        required: true,
        maxLength: 32,
        validate: [nameAvailable, 'Name is invalid']
    },
    slug: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        sparse: true
    },
    phone: {
        type: String,
        trim: true,
        unique: true,
        sparse: true
    },
    isEmailActive: {
        type: Boolean,
        default: false
    },
    email_code: {
        type: String
    },
    isPhoneActive: {
        type: Boolean,
        default: false
    },
    id_card: {
        type: String,
        trim: true,
        unique: true,
        sparse: true
    },
    salt: String,
    hashed_password: {
        type: String
    },
    forgot_password_code: {
        type: String
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'admin']
    },
    addresses: {
        type: [
            {
                type: String,
                trim: true,
                maxLength: 200,
                validate: [addressesLimit, 'The limit is 10 addresses']
            }
        ],
        default: []
    },
    avatar: {
        type: String,
        default: '/uploads/default.webp'
    },
    cover: {
        type: String,
        default: '/uploads/default.webp'
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
    googleId: {
        type: String,
        trim: true,
        unique: true,
        sparse: true
    }
}, { timestamps: true });
// Tạo slug trước khi lưu
userSchema.pre('save', function (next) {
    if (this.isModified('firstName') || this.isModified('lastName')) {
        this.slug = (0, slugify_1.default)(`${this.firstName} ${this.lastName}`, {
            lower: true,
            strict: true
        });
    }
    next();
});
// Virtual: password
userSchema
    .virtual('password')
    .set(function (password) {
    this.password = password;
    this.salt = (0, uuid_1.v4)();
    this.hashed_password = this.encryptPassword(password);
})
    .get(function () {
    return this.password;
});
// Methods
userSchema.methods.encryptPassword = function (password, salt = this.salt) {
    if (!password)
        return '';
    try {
        return crypto_1.default.createHmac('sha1', salt).update(password).digest('hex');
    }
    catch (err) {
        return '';
    }
};
userSchema.methods.authenticate = function (plaintext) {
    return this.encryptPassword(plaintext) === this.hashed_password;
};
function addressesLimit(val) {
    return val.length <= 10;
}
function nameAvailable(val) {
    const regex = [/buy[^\w]*now/i];
    return !regex.some((r) => r.test(val));
}
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
