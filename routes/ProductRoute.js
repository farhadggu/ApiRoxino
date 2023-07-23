const express = require("express");
const router = express();
const { check } = require("express-validator");

const ProductCtrl = require("../controllers/ProductCtrl");
const verify = require("../middleware/verify.middleware");

router.get("/products", ProductCtrl.getAllProducts)

router.post("/create-products", verify, ProductCtrl.createNewProduct)

module.exports = router;