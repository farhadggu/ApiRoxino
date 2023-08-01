const express = require("express")
const router = express()
const { check } = require("express-validator")

const UserCtrl = require("../controllers/UserCtrl")
const User = require("../models/User")
const verify = require("../middleware/verify.middleware")

router.get("/users", verify, UserCtrl.getAllUsers)
router.get("/user", verify, UserCtrl.getUser)

router.post("/signup", UserCtrl.newUser)
router.post("/otp-code", UserCtrl.otpCodeUser)
router.post("/login", UserCtrl.loginUser)

router.post("update-user/:id", [
  check("username", "تعداد کاراکتر بین 8 تا 20 باید باشد").isLength({ min:8, max:20 }),
  check("username", "لطفا نام کاربری دیگری انتخاب کنید").custom(value => {
    return User.find({
      username: value
    }).then(user => {
      if (user.length > 1) {
        throw("لطفا نام کاربری دیگری انتخاب کنید")
      }
    })
  }),
  check("email", "لطفا ایمیل دیگری انتخاب کنید").custom(value => {
    return User.find({
      email: value
    }).then(user => {
      if (user.length > 1) {
        throw("لطفا ایمیل دیگری انتخاب کنید")
      }
    })
  })
], UserCtrl.updateUser)

router.post("update-mini-user/:id", [
  check("username", "تعداد کاراکتر بین 8 تا 20 باید باشد").isLength({ min:8, max:20 }),
  check("username", "لطفا نام کاربری دیگری انتخاب کنید").custom(value => {
    return User.find({
      username: value
    }).then(user => {
      if (user.length > 1) {
        throw("لطفا نام کاربری دیگری انتخاب کنید")
      }
    })
  }),
  check("email", "لطفا ایمیل دیگری انتخاب کنید").custom(value => {
    return User.find({
      email: value
    }).then(user => {
      if (user.length > 1) {
        throw("لطفا ایمیل دیگری انتخاب کنید")
      }
    })
  })
], UserCtrl.updateMiniUser)

router.post("/delete-user/:id", UserCtrl.deleteUser)

router.get("/get-user/:id", UserCtrl.getOneUserById)

router.post("/search-user", UserCtrl.searchUser)

router.get("/addresses", UserCtrl.getAllAddresses)

router.put("/manage-address", UserCtrl.createOrUpdateAddresses)

router.delete("/delete-addresse/:id", UserCtrl.deleteAddress)

router.get("/wishlists", UserCtrl.getAllWishlists)

router.put("/wishlist", UserCtrl.createOrUpdateWishlist)

router.delete("/wishlist/:id", UserCtrl.deleteWishlist)

router.put("/change-password", UserCtrl.changePassword)

router.put("/update-profile", UserCtrl.updateProfile)

router.post("/save-address", verify, UserCtrl.saveAddresses)

router.post("/save-cart", verify, UserCtrl.saveCart)

module.exports = router;