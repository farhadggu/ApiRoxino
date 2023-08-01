const express = require("express");
const router = express();
const { check } = require("express-validator");

const ProductCtrl = require("../controllers/ProductCtrl");
const verify = require("../middleware/verify.middleware");

router.get("/products", verify, ProductCtrl.getAllProducts)

router.get("/products/:slug", verify, ProductCtrl.getProductDetail)

router.get("/product/:id", verify, ProductCtrl.getProductInfoForAddToCart)

router.get("/product-checkout", verify, ProductCtrl.getItemsCardForOrder)

router.get("/all-products", verify, ProductCtrl.getAllProductsFilterController)

router.post("/create-products", verify, ProductCtrl.createProduct)

router.put("/product/:id/review", verify, ProductCtrl.createOrUpdateReview)

router.put("/update-products/:id", verify, ProductCtrl.updateProduct)

module.exports = router;