const Product = require("../models/Product");
const { validationResult } = require("express-validator");

const getAllProducts = async (req, res) => {
  try {
    console.log("slm", req)
    const products = Product.find({});
    return res.status(200).json({ data: products });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};
module.exports.getAllProducts = getAllProducts;
 
const createNewProduct = async (req, res) => {
  try {
    const data = req.body;
    
    const product = await Product.create({
      name: data.name,
      description: data.description,
      brand: data.brand,
      slug: data.slug,
      category: data.category,
      subCategories: data.subCategories,
      details: data.details,
      reviews: data.reviews,
      rating: data.rating,
      subProducts: data.subProducts,
      sliderBool: data.sliderBool,
      sliderImage: data.sliderImage,
    });

    return res.status(201).json({ message: "محصول شما با موفقیت ساخته شد", data: product });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};
module.exports.createNewProduct = createNewProduct;
