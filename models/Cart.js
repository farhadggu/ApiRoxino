const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema;

const cartSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: ObjectId,
          ref: "Product",
        },
        name: {
          type: String,
        },
        image: {
          type: String,
        },
        size: {
          type: String
        },
        // style: {
        //   style: String,
        //   color: String,
        //   image: String
        // },
        qty: {
          type: Number,
        },
        color: {
          color: String,
          image: String
        },
        price: Number
      },
    ],
    cartTotal: Number,
    totalAfterDiscount: Number,
    user: {
      type: ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Cart", cartSchema)
