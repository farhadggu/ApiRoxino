const Coupon = require("../models/Coupon");
const { validationResult } = require("express-validator");
const slugify = require("slugify");

const getAllCoupon = async (req, res) => {
  try {
    if (req.query.pn && req.query.pgn) {
      const paginate = req.query.pgn;
      const pageNumber = req.query.pn;
      const GoalUsers = await Coupon.find()
        .sort({ _id: -1 })
        .skip((pageNumber - 1) * paginate)
        .limit(paginate)
        .select({ username: 1, email: 1 })
        .sort({ updatedAt: -1 }).lean();
      const AllUserNum = await Coupon.find().length;
      res.status(200).json({ data: GoalUsers, AllUserNum });
    } else {
      const GoalUsers = await Coupon.find().sort({ updatedAt: -1 }).lean();
      const AllUserNum = await Coupon.find().length;
      res.status(200).json({ data: GoalUsers, AllUserNum });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};
module.exports.getAllCoupon = getAllCoupon;

const createCoupon = async (req, res) => {
  try {
    const { coupon, discount, startDate, endDate } = req.body;
    const test = await Coupon.findOne({ coupon });
    if (test) {
      return res
        .status(400)
        .json({ message: "این کد تخفیف موجود می باشد نام دیگری انتخاب کنید" });
    }
    await new Coupon({ coupon, discount, startDate, endDate }).save();
    res.json({
      message: `کد تخفیف ${coupon} با موفقیت ایجاد شد`,
      coupons: await Coupon.find({}).sort({ updatedAt: -1 }),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
module.exports.createCoupon = createCoupon;

const updateCoupon = async (req, res) => {
  try {
    const { id, coupon, discount, startDate, endDate } = req.body;
    await Coupon.findByIdAndUpdate(id, {
      coupon,
      discount,
      startDate,
      endDate,
    });
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json({
      message: "کد تخفیف با موفقیت به روز رسانی شد",
      coupons,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
module.exports.updateCoupon = updateCoupon;

const deleteCoupon = async (req, res) => {
  try {
    const id = req.params.id;
    await Coupon.findByIdAndRemove(id);
    const coupons = await Coupon.find({}).sort({ updatedAt: -1 });
    res.json({
      message: "کد تخفیف با موفقیت حذف شد",
      coupons,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
module.exports.deleteCoupon = deleteCoupon;

const applyCoupon = async (req, res) => {
  try {
    await db.connectDb();
    const { coupon } = req.body;
    const user = await User.findById(req.user);
    const checkCoupon = await Coupon.findOne({ coupon });

    if (!checkCoupon) {
      await db.disconnectDb();
      return res.json({ message: "کد تخفیف نامعتبر" });
    }

    const cart = await Cart.findOne({ user: req.user });
    const cartTotal = cart.cartTotal;
    let totalAfterDiscount = cartTotal - (cartTotal * checkCoupon.discount) / 100;

    await Cart.findOneAndUpdate({ user: user._id }, { totalAfterDiscount });

    await db.disconnectDb();
    return res.json({
      totalAfterDiscount: totalAfterDiscount.toFixed(0),
      discount: checkCoupon.discount,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
module.exports.applyCoupon = applyCoupon;