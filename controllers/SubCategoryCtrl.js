const SubCategory = require("../models/SubCategory");
const Category = require("../models/Category");
const slugify = require("slugify");

const getAllSubCategory = async (req, res) => {
  try {
    if (req.query.pn && req.query.pgn) {
      const paginate = req.query.pgn;
      const pageNumber = req.query.pn;
      const GoalUsers = await SubCategory.find()
        .sort({ _id: -1 })
        .skip((pageNumber - 1) * paginate)
        .limit(paginate)
        .select({ username: 1, email: 1 })
        .sort({ updatedAt: -1 })
        .lean();
      const AllUserNum = await SubCategory.find().length;
      res.status(200).json({ data: GoalUsers, AllUserNum });
    } else {
      const GoalUsers = await SubCategory.find().sort({ updatedAt: -1 }).lean();
      const AllUserNum = await SubCategory.find().length;
      res.status(200).json({ data: GoalUsers, AllUserNum });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};
module.exports.getAllSubCategory = getAllSubCategory;

const createSubCategory = async (req, res) => {
  try {
    const { name, slug, parent } = req.body;
    console.log(name, slug, parent);
    const test = await SubCategory.findOne({ name });
    if (test) {
      return res.status(400).json({
        message: "این دسته بندی والد موجود می باشد نام دیگری انتخاب کنید",
      });
    }
    await new SubCategory({ name, slug: slugify(slug), parent }).save();
    const subCategories = await SubCategory.find({})
      .populate({ path: "parent", model: Category })
      .sort({ updatedAt: -1 })
      .lean();
    res.json({
      message: `دسته بندی والد ${name} با موفقیت ایجاد شد`,
      subCategories,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
module.exports.createSubCategory = createSubCategory;

const updateCategoryController = async (req, res) => {
  try {
    const { id, name, parent, slug } = req.body;
    await SubCategory.findByIdAndUpdate(id, { name, parent, slug });
    const subCategories = await SubCategory.find({})
      .sort({ createdAt: -1 })
      .populate({ path: "parent", model: Category })
      .lean();
    res.json({
      message: "دسته بندی والد با موفقیت به روز رسانی شد",
      subCategories,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
module.exports.updateCategoryController = updateCategoryController;

const deleteSubCategory = async (req, res) => {
  try {
    const id = req.params.id;
    await SubCategory.findByIdAndRemove(id);
    const subCategories = await SubCategory.find({}).sort({ updatedAt: -1 });
    res.json({
      message: "دسته بندی والد با موفقیت حذف شد",
      subCategories,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
module.exports.deleteSubCategory = deleteSubCategory;
