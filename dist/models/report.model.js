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
const reportSchema = new mongoose_1.Schema({
    objectId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        refPath: 'onModel'
    },
    isStore: {
        type: Boolean,
        required: true
    },
    isProduct: {
        type: Boolean,
        required: true
    },
    isReview: {
        type: Boolean,
        default: false
    },
    reason: {
        type: String,
        required: true,
        maxLength: 100
    },
    reportBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    onModel: {
        type: String,
        required: true,
        enum: [index_enum_1.ModelReport.STORE, index_enum_1.ModelReport.PRODUCT, index_enum_1.ModelReport.REVIEW]
    }
}, { timestamps: true });
const Report = mongoose_1.default.model('Report', reportSchema);
exports.default = Report;
