/* external import */
const jwt = require("jsonwebtoken");

function token({ _id, name, email, role, status }) {
  // grab specific user info to generate jwt token
  const accessToken = jwt.sign(
    {
      _id: _id,
      name: name,
      email: email,
      role: role,
      status: status,
    },
    process.env.TOKEN_SECRET
  );

  return accessToken;
}

/* export token utility */
module.exports = token;
