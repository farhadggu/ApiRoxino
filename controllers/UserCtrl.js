const User = require("../models/User");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const token = require("../utils/token.util");
const { KavenegarApi } = require("kavenegar");
const { serialize } = require("cookie");
const jwt = require("jsonwebtoken");

const getAllUsers = async (req, res) => {
  try {
    if (req.query.pn && req.query.pgn) {
      const paginate = req.query.pgn;
      const pageNumber = req.query.pn;
      const GoalUsers = await User.find()
        .sort({ _id: -1 })
        .skip((pageNumber - 1) * paginate)
        .limit(paginate)
        .select({ username: 1, email: 1 });
      const AllUserNum = await User.find().length;
      res.status(200).json({ GoalUsers, AllUserNum });
    } else {
      const GoalUsers = await User.find();
      const AllUserNum = await User.find().length;
      res.status(200).json({ GoalUsers, AllUserNum });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};
module.exports.getAllUsers = getAllUsers;

const getUser = async (req, res) => {
  try {
    const user = await User.findById(
      jwt.verify(
        req.headers?.authorization?.split(" ")[1],
        process.env.TOKEN_SECRET
      )._id
    );
    const tab = req.query.tab || 0;

    res.status(200).json({ user: user, tab: tab });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};
module.exports.getUser = getUser;

const newUser = async (req, res) => {
  try {
    const data = req.body;
    const user = await User.findOne({ email: data.email });
    console.log(user);
    if (user) {
      res.status(400).json({ message: "ایمیل کاربری موجود است" });
    } else {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(data.password, salt);
      const createdUser = await User.create({
        name: data.name,
        email: data.email,
        password: hashedPassword,
      });
      res.status(201).json({
        message: "حساب کاربری شما با موفقیت ساخته شد",
        user: createdUser,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};
module.exports.newUser = newUser;

const otpCodeUser = async (req, res) => {
  let otpCode = Math.floor(Math.random() * 90000) + 10000;
  try {
    let api = KavenegarApi({
      apikey:
        "5548565754686E477A666B68443666645A785078485252734454454D68584E5575325537426730556767413D",
    });
    api.Send({
      message: `خدمات پیام کوتاه کاوه نگار ${otpCode}`,
      sender: "10008663",
      receptor: req.body.phone_login,
    });
    return res.status(200).json({ message: "ok", otpCode: otpCode });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};
module.exports.otpCodeUser = otpCodeUser;

const loginUser = async (req, res) => {
  try {
    console.log(req.body.otpCode);
    console.log(req.body.login_password);
    if (req.body.otpCode == req.body.login_password) {
      console.log(req.body.login_phone);

      const user = await User.findOne({ phone: req.body.login_phone });
      console.log(user);
      if (user) {
        // Generate your token here
        const accessToken = token(user);
        console.log(accessToken);

        res.cookie("access_token", accessToken, {
          httpOnly: true,
          // Other cookie options (secure, domain, etc.) can be added here
        });

        // Set the new cookie in the response header

        return res.status(200).json({
          message: "qablan create shode budi",
          otpCode: req.body.otpCode,
          auth_token: accessToken,
        });
      } else {
        const newUser = new User({ phone: req.body.login_phone });
        await newUser.save();

        const accessToken = token(newUser);

        res.cookie("access_token", accessToken, {
          httpOnly: true,
          // Other cookie options (secure, domain, etc.) can be added here
        });

        return res.status(200).json({
          message: "حساب کاربری شما ساخته شد",
          auth_token: accessToken,
        });
      }
    } else {
      return res.status(401).json({ message: "کد ارسالی نا معتبر است" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
  // try {
  //   const data = req.body;
  //   const result = await User.findOne({ email: data.email });
  //   console.log(result)
  //   if (!result) {
  //     return res
  //       .status(400)
  //       .json({ message: "اطلاعات وارد شده نادرست می باشد" });
  //   }

  //   const isPasswordValid = await bcrypt.compare(
  //     data.password,
  //     result.password
  //   );

  //   console.log(isPasswordValid);

  //   if (!isPasswordValid) {
  //     return res
  //       .status(400)
  //       .json({ message: "اطلاعات وارد شده نادرست می باشد" });
  //   }

  //   const accessToken = token(result);

  // res.cookie('access_token', accessToken, {
  //   httpOnly: true,
  //   // Other cookie options (secure, domain, etc.) can be added here
  // });

  //   console.log("access", accessToken);

  //   return res
  //     .status(200)
  //     .json({ message: "شما با موفقیت وارد شدید" });
  // } catch (err) {
  //   console.log(err);
  //   return res.status(400).json(err);
  // }
};
module.exports.loginUser = loginUser;

const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({ msg: errors.errors[0].msg });
    } else {
      const data = req.body;
      data.username = req.body.slug.replace(/\s+/g, "_").toLowerCase();
      data.email = req.body.slug.replace(/\s+/g, "_").toLowerCase();
      data.password = req.body.slug.replace(/\s+/g, "").toLowerCase();
      await User.findByIdAndUpdate(req.params.id, data, {
        new: true,
      });
      res.status(200).json({ msg: "کاربر با موفقیت به روز رسانی شد" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};
module.exports.updateUser = updateUser;

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndRemove(req.params.id);
    res.status(200).json({ msg: "کاربر با موفقیت حذف شد" });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};
module.exports.deleteUser = deleteUser;

const getOneUserById = async (req, res) => {
  try {
    const goalUser = await User.findById(req.params.id);
    res.status(200).json(goalUser);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};
module.exports.getOneUserById = getOneUserById;

const searchUser = async (req, res) => {
  try {
    const theUser = await User.findOne({ email: req.body.email });
    if (theUser.length > 0) {
      res.status(200).json({ userData: theUser[0] });
    } else {
      res.status(200).json({ userData: 0 });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};
module.exports.searchUser = searchUser;

const updateMiniUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({ msg: errors.errors[0].msg });
    } else {
      const data = req.body;
      data.username = req.body.slug.replace(/\s+/g, "_").toLowerCase();
      data.email = req.body.slug.replace(/\s+/g, "_").toLowerCase();
      data.password = req.body.slug.replace(/\s+/g, "").toLowerCase();
      await User.findByIdAndUpdate(req.params.id, data, {
        new: true,
      });
      res.status(200).json({ msg: "کاربر با موفقیت به روز رسانی شد" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};
module.exports.updateMiniUser = updateMiniUser;

const getAllAddresses = async (req, res) => {
  try {
    const address = await User.findById(
      jwt.verify(
        req.headers?.authorization?.split(" ")[1],
        process.env.TOKEN_SECRET
      )._id
    )
      .select("address")
      .lean();
    const tab = req.query.tab || 0;
    const user = await User.findById(
      jwt.verify(
        req.headers?.authorization?.split(" ")[1],
        process.env.TOKEN_SECRET
      )._id
    );
    res.status(200).json({ data: { address: address, user: user }, tab: tab });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};
module.exports.getAllAddresses = getAllAddresses;

const createOrUpdateAddresses = async (req, res) => {
  try {
    const { id } = req.body;
    const user = await User.findById(
      jwt.verify(
        req.headers?.authorization?.split(" ")[1],
        process.env.TOKEN_SECRET
      )._id
    );
    const userAddresses = user.address;
    const addresses = userAddresses.map((address) => {
      return {
        ...address.toObject(),
        active: address._id.toString() === id ? true : false,
      };
    });

    await user.updateOne({ address: addresses }, { new: true });

    return res.status(200).json({ addresses });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
module.exports.createOrUpdateAddresses = createOrUpdateAddresses;

const deleteAddress = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(
      jwt.verify(
        req.headers?.authorization?.split(" ")[1],
        process.env.TOKEN_SECRET
      )._id
    );
    await user.updateOne({ $pull: { address: { _id: id } } }, { new: true });
    res.json({
      addresses: user.address.filter((a) => a._id.toString() !== id),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
module.exports.deleteAddress = deleteAddress;

const getAllWishlists = async (req, res) => {
  try {
    const wishlists = await User.findById(
      jwt.verify(
        req.headers?.authorization?.split(" ")[1],
        process.env.TOKEN_SECRET
      )._id
    )
      .populate({
        path: "wishlist.product",
        model: Product,
      })
      .select("wishlist");
    res.status(200).json({ data: wishlists });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};
module.exports.getAllWishlists = getAllWishlists;

const createOrUpdateWishlist = async (req, res) => {
  try {
    const { product_id, style } = req.body;

    const user = await User.findById(
      jwt.verify(
        req.headers?.authorization?.split(" ")[1],
        process.env.TOKEN_SECRET
      )._id
    );

    const exist = user.wishlist.find(
      (x) => x.product.toString() === product_id && x.style === style
    );
    if (exist) {
      return res
        .status(400)
        .json({ message: "این محصول در علاقه‌مندی‌ های شما موجود می‌باشد" });
    }
    user.wishlist.push({ product: product_id, style });
    await user.save();
    return res
      .status(200)
      .json({ message: "محصول با موفقیت به علاقه‌مندی‌ها اضافه شد" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
module.exports.createOrUpdateWishlist = createOrUpdateWishlist;

const deleteWishlist = async (req, res) => {
  try {
    const data = req.params.id;
    let user = await User.findById(jwt.verify(
      req.headers?.authorization?.split(" ")[1],
      process.env.TOKEN_SECRET
    )._id);

    await user.updateOne(
      {
        $pull: { wishlist: { product: { _id: data } } },
      },
      { new: true }
    );

    user = await User.findById(jwt.verify(
      req.headers?.authorization?.split(" ")[1],
      process.env.TOKEN_SECRET
    )._id);
    return res.status(200).json({
      message: "محصول با موفقیت از علاقه مندی ها حذف شد",
      products: user.wishlist,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
module.exports.deleteWishlist = deleteWishlist;

const changePassword = async (req, res) => {
  try {
    const { current_password, password } = req.body;
    const user = await User.findById(
      jwt.verify(
        req.headers?.authorization?.split(" ")[1],
        process.env.TOKEN_SECRET
      )._id
    );

    if (!user.password) {
      const crypted_password = await bcrypt.hash(password, 12);
      await user.updateOne({
        password: crypted_password,
      });
      return res.status(200).json({
        message:
          "ما متوجه شدیم که شما از طریق گوگل وارد حساب خود می‌شوید برای همین این رمز عبور و برای ورود به حساب خود در آینده در نظر می‌گیریم",
      });
    }

    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      await db.disconnectDb();
      return res.status(400).json({ message: "رمز عبور قدیمی اشتباه است" });
    }

    const crypted_password = await bcrypt.hash(password, 12);
    await user.updateOne({
      password: crypted_password,
    });

    await db.disconnectDb();
    res.json({ message: "رمز عبور با موفقیت تغییر یافت" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
module.exports.changePassword = changePassword;

const updateProfile = async (req, res) => {
  try {
    const { id, name, email } = req.body;
    const user = await User.findByIdAndUpdate(id, { name, email });
    return res.json({
      message: "اطلاعات پروفایل با موفقیت به روز رسانی شد",
      user: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports.updateProfile = updateProfile;

const saveAddresses = async (req, res) => {
  try {
    const { address } = req.body;
    let user = await User.findById(
      jwt.verify(
        req.headers?.authorization?.split(" ")[1],
        process.env.TOKEN_SECRET
      )._id
    );
    await user.updateOne({
      $push: {
        address: address,
      },
    });
    user = await User.findById(
      jwt.verify(
        req.headers?.authorization?.split(" ")[1],
        process.env.TOKEN_SECRET
      )._id
    );
    return res.status(201).json({ addresses: user.address });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
module.exports.saveAddresses = saveAddresses;

const saveCart = async (req, res) => {
  try {
    const { cart } = req.body;
    let products = [];
    let user = await User.findById(
      jwt.verify(
        req.headers?.authorization?.split(" ")[1],
        process.env.TOKEN_SECRET
      )._id
    );
    let existing_cart = await Cart.findOne({ user: user._id });
    if (existing_cart) {
      await Cart.deleteOne({ _id: existing_cart._id });
    }
    for (let i = 0; i < cart.length; i++) {
      let dbProduct = await Product.findById(cart[i]._id).lean();
      let subProduct = dbProduct.subProducts[cart[i].style];
      let tempProduct = {};
      tempProduct.name = dbProduct.name;
      tempProduct.product = dbProduct._id;
      tempProduct.color = {
        color: cart[i].color.color,
        image: cart[i].color.image,
      };
      tempProduct.image = subProduct.images[0];
      tempProduct.qty = Number(cart[i].qty);
      tempProduct.size = cart[i].size;
      let price = Number(
        subProduct.sizes.find((p) => p.size == cart[i].size).price
      );
      tempProduct.price =
        subProduct.discount > 0
          ? (price - price / Number(subProduct.discount)).toFixed(0)
          : price.toFixed(0);

      products.push(tempProduct);
    }
    let cartTotal = 0;

    for (let i = 0; i < products.length; i++) {
      cartTotal = cartTotal + products[i].price * products[i].qty;
    }
    await new Cart({
      products,
      cartTotal: cartTotal.toFixed(0),
      user: user._id,
    }).save();
    return res
      .status(200)
      .json({ message: "محصول در داده های سبد خرید ذخیره شد" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
module.exports.saveCart = saveCart;
