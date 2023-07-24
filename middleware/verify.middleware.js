
/* external imports */
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

async function verify(req, res, next) {
  console.log(req.cookies.access_token)
  // console.log(req.headers.authorization);
  try {
    // catch the token from the user's header
    // const token = req.headers?.authorization?.split(" ")[1];

    // If no token is found, return an unauthorized response
    if (!req.cookies.access_token) {
      return res.status(401).json({
        acknowledgement: false,
        message: "Unauthorized",
        description:
          "The client request has not been completed because it lacks valid authentication credentials",
        data: "No token found to persist an existing user for a long time",
      });
    }

    // Fetch the token and set the user on the request
    const decoded = await promisify(jwt.verify)(req.cookies.access_token, process.env.TOKEN_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    next(error);
    return res.status(401).json({
      acknowledgement: false,
      message: "Unauthorized",
      description:
        "The client request has not been completed because it lacks valid authentication credentials",
      data: "No token found to persist an existing user for a long time",
    });
  }
}

module.exports = verify;
