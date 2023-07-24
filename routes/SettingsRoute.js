const express = require("express");
const router = express();

const SettingsCtrl = require("../controllers/SettingsCtrl");
const verify = require("../middleware/verify.middleware");

router.get("/settings", verify, SettingsCtrl.getSettings);

router.post("/create-settings", verify, SettingsCtrl.createSetting);

router.put("/update-settings", verify, SettingsCtrl.updateSetting);

// router.delete(
//   "/delete-subcategory/:id",
//   verify,
//   SubCategoryCtrl.deleteSubCategory
// );

module.exports = router;
