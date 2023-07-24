const Category = require("../models/Category");
const { validationResult } = require("express-validator");
const slugify = require("slugify");

const getAllCategory = async (req, res) => {
  try {
    if (req.query.pn && req.query.pgn) {
      const paginate = req.query.pgn;
      const pageNumber = req.query.pn;
      const GoalUsers = await Category.find()
        .sort({ _id: -1 })
        .skip((pageNumber - 1) * paginate)
        .limit(paginate)
        .select({ username: 1, email: 1 })
        .sort({ updatedAt: -1 }).lean();
      const AllUserNum = await Category.find().length;
      res.status(200).json({ data: GoalUsers, AllUserNum });
    } else {
      const GoalUsers = await Category.find().sort({ updatedAt: -1 }).lean();
      const AllUserNum = await Category.find().length;
      res.status(200).json({ data: GoalUsers, AllUserNum });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};
module.exports.getAllCategory = getAllCategory;

const createCategory = async (req, res) => {
  try {
    const { name, slug, icon } = req.body;
    const test = await Category.findOne({ name });
    if (test) {
      return res
        .status(400)
        .json({ message: "این دسته بندی موجود می باشد نام دیگری انتخاب کنید" });
    }
    await new Category({ name, icon, slug: slugify(slug) }).save();
    const categories = await Category.find({}).sort({ updatedAt: -1 }).lean();
    res.json({
      message: `دسته بندی ${icon} با موفقیت ایجاد شد`,
      categories,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
module.exports.createCategory = createCategory;

const updateCategory = async (req, res) => {
  try {
    const { id, name, icon } = req.body;
    await Category.findByIdAndUpdate(id, { name, icon });
    const categories = await Category.find({}).sort({ updatedAt: -1 }).lean();
    res.json({
      message: "دسته بندی با موفقیت به روز رسانی شد",
      categories,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
module.exports.updateCategory = updateCategory;

const deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;
    await Category.findByIdAndRemove(id);
    const categories = await Category.find({}).sort({ updatedAt: -1 }).lean();
    res.json({
      message: "دسته بندی با موفقیت حذف شد",
      categories,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
module.exports.deleteCategory = deleteCategory;
