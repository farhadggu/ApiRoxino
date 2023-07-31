const Order = require("../models/Order");
const User = require("../models/User");
const axios = require("axios");
const ZarinpalCheckout = require("zarinpal-checkout");

const zarinpal = ZarinpalCheckout.create(
  process.env.ZARINPAL_SECRET_KEY,
  false
);

const getAllOrder = async (req, res) => {
  try {
    if (req.query.pn && req.query.pgn) {
      const paginate = req.query.pgn;
      const pageNumber = req.query.pn;
      const GoalUsers = await Order.find()
        .sort({ _id: -1 })
        .skip((pageNumber - 1) * paginate)
        .limit(paginate)
        .select({ username: 1, email: 1 })
        .sort({ updatedAt: -1 })
        .lean();
      const AllUserNum = await Order.find().length;
      res.status(200).json({ data: GoalUsers, AllUserNum });
    } else {
      const GoalUsers = await Order.find().sort({ updatedAt: -1 }).lean();
      const AllUserNum = await Order.find().length;
      res.status(200).json({ data: GoalUsers, AllUserNum });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};
module.exports.getAllOrder = getAllOrder;

const getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user").lean();
    res.status(200).json({ data: order });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};
module.exports.getOrderDetail = getOrderDetail;

const createOrder = async (req, res) => {
  try {
    const {
      products,
      shippingAddress,
      paymentMethod,
      total,
      totalBeforeDiscount,
      couponApplied,
    } = req.body;
    const user = await User.findById(req.user);
    const newOrder = await new Order({
      user: user._id,
      products,
      shippingAddress,
      paymentMethod,
      total,
      totalBeforeDiscount,
      couponApplied,
    }).save();
    return res.json({
      order_id: newOrder._id,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
module.exports.createOrder = createOrder;

const createOrderPay = async (req, res) => {
  try {
    const { amount } = req.body;
    const order_id = req.params.id;

    zarinpal
      .PaymentRequest({
        Amount: 5000, // In Tomans
        CallbackURL: `${process.env.WEB_URL}/verifyOrder?id=${order_id}&amount=${amount}`,
        Description: "فروشگاه نکست جی اس",
      })
      .then((response) => {
        if (response.status === 100) {
          console.log(response);
          return res.json({ authority: response.authority });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
module.exports.createOrderPay = createOrderPay;

const getPaymentInfo = async (req, res) => {
  try {
    let paid = null;
    console.log(req.params.id);
    console.log(req.params.amount);
    console.log(req.params.Authority);
    zarinpal
      .PaymentVerification({
        Amount: req.params.amount, // In Tomans
        Authority: req.params.Authority,
      })
      .then(async (response) => {
        console.log(response)
        if (response.status === 100 || response.status === 101) {
          await Order.findByIdAndUpdate(req.params.id, {
            status: "Processed",
            isPaid: true,
          });
        } else {
          console.log("eh")
          await Order.findByIdAndUpdate(req.params.id, {
            status: "Not Processed",
            isPaid: false,
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });

    let order = await Order.findById(req.params.id);

    return res.json({
      data: {
        order_id: req.params.id,
        order: order,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
module.exports.getPaymentInfo = getPaymentInfo;
