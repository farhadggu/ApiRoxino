const User = require("../models/User");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const token = require("../utils/token.util");

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

const loginUser = async (req, res) => {
  try {
    const data = req.body;
    const result = await User.findOne({ email: data.email });

    if (!result) {
      return res.status(400).json({ message: "اطلاعات وارد شده نادرست می باشد" });
    }

    const isPasswordValid = await bcrypt.compare(data.password, result.password);
    
    console.log(isPasswordValid)

    if (!isPasswordValid) {
      return res.status(400).json({ message: "اطلاعات وارد شده نادرست می باشد" });
    }

    const accessToken = token(result);

    console.log("access", accessToken)

    return res
      .status(200)
      .json({ message: "شما با موفقیت وارد شدید", token: accessToken });
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
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
