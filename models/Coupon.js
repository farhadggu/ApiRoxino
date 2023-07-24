const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  coupon: {
    type: String,
    trim: true,
    unique: true,
    uppercase: true,
    required: true,
    minLength: 4,
    maxLength: 10
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  discount: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model("Coupon", couponSchema)
