const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  const bearToken = req.headers["authorization"];
  if (!bearToken) {
    const error = new Error("Not Authenticated");
    error.statusCode = 401;
    throw error;
  }

  const bearer = bearToken.split(" ");
  const token = bearer[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  next();
};
