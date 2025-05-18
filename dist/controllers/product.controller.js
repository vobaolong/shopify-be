"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductsForAdmin = exports.getStoreProductsForSeller = exports.getProductsByStore = exports.getProducts = exports.getProductCategoriesByStore = exports.getProductCategories = exports.removeFromListImages = exports.updateListImages = exports.addToListImages = exports.sellingProduct = exports.activeProduct = exports.activeAllProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.getProductForSeller = exports.getProductById = void 0;
const product_model_1 = __importDefault(require("../models/product.model"));
const category_model_1 = __importDefault(require("../models/category.model"));
const errorHandler_1 = require("../helpers/errorHandler");
const fs_1 = __importDefault(require("fs"));
const getProductById = (req, res, next, id) => {
    product_model_1.default.findById(id)
        .exec()
        .then((product) => {
        if (!product) {
            return res.status(404).json({
                error: 'Sản phẩm không tồn tại'
            });
        }
        req.product = product;
        next();
    })
        .catch(() => {
        return res.status(404).json({
            error: 'Sản phẩm không tồn tại'
        });
    });
};
exports.getProductById = getProductById;
const getProductForSeller = (req, res) => {
    var _a, _b;
    product_model_1.default.findOne({ _id: (_a = req.product) === null || _a === void 0 ? void 0 : _a._id, storeId: (_b = req.store) === null || _b === void 0 ? void 0 : _b._id })
        .populate({
        path: 'categoryId',
        populate: {
            path: 'categoryId',
            populate: { path: 'categoryId' }
        }
    })
        .populate({
        path: 'variantValueIds',
        populate: { path: 'variantId' }
    })
        .populate('storeId', '_id name avatar isActive isOpen')
        .populate('brandId', '_id name')
        .exec()
        .then((product) => {
        if (!product) {
            return res.status(500).json({
                error: 'Sản phẩm không tồn tại'
            });
        }
        return res.status(200).json({
            success: 'Get product successfully',
            product
        });
    })
        .catch(() => {
        return res.status(500).json({
            error: 'Sản phẩm không tồn tại'
        });
    });
};
exports.getProductForSeller = getProductForSeller;
const getProduct = (req, res) => {
    var _a, _b, _c;
    if (!((_a = req.product) === null || _a === void 0 ? void 0 : _a.isActive)) {
        res.status(404).json({
            error: 'Sản phẩm đang tạm thời bị khoá'
        });
    }
    else if (!((_b = req.product) === null || _b === void 0 ? void 0 : _b.isSelling)) {
        res.status(404).json({
            error: 'Sản phẩm đang tạm thời bị ẩn'
        });
    }
    product_model_1.default.findOne({
        _id: (_c = req.product) === null || _c === void 0 ? void 0 : _c._id,
        isSelling: true,
        isActive: true
    })
        .populate({
        path: 'categoryId',
        populate: {
            path: 'categoryId',
            populate: { path: 'categoryId' }
        }
    })
        .populate({
        path: 'variantValueIds',
        populate: { path: 'variantId' }
    })
        .populate('storeId', '_id name avatar isActive isOpen ownerId')
        .populate('brandId', '_id name')
        .exec()
        .then((product) => {
        if (!product) {
            res.status(500).json({
                error: 'Sản phẩm không tồn tại'
            });
        }
        res.status(200).json({
            success: 'Get product successfully',
            product
        });
    })
        .catch(() => {
        res.status(500).json({
            error: 'Sản phẩm không tồn tại'
        });
    });
};
exports.getProduct = getProduct;
const createProduct = (req, res) => {
    var _a, _b;
    const { name, description, price, salePrice, quantity, categoryId, brandId, variantValueIds } = req.fields || {};
    const listImages = req.filepaths || [];
    if (!name ||
        !description ||
        !price ||
        !salePrice ||
        !quantity ||
        !categoryId ||
        !listImages ||
        listImages.length <= 0) {
        try {
            listImages.forEach((image) => {
                fs_1.default.unlinkSync('public' + image);
            });
        }
        catch { }
        res.status(400).json({
            error: 'All fields are required'
        });
    }
    let variantValueIdsArray = variantValueIds ? variantValueIds.split('|') : [];
    const product = new product_model_1.default({
        name,
        description,
        price,
        salePrice,
        quantity,
        categoryId,
        brandId,
        variantValueIds: variantValueIdsArray,
        isActive: (_a = req.store) === null || _a === void 0 ? void 0 : _a.isActive,
        storeId: (_b = req.store) === null || _b === void 0 ? void 0 : _b._id,
        listImages
    });
    product
        .save()
        .then((product) => {
        res.status(200).json({
            success: 'Creating product successfully',
            product
        });
    })
        .catch((error) => {
        try {
            listImages.forEach((image) => {
                fs_1.default.unlinkSync('public' + image);
            });
        }
        catch { }
        res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    });
};
exports.createProduct = createProduct;
const updateProduct = (req, res) => {
    var _a;
    const { name, description, price, salePrice, quantity, brandId, categoryId, variantValueIds } = req.fields || {};
    if (!name ||
        !description ||
        !price ||
        !salePrice ||
        !quantity ||
        !categoryId) {
        res.status(400).json({
            error: 'All fields are required'
        });
    }
    let variantValueIdsArray = variantValueIds ? variantValueIds.split('|') : [];
    product_model_1.default.findOneAndUpdate({ _id: (_a = req.product) === null || _a === void 0 ? void 0 : _a._id }, {
        name,
        description,
        price,
        salePrice,
        quantity,
        brandId,
        categoryId,
        variantValueIds: variantValueIdsArray
    }, { new: true })
        .populate({
        path: 'categoryId',
        populate: {
            path: 'categoryId',
            populate: { path: 'categoryId' }
        }
    })
        .populate({
        path: 'variantValueIds',
        populate: { path: 'variantId' }
    })
        .populate('storeId', '_id name avatar isActive isOpen')
        .populate('brandId', '_id name')
        .exec()
        .then((product) => {
        if (!product)
            res.status(500).json({
                error: 'Sản phẩm không tồn tại'
            });
        res.status(200).json({
            success: 'Update product successfully',
            product
        });
    })
        .catch((error) => {
        res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    });
};
exports.updateProduct = updateProduct;
const activeAllProduct = (req, res) => {
    var _a;
    const { isActive } = req.body;
    product_model_1.default.updateMany({ storeId: (_a = req.store) === null || _a === void 0 ? void 0 : _a._id }, { $set: { isActive } }, { new: true })
        .exec()
        .then(() => {
        res.status(200).json({
            success: 'Active/InActive store & products successfully',
            store: req.store
        });
    })
        .catch((error) => {
        res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    });
};
exports.activeAllProduct = activeAllProduct;
const activeProduct = (req, res) => {
    var _a;
    const { isActive } = req.body;
    product_model_1.default.findOneAndUpdate({ _id: (_a = req.product) === null || _a === void 0 ? void 0 : _a._id }, { $set: { isActive } }, { new: true })
        .populate({
        path: 'categoryId',
        populate: {
            path: 'categoryId',
            populate: { path: 'categoryId' }
        }
    })
        .populate({
        path: 'variantValueIds',
        populate: { path: 'variantId' }
    })
        .populate('storeId', '_id name avatar isActive isOpen ownerId')
        .populate('brandId', '_id name')
        .exec()
        .then((product) => {
        if (!product) {
            res.status(500).json({
                error: 'Sản phẩm không tồn tại'
            });
        }
        res.status(200).json({
            success: 'Active/InActive product status successfully',
            product
        });
    })
        .catch((error) => {
        res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    });
};
exports.activeProduct = activeProduct;
const sellingProduct = (req, res) => {
    var _a;
    const { isSelling } = req.body;
    product_model_1.default.findOneAndUpdate({ _id: (_a = req.product) === null || _a === void 0 ? void 0 : _a._id }, { $set: { isSelling } }, { new: true })
        .populate({
        path: 'categoryId',
        populate: {
            path: 'categoryId',
            populate: { path: 'categoryId' }
        }
    })
        .populate({
        path: 'variantValueIds',
        populate: { path: 'variantId' }
    })
        .populate('storeId', '_id name avatar isActive isOpen')
        .populate('brandId', '_id')
        .exec()
        .then((product) => {
        if (!product) {
            res.status(404).json({
                error: 'Sản phẩm không tồn tại'
            });
        }
        res.status(200).json({
            success: 'Update product status successfully',
            product
        });
    })
        .catch((error) => {
        res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    });
};
exports.sellingProduct = sellingProduct;
const addToListImages = (req, res) => {
    var _a, _b;
    let listImages = ((_a = req.product) === null || _a === void 0 ? void 0 : _a.listImages) || [];
    const index = listImages.length;
    if (index >= 7) {
        try {
            if (req.filepaths && req.filepaths[0]) {
                fs_1.default.unlinkSync('public' + req.filepaths[0]);
            }
        }
        catch { }
        res.status(400).json({
            error: 'Limit is 7 images'
        });
    }
    product_model_1.default.findOneAndUpdate({ _id: (_b = req.product) === null || _b === void 0 ? void 0 : _b._id }, { $push: { listImages: req.filepaths ? req.filepaths[0] : '' } }, { new: true })
        .populate({
        path: 'categoryId',
        populate: {
            path: 'categoryId',
            populate: { path: 'categoryId' }
        }
    })
        .populate({
        path: 'variantValueIds',
        populate: { path: 'variantId' }
    })
        .populate('storeId', '_id name avatar isActive isOpen')
        .populate('brandId', '_id name')
        .exec()
        .then((product) => {
        if (!product) {
            try {
                if (req.filepaths && req.filepaths[0]) {
                    fs_1.default.unlinkSync('public' + req.filepaths[0]);
                }
            }
            catch { }
            res.status(500).json({
                error: 'Sản phẩm không tồn tại'
            });
        }
        res.status(200).json({
            success: 'Add to list image successfully',
            product
        });
    })
        .catch((error) => {
        try {
            if (req.filepaths && req.filepaths[0]) {
                fs_1.default.unlinkSync('public' + req.filepaths[0]);
            }
        }
        catch { }
        res.status(500).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    });
};
exports.addToListImages = addToListImages;
const updateListImages = (req, res) => {
    var _a, _b;
    const index = req.query.index ? parseInt(req.query.index) : -1;
    const image = req.filepaths ? req.filepaths[0] : undefined;
    if (index === -1 || !image)
        res.status(400).json({
            error: 'Update list image failed'
        });
    let listImages = ((_a = req.product) === null || _a === void 0 ? void 0 : _a.listImages) || [];
    if (index >= listImages.length) {
        try {
            fs_1.default.unlinkSync('public' + image);
        }
        catch { }
        res.status(404).json({
            error: 'Image not found'
        });
    }
    const oldpath = listImages[index];
    listImages[index] = image || '';
    product_model_1.default.findOneAndUpdate({ _id: (_b = req.product) === null || _b === void 0 ? void 0 : _b._id }, { $set: { listImages } }, { new: true })
        .populate({
        path: 'categoryId',
        populate: {
            path: 'categoryId',
            populate: { path: 'categoryId' }
        }
    })
        .populate({
        path: 'variantValueIds',
        populate: { path: 'variantId' }
    })
        .populate('storeId', '_id name avatar isActive isOpen')
        .populate('brandId', '_id name')
        .exec()
        .then((product) => {
        if (!product) {
            try {
                fs_1.default.unlinkSync('public' + image);
            }
            catch { }
            res.status(500).json({
                error: 'Sản phẩm không tồn tại'
            });
        }
        if (oldpath !== '/uploads/default.webp') {
            try {
                fs_1.default.unlinkSync('public' + oldpath);
            }
            catch { }
        }
        res.status(200).json({
            success: 'Update list images successfully',
            product
        });
    })
        .catch((error) => {
        try {
            fs_1.default.unlinkSync('public' + image);
        }
        catch { }
        res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    });
};
exports.updateListImages = updateListImages;
const removeFromListImages = (req, res) => {
    var _a, _b;
    const index = req.query.index ? parseInt(req.query.index) : -1;
    if (index === -1) {
        res.status(400).json({
            error: 'Remove from list images failed'
        });
    }
    let listImages = ((_a = req.product) === null || _a === void 0 ? void 0 : _a.listImages) || [];
    if (index >= listImages.length) {
        res.status(404).json({
            error: 'Images not found'
        });
    }
    if (listImages.length <= 1) {
        res.status(400).json({
            error: 'listImages must not be null'
        });
    }
    try {
        fs_1.default.unlinkSync('public' + listImages[index]);
    }
    catch { }
    //update db
    listImages.splice(index, 1);
    product_model_1.default.findOneAndUpdate({ _id: (_b = req.product) === null || _b === void 0 ? void 0 : _b._id }, { $set: { listImages } }, { new: true })
        .populate({
        path: 'categoryId',
        populate: {
            path: 'categoryId',
            populate: { path: 'categoryId' }
        }
    })
        .populate({
        path: 'variantValueIds',
        populate: { path: 'variantId' }
    })
        .populate('storeId', '_id name avatar isActive isOpen')
        .populate('brandId', '_id name')
        .exec()
        .then((product) => {
        if (!product) {
            res.status(500).json({
                error: 'Sản phẩm không tồn tại'
            });
        }
        res.status(200).json({
            success: 'Remove from list images successfully',
            product
        });
    })
        .catch((error) => {
        res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    });
};
exports.removeFromListImages = removeFromListImages;
const getProductCategories = (req, res, next) => {
    product_model_1.default.distinct('categoryId', { isActive: true, isSelling: true })
        .exec()
        .then((categories) => {
        const categoryId = req.query.categoryId;
        if (categoryId) {
            const filterCategories = categories.filter((category) => category.equals(categoryId));
            if (filterCategories.length > 0) {
                req.loadedCategories = filterCategories;
                next();
            }
            else {
                category_model_1.default.find({ _id: { $in: categories } })
                    .populate({
                    path: 'categoryId',
                    populate: { path: 'categoryId' }
                })
                    .exec()
                    .then((newCategories) => {
                    const filterCategories = newCategories
                        .filter((category) => (category.categoryId &&
                        category.categoryId._id == categoryId) ||
                        (category.categoryId &&
                            category.categoryId.categoryId &&
                            category.categoryId.categoryId._id == categoryId))
                        .map((category) => category._id);
                    req.loadedCategories = filterCategories;
                    next();
                })
                    .catch(() => {
                    req.loadedCategories = [];
                    next();
                });
            }
        }
        else {
            req.loadedCategories = categories;
            next();
        }
    })
        .catch((error) => {
        res.status(400).json({
            error: 'Category not found'
        });
    });
};
exports.getProductCategories = getProductCategories;
const getProductCategoriesByStore = (req, res, next) => {
    var _a;
    product_model_1.default.distinct('categoryId', {
        storeId: (_a = req.store) === null || _a === void 0 ? void 0 : _a._id,
        isActive: true,
        isSelling: true
    })
        .exec()
        .then((categories) => {
        req.loadedCategories = categories;
        next();
    })
        .catch(() => {
        res.status(400).json({
            error: 'Categories not found'
        });
    });
};
exports.getProductCategoriesByStore = getProductCategoriesByStore;
const getProducts = (req, res) => {
    const search = req.query.search ? req.query.search : '';
    const sortBy = req.query.sortBy ? req.query.sortBy : '_id';
    const order = req.query.order && (req.query.order === 'asc' || req.query.order === 'desc')
        ? req.query.order
        : 'asc';
    const limit = req.query.limit && parseInt(req.query.limit) > 0
        ? parseInt(req.query.limit)
        : 6;
    const page = req.query.page && parseInt(req.query.page) > 0
        ? parseInt(req.query.page)
        : 1;
    let skip = limit * (page - 1);
    const categoryId = req.loadedCategories || [];
    const rating = req.query.rating &&
        parseInt(req.query.rating) > 0 &&
        parseInt(req.query.rating) < 6
        ? parseInt(req.query.rating)
        : -1;
    const minPrice = req.query.minPrice && parseInt(req.query.minPrice) > 0
        ? parseInt(req.query.minPrice)
        : -1;
    const maxPrice = req.query.maxPrice && parseInt(req.query.maxPrice) > 0
        ? parseInt(req.query.maxPrice)
        : -1;
    const provinces = req.query.provinces;
    const filter = {
        search,
        sortBy,
        order,
        categoryId,
        limit,
        pageCurrent: page,
        rating: rating !== -1 ? rating : 'all',
        minPrice: minPrice !== -1 ? minPrice : 0,
        maxPrice: maxPrice !== -1 ? maxPrice : 'infinite'
    };
    const filterArgs = {
        $or: [
            {
                name: {
                    $regex: search,
                    $options: 'i'
                }
            }
        ],
        categoryId: { $in: categoryId },
        isActive: true,
        isSelling: true,
        salePrice: { $gte: 0 },
        rating: { $gte: 0 }
    };
    if (rating !== -1)
        filterArgs.rating.$gte = rating;
    if (minPrice !== -1)
        filterArgs.salePrice.$gte = minPrice;
    if (maxPrice !== -1)
        filterArgs.salePrice.$lte = maxPrice;
    // Use a more robust approach with a separate Promise chain
    product_model_1.default.countDocuments(filterArgs)
        .exec()
        .then((count) => {
        const size = count;
        const pageCount = Math.ceil(size / limit);
        filter.pageCount = pageCount;
        if (page > pageCount) {
            skip = Math.max(0, (pageCount - 1) * limit);
        }
        if (count <= 0) {
            res.status(200).json({
                success: 'Load list products successfully',
                filter,
                size,
                products: []
            });
        }
        product_model_1.default.find(filterArgs)
            .sort({ [sortBy]: order, _id: 1 })
            .skip(skip)
            .limit(limit)
            .populate({
            path: 'categoryId',
            populate: {
                path: 'categoryId',
                populate: { path: 'categoryId' }
            }
        })
            .populate({
            path: 'variantValueIds',
            populate: { path: 'variantId' }
        })
            .populate('storeId', '_id name avatar isActive isOpen address')
            .populate('brandId', '_id name')
            .exec()
            .then((products) => {
            if (!products || products.length === 0) {
                res.status(200).json({
                    success: 'Load list products successfully',
                    filter,
                    size: 0,
                    products: []
                });
            }
            if (provinces) {
                const newProducts = products.filter((pr) => {
                    for (let i = 0; i < provinces.length; i++) {
                        if (pr.storeId.address.includes(provinces[i]))
                            true;
                    }
                    return false;
                });
                const size1 = newProducts.length;
                const pageCount1 = Math.ceil(size1 / limit);
                filter.pageCount = pageCount1;
                res.status(200).json({
                    success: 'Load list products successfully',
                    filter,
                    size,
                    products: newProducts
                });
            }
            res.status(200).json({
                success: 'Load list products successfully',
                filter,
                size,
                products
            });
        })
            .catch((error) => {
            console.error('Error loading products:', error);
            res.status(500).json({
                error: 'Load list products failed'
            });
        });
    })
        .catch((error) => {
        console.error('Error counting products:', error);
        res.status(500).json({
            error: 'Count products failed'
        });
    });
};
exports.getProducts = getProducts;
const getProductsByStore = (req, res) => {
    const search = req.query.search ? req.query.search : '';
    const sortBy = req.query.sortBy ? req.query.sortBy : '_id';
    const order = req.query.order && (req.query.order === 'asc' || req.query.order === 'desc')
        ? req.query.order
        : 'asc';
    const limit = req.query.limit && parseInt(req.query.limit) > 0
        ? parseInt(req.query.limit)
        : 6;
    const page = req.query.page && parseInt(req.query.page) > 0
        ? parseInt(req.query.page)
        : 1;
    let skip = limit * (page - 1);
    const categoryId = req.query.categoryId
        ? [req.query.categoryId]
        : req.loadedCategories;
    const brandId = req.query.brandId
        ? [req.query.brandId]
        : req.loadedBrands;
    const rating = req.query.rating &&
        parseInt(req.query.rating) > 0 &&
        parseInt(req.query.rating) < 6
        ? parseInt(req.query.rating)
        : -1;
    const minPrice = req.query.minPrice && parseInt(req.query.minPrice) > 0
        ? parseInt(req.query.minPrice)
        : -1;
    const maxPrice = req.query.maxPrice && parseInt(req.query.maxPrice) > 0
        ? parseInt(req.query.maxPrice)
        : -1;
    const quantity = req.query.quantity === '0' ? 0 : -1;
    const filter = {
        search,
        sortBy,
        order,
        categoryId,
        brandId,
        limit,
        pageCurrent: page,
        rating: rating !== -1 ? rating : 'all',
        minPrice: minPrice !== -1 ? minPrice : 0,
        maxPrice: maxPrice !== -1 ? maxPrice : 'infinite',
        storeId: req.store._id,
        quantity: quantity !== -1 ? quantity : 'all'
    };
    const filterArgs = {
        $or: [
            {
                name: {
                    $regex: search,
                    $options: 'i'
                }
            }
        ],
        categoryId: { $in: categoryId },
        brandId: { $in: brandId },
        isSelling: true,
        isActive: true,
        storeId: req.store._id,
        salePrice: { $gte: 0 },
        rating: { $gte: 0 }
    };
    if (rating !== -1)
        filterArgs.rating.$gte = rating;
    if (minPrice !== -1)
        filterArgs.salePrice.$gte = minPrice;
    if (maxPrice !== -1)
        filterArgs.salePrice.$lte = maxPrice;
    product_model_1.default.countDocuments(filterArgs)
        .exec()
        .then((count) => {
        const size = count;
        const pageCount = Math.ceil(size / limit);
        filter.pageCount = pageCount;
        if (page > pageCount) {
            skip = Math.max(0, (pageCount - 1) * limit);
        }
        if (count <= 0) {
            res.status(200).json({
                success: 'Load list products successfully',
                filter,
                size,
                products: []
            });
        }
        // Use a separate Promise chain for better type handling
        product_model_1.default.find(filterArgs)
            .sort({ [sortBy]: order, _id: 1 })
            .skip(skip)
            .limit(limit)
            .populate({
            path: 'categoryId',
            populate: {
                path: 'categoryId',
                populate: { path: 'categoryId' }
            }
        })
            .populate({
            path: 'variantValueIds',
            populate: { path: 'variantId' }
        })
            .populate('storeId', '_id name avatar isActive isOpen')
            .populate('brandId', '_id name')
            .exec()
            .then((products) => {
            if (!products || products.length === 0) {
                res.status(200).json({
                    success: 'Load list products successfully',
                    filter,
                    size: 0,
                    products: []
                });
            }
            res.status(200).json({
                success: 'Load list products successfully',
                filter,
                size,
                products
            });
        })
            .catch((error) => {
            console.error('Error fetching products:', error);
            res.status(500).json({
                error: 'Load list products failed'
            });
        });
        return;
    })
        .catch((error) => {
        res.status(500).json({
            error: 'Count products failed'
        });
    });
};
exports.getProductsByStore = getProductsByStore;
const getStoreProductsForSeller = (req, res) => {
    const search = req.query.search ? req.query.search : '';
    const sortBy = req.query.sortBy ? req.query.sortBy : '_id';
    const order = req.query.order && (req.query.order === 'asc' || req.query.order === 'desc')
        ? req.query.order
        : 'asc';
    const limit = req.query.limit && parseInt(req.query.limit) > 0
        ? parseInt(req.query.limit)
        : 6;
    const page = req.query.page && parseInt(req.query.page) > 0
        ? parseInt(req.query.page)
        : 1;
    let skip = limit * (page - 1);
    let isSelling = [true, false];
    if (req.query.isSelling === 'true')
        isSelling = [true];
    if (req.query.isSelling === 'false')
        isSelling = [false];
    let isActive = [true, false];
    if (req.query.isActive === 'true')
        isActive = [true];
    if (req.query.isActive === 'false')
        isActive = [false];
    const quantity = req.query.quantity === '0' ? 0 : -1;
    const filter = {
        search,
        sortBy,
        order,
        isSelling,
        isActive,
        limit,
        pageCurrent: page,
        storeId: req.store._id,
        quantity: quantity !== -1 ? quantity : 'all'
    };
    const filterArgs = {
        $or: [
            {
                name: {
                    $regex: search,
                    $options: 'i'
                }
            }
        ],
        isSelling: { $in: isSelling },
        isActive: { $in: isActive },
        storeId: req.store._id
    };
    if (quantity === 0)
        filterArgs.quantity = quantity;
    product_model_1.default.countDocuments(filterArgs)
        .exec()
        .then((count) => {
        const size = count;
        const pageCount = Math.ceil(size / limit);
        filter.pageCount = pageCount;
        if (page > pageCount) {
            skip = Math.max(0, (pageCount - 1) * limit);
        }
        if (count <= 0) {
            res.status(200).json({
                success: 'Load list products successfully',
                filter,
                size,
                products: []
            });
        }
        // Use a separate Promise chain for better type handling
        product_model_1.default.find(filterArgs)
            .sort({ [sortBy]: order, _id: 1 })
            .skip(skip)
            .limit(limit)
            .populate({
            path: 'categoryId',
            populate: {
                path: 'categoryId',
                populate: { path: 'categoryId' }
            }
        })
            .populate({
            path: 'variantValueIds',
            populate: { path: 'variantId' }
        })
            .populate('storeId', '_id name avatar isActive isOpen')
            .populate('brandId', '_id name')
            .exec()
            .then((products) => {
            if (!products || products.length === 0) {
                res.status(200).json({
                    success: 'Load list products successfully',
                    filter,
                    size: 0,
                    products: []
                });
            }
            res.status(200).json({
                success: 'Load list products successfully',
                filter,
                size,
                products
            });
        })
            .catch((error) => {
            res.status(500).json({
                error: 'Load list products failed'
            });
        });
        return;
        // End outer promise chain
    })
        .catch((error) => {
        res.status(500).json({
            error: 'Count products failed'
        });
    });
};
exports.getStoreProductsForSeller = getStoreProductsForSeller;
const getProductsForAdmin = (req, res) => {
    const search = req.query.search ? req.query.search : '';
    const sortBy = req.query.sortBy ? req.query.sortBy : '_id';
    const order = req.query.order && (req.query.order === 'asc' || req.query.order === 'desc')
        ? req.query.order
        : 'asc';
    const limit = req.query.limit && parseInt(req.query.limit) > 0
        ? parseInt(req.query.limit)
        : 6;
    const page = req.query.page && parseInt(req.query.page) > 0
        ? parseInt(req.query.page)
        : 1;
    let skip = limit * (page - 1);
    let isActive = [true, false];
    if (req.query.isActive === 'true')
        isActive = [true];
    if (req.query.isActive === 'false')
        isActive = [false];
    const filter = {
        search,
        sortBy,
        order,
        isActive,
        limit,
        pageCurrent: page
    };
    const filterArgs = {
        name: { $regex: search, $options: 'i' },
        isActive: { $in: isActive }
    };
    product_model_1.default.countDocuments(filterArgs)
        .exec()
        .then((count) => {
        const size = count;
        const pageCount = Math.ceil(size / limit);
        filter.pageCount = pageCount;
        if (page > pageCount) {
            skip = Math.max(0, (pageCount - 1) * limit);
        }
        if (count <= 0) {
            res.status(200).json({
                success: 'Load list products successfully',
                filter,
                size,
                products: []
            });
        }
        // Use a separate Promise chain for better type handling
        product_model_1.default.find(filterArgs)
            .sort({ [sortBy]: order, _id: 1 })
            .skip(skip)
            .limit(limit)
            .populate({
            path: 'categoryId',
            populate: {
                path: 'categoryId',
                populate: { path: 'categoryId' }
            }
        })
            .populate({
            path: 'variantValueIds',
            populate: { path: 'variantId' }
        })
            .populate('storeId', '_id name avatar isActive isOpen ownerId')
            .populate('brandId', '_id name')
            .exec()
            .then((products) => {
            if (!products || products.length === 0) {
                res.status(200).json({
                    success: 'Load list products successfully',
                    filter,
                    size: 0,
                    products: []
                });
            }
            res.status(200).json({
                success: 'Load list products successfully',
                filter,
                size,
                products
            });
        })
            .catch((error) => {
            console.error('Error fetching products:', error);
            res.status(500).json({
                error: 'Load list products failed'
            });
        });
        return;
    })
        .catch((error) => {
        res.status(404).json({
            error: 'Products not found'
        });
    });
};
exports.getProductsForAdmin = getProductsForAdmin;
