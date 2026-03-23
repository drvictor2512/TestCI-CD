const mongoose = require("mongoose");

const attributesSchema = new mongoose.Schema(
    {
        color: { type: [String], default: [] },
        material: { type: String, default: null },
        minWeight: { type: Number, default: null },
    },
    { _id: false }
);

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        discountPrice: {
            type: Number
        },
        stock: {
            type: Number,
            required: true
        },
        images: {
            type: [String],
            default: [],
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        sellerId: {
            type: String,
            required: true,
            index: true,
        },
        sellerName: {
            type: String,
            required: true,
        },
        attributes: {
            type: attributesSchema,
            default: () => ({}),
        },
        ratingAverage: {
            type: Number,
            default: 0,
        },
        ratingCount: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        }
    },
    {
        timestamps: true,
    }
);

// Index
productSchema.index({ sellerId: 1, createdAt: -1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ name: "text", description: "text" });


module.exports = mongoose.model("Product", productSchema);
