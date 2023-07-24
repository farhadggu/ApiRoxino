const Order = require("../models/Order");
const User = require("../models/User");

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
    const order = await Order.findById(id).populate("user").lean();
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
    const { id: order_id } = req.query;

    // You can set the amount directly from the request body if it's being passed
    // const amount = req.body.amount;

    // Replace the hard-coded amountt with the amount from the request body
    const zarinpal = await axios.post(
      "https://api.zarinpal.com/pg/v4/payment/request.json",
      {
        merchant_id: `${process.env.ZARINPAL_SECRET_KEY}`,
        amount: amount,
        description: "فروشگاه نکست جی اس",
        callback_url: `${process.env.WEB_URL}/verifyOrder?id=${order_id}&amount=${amount}`,
      }
    );

    return res.json({ authority: zarinpal.data.data.authority });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
module.exports.createOrderPay = createOrderPay;
