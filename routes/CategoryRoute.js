const express = require("express");
const router = express();

const CategoryCtrl = require("../controllers/CategoryCtrl");
const verify = require("../middleware/verify.middleware");

router.get("/category", verify, CategoryCtrl.getAllCategory);

router.post("/create-category", verify, CategoryCtrl.createCategory);

router.put("/update-category/:id", verify, CategoryCtrl.updateCategory);

router.delete("/delete-category/:id", verify, CategoryCtrl.deleteCategory);


module.exports = router;
