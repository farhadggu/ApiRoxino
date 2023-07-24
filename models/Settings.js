const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: "Please enter your website name.",
  },
  logo: {
    type: String,
    required: "Please choose logo for your website.",
  },
  adBanner: {
    type: String,
  },
  aboutUs: {
    type: String,
    required: "Please enter your about us text"
  },
  phoneNumber: {
    type: String,
    required: "Please enter your contact number"
  },
  phoneNumber2: {
    type: String
  },
  email: {
    type: String,
    required: "Please enter website email address.",
  }
});

module.exports = mongoose.model("Settings", settingSchema)