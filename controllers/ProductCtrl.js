const Product = require("../models/Product");
const Category = require("../models/Category");
const Cart = require("../models/Cart");
const SubCategory = require("../models/SubCategory");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { removeDuplicates } = require("../utils/arrays_utils")

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
        path: "category",
      });
      let newProducts = await Product.aggregate([
        { $sample: { size: 10 } },
      ]).exec();
      let popularProducts = await Product.find({
        rating: { $gt: 3 },
      }).populate({
        path: "category",
      });
      res.status(200).json({
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
    const slug = req.params.slug;
    const style = req.params.style;
    const size = req.params.size || 0;
    let product = await Product.findOne({ slug })
      .populate({ path: "category", model: Category })
      .populate({ path: "subCategories", model: SubCategory })
      .populate({ path: "reviews.reviewBy", model: User })
      .lean();

    let subProduct = product.subProducts[0];
    let prices = subProduct.sizes
      .map((s) => {
        return s.price;
      })
      .sort((a, b) => {
        return a - b;
      });
    let newProduct = {
      ...product,
      style,
      images: subProduct.images,
      sizes: subProduct.sizes,
      discount: subProduct.discount,
      sku: subProduct.sku,
      colors: product.subProducts.map((p) => {
        return p.color;
      }),
      priceRange: subProduct.discount
        ? `از ${(prices[0] - prices[0] / subProduct.discount).toFixed(0)} تا ${(
            prices[prices.length - 1] -
            prices[prices.length - 1] / subProduct.discount
          ).toFixed(0)}`
        : `از ${prices[0]} تا ${prices[prices.length - 1]}`,
      price:
        subProduct.discount > 0
          ? (
              subProduct.sizes[size].price -
              subProduct.sizes[size].price / subProduct.discount
            ).toFixed(0)
          : subProduct.sizes[size].price,
      priceBefore: subProduct.sizes[size].price,
      quantity: subProduct.sizes[size].qty,
      ratings: [
        {
          percentage: calculatePercentage("5"),
        },
        {
          percentage: calculatePercentage("4"),
        },
        {
          percentage: calculatePercentage("3"),
        },
        {
          percentage: calculatePercentage("2"),
        },
        {
          percentage: calculatePercentage("1"),
        },
      ],
      reviews: product.reviews.reverse(),
      allSizes: product.subProducts
        .map((p) => {
          return p.sizes;
        })
        .flat()
        .sort((a, b) => {
          return a.size - b.size;
        })
        .filter(
          (element, index, array) =>
            array.findIndex((el2) => el2.size === element.size) === index
        ),
    };
    //-----------------
    function calculatePercentage(num) {
      return (
        (product.reviews.reduce((a, review) => {
          return (
            a +
            (review.rating == Number(num) || review.rating == Number(num) + 0.5)
          );
        }, 0) *
          100) /
        product.reviews.length
      ).toFixed(0);
    }

    return res.json({ data: newProduct });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
module.exports.getProductDetail = getProductDetail;

const getProductInfoForAddToCart = async (req, res) => {
  try {
    const id = req.params.id;
    const style = req.params.style || 0;
    let size = req.params.size === undefined ? 0 : req.params.size;
    const product = await Product.findById(id).lean();
    console.log(id);
    console.log(style);
    console.log(size);
    console.log(product);
    let discount = product.subProducts[style].discount;
    let priceBefore = product.subProducts[style].sizes[size].price;
    let price = discount ? priceBefore - priceBefore / discount : priceBefore;
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
module.exports.getProductInfoForAddToCart = getProductInfoForAddToCart;

const getItemsCardForOrder = async (req, res) => {
  try {
    const user = await User.findById(
      jwt.verify(
        req.headers?.authorization?.split(" ")[1],
        process.env.TOKEN_SECRET
      )._id
    );
    const cart = await Cart.findOne({ user: user._id });
    // console.log(user)
    console.log(cart);
    if (!cart) {
      return {
        redirect: {
          destination: "/cart",
        },
      };
    }
    return res.json({ data: { cart: cart, user: user } });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
module.exports.getItemsCardForOrder = getItemsCardForOrder;

// const getAllItemsCart = async (req, res) => {
//   try {
//     const id = req.params.id;
//     const style = req.params.style || 0;
//     let size = req.params.size === undefined ? 0 : req.params.size;
//     const product = await Product.findById(id).lean();
//     console.log(id);
//     console.log(style);
//     console.log(size);
//     console.log(product);
//     let discount = product.subProducts[style].discount;
//     let priceBefore = product.subProducts[style].sizes[size].price;
//     let price = discount ? priceBefore - priceBefore / discount : priceBefore;
//     return res.json({
//       _id: product._id,
//       style: Number(style),
//       name: product.name,
//       description: product.description,
//       slug: product.slug,
//       sku: product.subProducts[style].sku,
//       brand: product.brand,
//       category: product.category,
//       subCategories: product.subCategories,
//       shipping: product.shipping,
//       images: product.subProducts[style].images,
//       color: product.subProducts[style].color,
//       size: product.subProducts[style].sizes[size].size,
//       price,
//       priceBefore,
//       quantity: product.subProducts[style].sizes[size].qty,
//     });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// }
// module.exports.getAllItemsCart = getAllItemsCart;

const getAllProductsFilter = async (query) => {
  function createRegex(data, styleRegex) {
    if (data.length > 1) {
      for (var i = 1; i < data.length; i++) {
        styleRegex += `|^${data[i]}`;
      }
    }
    return styleRegex;
  }

  const searchQuery = query.search || "";
  const categoryQuery = query.category || "";
  const priceQuery = query.price?.split("_") || "";
  const ratingQuery = query.rating || "";
  const sortQuery = query.sort || "";
  const page = query.page || 1;
  const pageSize = 15;
  const sizeQuery = query.size?.split("_") || "";
  const sizeRegex = `^${sizeQuery[0]}`;
  const sizeSearchRegex = createRegex(sizeQuery, sizeRegex);
  const colorQuery = query.color?.split("_") || "";
  const colorRegex = `^${colorQuery[0]}`;
  const colorSearchRegex = createRegex(colorQuery, colorRegex);
  const brandQuery = query.brand?.split("_") || "";
  const brandRegex = `^${brandQuery[0]}`;
  const brandSearchRegex = createRegex(brandQuery, brandRegex);
  const styleQuery = query.style?.split("_") || "";
  const styleRegex = `^${styleQuery[0]}`;
  const styleSearchRegex = createRegex(styleQuery, styleRegex);

  const search =
    searchQuery && searchQuery !== ""
      ? {
          name: {
            $regex: searchQuery,
            $options: "i",
          },
        }
      : {};

  const category =
    categoryQuery && categoryQuery !== "" ? { category: categoryQuery } : {};

  const size =
    sizeQuery && sizeQuery !== ""
      ? {
          "subProducts.sizes.size": {
            $regex: sizeSearchRegex,
            $options: "i",
          },
        }
      : {};

  const color =
    colorQuery && colorQuery !== ""
      ? {
          "subProducts.color.color": {
            $regex: colorSearchRegex,
            $options: "i",
          },
        }
      : {};

  const brand =
    brandQuery && brandQuery !== ""
      ? {
          brand: {
            $regex: brandSearchRegex,
            $options: "i",
          },
        }
      : {};

  const style =
    styleQuery && styleQuery !== ""
      ? {
          "details.value": {
            $regex: styleSearchRegex,
            $options: "i",
          },
        }
      : {};

  const price =
    priceQuery && priceQuery !== ""
      ? {
          "subProducts.sizes.price": {
            $gte: Number(priceQuery[0]) || 0,
            $lte: Number(priceQuery[1]) || Infinity,
          },
        }
      : {};

  const rating =
    ratingQuery && ratingQuery !== ""
      ? {
          rating: {
            $gte: Number(ratingQuery),
          },
        }
      : {};

  const sort =
    sortQuery == ""
      ? {}
      : sortQuery == "popular"
      ? { rating: -1, "subProducts.review": -1 }
      : sortQuery == "newest"
      ? { createdAt: -1 }
      : sortQuery == "topSelling"
      ? { "subProducts.sold": -1 }
      : sortQuery == "topReviewed"
      ? { rating: -1 }
      : sortQuery == "priceHighToLow"
      ? { "subProducts.sizes.price": -1 }
      : sortQuery == "priceLowToHigh"
      ? { "subProducts.sizes.price": 1 }
      : {};

  const totalProducts = await Product.countDocuments({
    ...search,
    ...category,
    ...brand,
    ...style,
    ...size,
    ...color,
    ...price,
    ...rating,
  });

  const products = await Product.find({
    ...search,
    ...category,
    ...size,
    ...color,
    ...brand,
    ...style,
    ...price,
    ...rating,
  })
    .skip(pageSize * (page - 1))
    .limit(pageSize)
    .sort(sort)
    .populate({ path: "category", model: Category })
    .lean();

  let sizes = await Product.find({ ...category }).distinct(
    "subProducts.sizes.size"
  );

  let colors = await Product.find({ ...category }).distinct(
    "subProducts.color.color"
  );

  let brandsDb = await Product.find({ ...category }).distinct("brand");
  let brands = removeDuplicates(brandsDb);

  return {
    products,
    paginationCount: Math.ceil(totalProducts / pageSize),
    sizes,
    colors,
    brands,
  };
};
module.exports.getAllProductsFilter = getAllProductsFilter;

const getAllProductsFilterController = async (req, res) => {
  try {
    const { query } = req;
    console.log(query)
    const { products, paginationCount, sizes, colors, brands } =
      await getAllProductsFilter(query);

    // Other code to handle the response
    // ...

    return res
      .status(200)
      .json({
        data: {
          products: products,
          sizes: sizes,
          colors: colors,
          brands: brands,
        },
      });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
module.exports.getAllProductsFilterController = getAllProductsFilterController;

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
    const product = await Product.findById(req.params.id);

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

    return res.status(200).json({ reviews: product.reviews.reverse() });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
module.exports.createOrUpdateReview = createOrUpdateReview;

const updateProduct = async (req, res) => {
  try {
    console.log(req.body)
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


