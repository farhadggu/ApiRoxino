const express = require("express");
const router = express();

const SubCategoryCtrl = require("../controllers/SubCategoryCtrl");
const verify = require("../middleware/verify.middleware");

router.get("/subcategory", verify, SubCategoryCtrl.getAllSubCategory);

router.post("/create-subcategory", verify, SubCategoryCtrl.createSubCategory);

router.put("/update-subcategory", verify, SubCategoryCtrl.updateCategoryController);

router.delete("/delete-subcategory/:id", verify, SubCategoryCtrl.deleteSubCategory);

module.exports = router;
