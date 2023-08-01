const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const { ObjectId } = require("mongodb");
const path = require("path");
const fs = require("fs");

const getAllOrders = async (req, res) => {
  try {
    if (req.query.pn && req.query.pgn) {
      const paginate = req.query.pgn;
      const pageNumber = req.query.pn;
      const orders = Order.find()
        .sort({ _id: -1 })
        .skip((pageNumber - 1) * paginate)
        .limit(paginate)
        .populate({ path: "user", model: User });
      const AllOrderNum = await Order.find().length;
      const allProductNum = await Product.find().exec();
      const count = allProductNum.length;
      res.status(200).json({ data: orders, AllOrderNum, AllProductNum: count });
    } else {
      const orders = await Order.find().sort({ updatedAt: -1 }).lean();
      const AllOrderNum = await Order.find().length;
      const allProductNum = await Product.find().exec();
      const count = allProductNum.length;
      res.status(200).json({ data: orders, AllOrderNum, AllProductNum: count });
    }
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
module.exports.getAllOrders = getAllOrders;

const getAllUsers = async (req, res) => {
  try {
    if (req.query.pn && req.query.pgn) {
      const paginate = req.query.pgn;
      const pageNumber = req.query.pn;
      const users = User.find()
        .sort({ _id: -1 })
        .skip((pageNumber - 1) * paginate)
        .limit(paginate);
      res.status(200).json({ data: users });
    } else {
      const users = await User.find().sort({ updatedAt: -1 }).lean();
      res.status(200).json({ data: users });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};
module.exports.getAllUsers = getAllUsers;

const getAllProducts = async (req, res) => {
  try {
    if (req.query.pn && req.query.pgn) {
      const paginate = req.query.pgn;
      const pageNumber = req.query.pn;
      const products = Product.find()
        .sort({ _id: -1 })
        .skip((pageNumber - 1) * paginate)
        .limit(paginate);
      res.status(200).json({ data: products });
    } else {
      const products = await Product.find().sort({ updatedAt: -1 }).lean();
      res.status(200).json({ data: products });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};
module.exports.getAllProducts = getAllProducts;

const getProductDetail = async (req, res) => {
  try {
    const productId = req.params.id;
    console.log(productId)

    // Get product details by productId
    const product = await Product.aggregate([
      { $unwind: "$subProducts" },
      { $match: { "subProducts._id": new ObjectId(query.id) } },
    ]);

    console.log(product);

    if (!product) {
      // Handle the case when the product with the given ID is not found
      return res.status(404).json({ message: "Product not found" });
    }

    // Extract subProductEdit from the product
    const subProductEdit = product.subProducts.find(
      (subProduct) => subProduct._id.toString() === productId
    );

    // Get other necessary data (categories, subCategories, etc.)
    const results = await Product.find().select("name subProducts").lean();

    return res.status(200).json({
      parents: product,
      subProductEdit,
      results,
      // results, if needed
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
module.exports.getProductDetail = getProductDetail;

const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const productId = await Product.find({ "subProducts._id": id }).select(
      "_id"
    );
    const productLength = await Product.find({ _id: productId[0]._id }).select(
      "subProducts"
    );
    const productImages = await Product.find({ "subProducts._id": id }).select(
      "subProducts"
    );
    if (productLength[0].subProducts.length < 2) {
      await Product.findOneAndDelete({ "subProducts._id": id });
      const uploadPath = path.join(process.cwd(), "public/uploads");
      productImages[0].subProducts[0].images.forEach((filename) => {
        const filePath = path.join(uploadPath, filename);
        fs.unlinkSync(filePath); // Deletes the file synchronously
      });
    } else {
      await Product.updateOne(
        { "subProducts._id": id },
        {
          $pull: { subProducts: { _id: id } },
        },
        { new: true }
      );
      const uploadPath = path.join(process.cwd(), "public/uploads");
      productImages[0].subProducts
        .find((item) => item._id == id)
        .images.forEach((filename) => {
          const filePath = path.join(uploadPath, filename);
          fs.unlinkSync(filePath); // Deletes the file synchronously
        });
    }

    const products = await Product.find({})
      .populate({
        path: "subProducts",
        model: Product,
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "حذف شد",
      products: products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
module.exports.deleteProduct = deleteProduct;
