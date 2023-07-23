const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const reviewSchema = new mongoose.Schema(
  {
    reviewBy: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      requied: true,
      default: 0,
    },
    review: {
      type: String,
      required: true,
    },
    size: {
      type: String,
    },
    style: {
      color: String,
      image: String,
    },
    fit: {
      type: String,
    },
    images: [],
    likes: [],
  },
  {
    timestamps: true,
  }
);

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
    },
    slug: {
      type: String,
      required: true,
    },
    category: {
      type: ObjectId,
      required: true,
      ref: "Category",
    },
    subCategories: [
      {
        type: ObjectId,
        ref: "SubCategory",
      },
    ],
    details: [
      {
        name: String,
        value: String,
      },
    ],
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    subProducts: [
      {
        sku: String,
        images: [],
        description_images: [],
        color: {
          color: {
            type: String,
          },
          image: {
            type: String,
          },
        },
        sizes: [
          {
            size: String,
            qty: Number,
            price: Number,
          },
        ],
        discount: {
          type: Number,
          default: 0,
        },
        sold: {
          type: Number,
          default: 0,
        },
      },
    ],
    sliderBool: {
      type: Boolean,
      required: true,
      default: false,
    },
    sliderImage: [],
  },
  {
    timestamp: true,
  }
);

module.exports = mongoose.model("Product", productSchema)
