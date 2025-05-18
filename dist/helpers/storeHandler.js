"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanStore = void 0;
const cleanStore = (store) => {
    if (!store)
        return undefined;
    const cleanedStore = { ...store };
    cleanedStore.ownerId = undefined;
    cleanedStore.staffIds = undefined;
    cleanedStore.e_wallet = undefined;
    cleanedStore.total_revenue = undefined;
    return cleanedStore;
};
exports.cleanStore = cleanStore;
