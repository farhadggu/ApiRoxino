const express = require("express");
const router = express();
const { check } = require("express-validator");

const CategoryCtrl = require("../controllers/CategoryCtrl");
const verify = require("../middleware/verify.middleware");

router.get("/category", verify, CategoryCtrl.getAllCategory);

module.exports = router;
