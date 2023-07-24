const express = require("express");
const router = express();

const OrderCtrl = require("../controllers/OrderCtrl");
const verify = require("../middleware/verify.middleware");

router.get("/order", verify, OrderCtrl.getAllOrder);

router.delete("/order/:id", verify, OrderCtrl.getOrderDetail);

router.post("/create-order", verify, OrderCtrl.createOrder);

router.post("/create-pay", verify, OrderCtrl.createOrderPay);



module.exports = router;
