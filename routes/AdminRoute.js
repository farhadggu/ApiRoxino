const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express();

const AdminCtrl = require("../controllers/AdminCtrl");
const verify = require("../middleware/verify.middleware");

router.get("/orders", verify, AdminCtrl.getAllOrders);
router.get("/users", verify, AdminCtrl.getAllUsers);
router.get("/products", verify, AdminCtrl.getAllProducts);
router.get("/products/:id", verify, AdminCtrl.getProductDetail);
router.get("/sub-products", verify, AdminCtrl.getSubProductDetail);
router.post("/create-product", verify, AdminCtrl.createProduct);
router.delete("/delete-products/:id", verify, AdminCtrl.deleteProduct);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/upload-images", upload.array("file"), (req, res) => {
  const filenames = req.files.map((file) => file.filename);
  res.status(200).json({ filenames });
});

router.delete("/delete-images", (req, res) => {
  const { filenames } = req.body;
  const uploadPath = path.join(__dirname, "public/uploads");

  filenames.forEach((filename) => {
    const filePath = path.join(uploadPath, filename);
    fs.unlinkSync(filePath); // Deletes the file synchronously
  });

  res.status(200).json({ message: "Files deleted successfully" });
});

module.exports = router;
