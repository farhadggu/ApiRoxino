const express = require("express");
const router = express();
const { check } = require("express-validator");

const ProductCtrl = require("../controllers/ProductCtrl");
const verify = require("../middleware/verify.middleware");

router.get("/products", verify, ProductCtrl.getAllProducts)

router.get("/products/:id", verify, ProductCtrl.getProductDetail)

router.post("/create-products", verify, ProductCtrl.createProduct)

router.post("/create-review", verify, ProductCtrl.createOrUpdateReview)

router.put("/update-products/:id", verify, ProductCtrl.updateProduct)

router.delete("/delete-products/:id", verify, ProductCtrl.deleteProduct)

module.exports = router;