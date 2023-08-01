/**
 * Title: Initial segment of this project
 * Description: All application level tasks execute here
 * Author: Hasibul Islam
 * Date: 10/03/2023
 */

/* external imports */
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
require("dotenv").config();

/* router level imports */
const userRoute = require("./routes/UserRoute");
const productRoute = require("./routes/ProductRoute");
const categroyRoute = require("./routes/CategoryRoute");
const subCategoryRoute = require("./routes/SubCategoryRoute");
const CouponRoute = require("./routes/CouponRoute");
const SettingsRoute = require("./routes/SettingsRoute");
const OrderRoute = require("./routes/OrderRoute");
const AdminRoute = require("./routes/AdminRoute");

/* application level connection */
const app = express();

/* middleware connections */
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(cookieParser());
app.use(express.json());

/* router level connections */
app.use("/api", userRoute);
app.use("/api", productRoute);
app.use("/api", categroyRoute);
app.use("/api", subCategoryRoute);
app.use("/api", CouponRoute);
app.use("/api", SettingsRoute);
app.use("/api", OrderRoute);
app.use("/api/admin", AdminRoute);

/* connection establishment */
app.get("/", (req, res, next) => {
  try {
    res.status(200).json({
      acknowledgement: true,
      message: "OK",
      description: "The request is OK and fetch successful request",
      data: "Ciseco E-Commerce server connection establish successfully",
    });
  } catch (err) {
    next(err);
  } finally {
    console.log(`URL: ${req.url} || Method: ${req.method}`);
  }
});

/* export application */
module.exports = app;

/**
 * How to fix: "error fsevents@2.0.7: The platform "linux" is incompatible with this module."
 * https://stackoverflow.com/questions/57082249/how-to-fix-error-fsevents2-0-7-the-platform-linux-is-incompatible-with-thi
 */
