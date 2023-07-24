const Product = require("../models/Product");
const Category = require("../models/Product")
const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");

const getAllProducts = async (req, res) => {
  try {
    if (req.query.pn && req.query.pgn) {
      const paginate = req.query.pgn;
      const pageNumber = req.query.pn;
      const GoalUsers = await Product.find()
        .sort({ _id: -1 })
        .skip((pageNumber - 1) * paginate)
        .limit(paginate)
        .select({ username: 1, email: 1 });
      const AllUserNum = await Product.find().length;
      res.status(200).json({ GoalUsers, AllUserNum });
    } else {
      const GoalUsers = await Product.find();
      const AllUserNum = await Product.find().length;
      let sliderProductImages = await Product.find({ sliderBool: true }).select(
        "slug sliderImage"
      );
      let products = await Product.find()
        .sort({ createdAt: -1 })
        .populate({ path: "category" });
      let offersProduct = await Product.find({
        "subProducts.discount": { $gt: 5 },
      }).populate({
        path: "category"
      });
      let newProducts = await Product.aggregate([
        { $sample: { size: 10 } },
      ]).exec();
      let popularProducts = await Product.find({
        rating: { $gt: 3 },
      }).populate({
        path: "category"
      });
      res
        .status(200)
        .json({
          data: GoalUsers,
          sliderProductImages: sliderProductImages,
          products: products,
          offersProduct: offersProduct,
          newProducts: newProducts,
          popularProducts: popularProducts,
          AllUserNum,
        });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};
module.exports.getAllProducts = getAllProducts;

const getProductDetail = async (req, res) => {
  try {
    db.connectDb();
    const id = req.params.id;
    const style = req.params.style || 0;
    let size = req.params.size === undefined ? 0 : req.params.size;
    const product = await Product.findById(id).lean();
    let discount = product.subProducts[style].discount;
    let priceBefore = product.subProducts[style].sizes[size].price;
    let price = discount ? priceBefore - priceBefore / discount : priceBefore;
    db.disconnectDb();
    return res.json({
      _id: product._id,
      style: Number(style),
      name: product.name,
      description: product.description,
      slug: product.slug,
      sku: product.subProducts[style].sku,
      brand: product.brand,
      category: product.category,
      subCategories: product.subCategories,
      shipping: product.shipping,
      images: product.subProducts[style].images,
      color: product.subProducts[style].color,
      size: product.subProducts[style].sizes[size].size,
      price,
      priceBefore,
      quantity: product.subProducts[style].sizes[size].qty,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
module.exports.getProductDetail = getProductDetail;

const createProduct = async (req, res) => {
  try {
    if (req.body.parent) {
      const parent = await Product.findById(req.body.parent);
      if (!parent) {
        return res.status(400).json({ message: "محصول والد یافت نشد" });
      } else {
        await parent.updateOne(
          {
            $push: {
              subProducts: {
                sku: req.body.sku,
                color: req.body.color,
                images: req.body.images,
                sizes: req.body.sizes,
                discount: req.body.discount,
              },
            },
          },
          { new: true }
        );
      }
      res.status(200).json({ message: "محصول با موفقیت ایجاد شد" });
    } else {
      const newProduct = new Product({
        name: req.body.name,
        description: req.body.description,
        brand: req.body.brand,
        details: req.body.details,
        questions: req.body.questions,
        slug: req.body.slug,
        category: req.body.category,
        subCategories: req.body.subCategories,
        subProducts: [
          {
            sku: req.body.sku,
            color: req.body.color,
            images: req.body.images,
            sizes: req.body.sizes,
            discount: req.body.discount,
          },
        ],
        sliderBool: req.body.sliderBool,
        sliderImage: req.body.sliderImage,
      });
      await newProduct.save();
      res
        .status(200)
        .json({ message: "محصول با موفقیت ایجاد شد", data: newProduct });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports.createProduct = createProduct;

const createOrUpdateReview = async (req, res) => {
  try {
    await db.connectDb();
    const product = await Product.findById(req.query.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const reviewByUserId = req.user;
    const existingReview = product.reviews.find(
      (x) => x.reviewBy.toString() === reviewByUserId
    );

    if (existingReview) {
      const updatedReview = {
        rating: req.body.rating,
        review: req.body.review,
        size: req.body.size,
        style: req.body.style,
        images: req.body.images,
      };

      const reviewIndex = product.reviews.findIndex(
        (x) => x._id.toString() === existingReview._id.toString()
      );
      product.reviews[reviewIndex] = { ...existingReview, ...updatedReview };
    } else {
      const newReview = {
        reviewBy: reviewByUserId,
        rating: req.body.rating,
        review: req.body.review,
        size: req.body.size,
        style: req.body.style,
        images: req.body.images,
      };

      product.reviews.push(newReview);
    }

    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((total, review) => total + review.rating, 0) /
      product.reviews.length;

    await product.save();
    await product.populate("reviews.reviewBy");
    await db.disconnectDb();

    return res.status(200).json({ reviews: product.reviews.reverse() });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
module.exports.createOrUpdateReview = createOrUpdateReview;

const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.body.id, {
      name: req.body.name,
      description: req.body.description,
      brand: req.body.brand,
      details: req.body.details,
      questions: req.body.questions,
      category: req.body.category,
      subCategories: req.body.subCategories,
      subProducts: req.body.subProducts[0].subProducts,
      sliderBool: req.body.sliderBool,
      sliderImage: req.body.sliderImage,
    });

    const subProductIndex = updatedProduct.subProducts.findIndex(
      (subProduct) => {
        return subProduct._id.toString() === req.body.subProductId;
      }
    );

    updatedProduct.subProducts[subProductIndex].sku = req.body.sku;
    updatedProduct.subProducts[subProductIndex].color = req.body.color;
    updatedProduct.subProducts[subProductIndex].images = req.body.images;
    updatedProduct.subProducts[subProductIndex].sizes = req.body.sizes;
    updatedProduct.subProducts[subProductIndex].discount = req.body.discount;

    await updatedProduct.save();
    res
      .status(200)
      .json({ message: "محصول با موفقیت ویرایش شد", data: updatedProduct });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
module.exports.updateProduct = updateProduct;

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
