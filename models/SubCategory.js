const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema;

const subSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: [2, "حداقل 2 کاراکتر داشته باشد"],
      maxlength: [32, "حداقل 32 کاراکتر داشته باشد"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    parent: {
      type: ObjectId,
      ref: "Category",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const SubCategory =
  mongoose.models.SubCategory || mongoose.model("SubCategory", subSchema);

export default SubCategory;
