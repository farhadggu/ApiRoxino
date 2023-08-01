const express = require("express");
const router = express();

const AdminCtrl = require("../controllers/AdminCtrl");
const verify = require("../middleware/verify.middleware");

router.get("/orders", verify, AdminCtrl.getAllOrders)
router.get("/users", verify, AdminCtrl.getAllUsers)
router.get("/products", verify, AdminCtrl.getAllProducts)
router.get("/products/:id", verify, AdminCtrl.getProductDetail)
router.delete("/delete-products/:id", verify, AdminCtrl.deleteProduct)


module.exports = router;