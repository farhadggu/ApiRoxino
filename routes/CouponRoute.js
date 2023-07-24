const express = require("express");
const router = express();

const CouponCtrl = require("../controllers/CouponCtrl");
const verify = require("../middleware/verify.middleware");

router.get("/coupon", verify, CouponCtrl.getAllCoupon);

router.post("/create-coupon", verify, CouponCtrl.createCoupon);

router.put("/update-coupon", verify, CouponCtrl.updateCoupon);

router.delete("/delete-coupon/:id", verify, CouponCtrl.deleteCoupon);

router.post("/apply-coupon", verify, CouponCtrl.applyCoupon);

module.exports = router;
