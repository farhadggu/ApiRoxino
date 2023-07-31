const express = require("express");
const router = express();

const OrderCtrl = require("../controllers/OrderCtrl");
const verify = require("../middleware/verify.middleware");

router.get("/order", verify, OrderCtrl.getAllOrder);

router.get("/order/:id", verify, OrderCtrl.getOrderDetail);

router.post("/create-order", verify, OrderCtrl.createOrder);

router.post("/create-pay/:id", verify, OrderCtrl.createOrderPay);

router.get("/payment-info/:id/:amount/:Authority", verify, OrderCtrl.getPaymentInfo);

module.exports = router;
