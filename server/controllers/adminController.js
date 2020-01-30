const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

exports.allowIfLoggedin = (req, res, next) => {
  var token = req.headers["x-access-token"];
  if (!token) {
    return res
      .status(401)
      .send({ message: "You need to be logged in to access" });
  }
  jwt.verify(token, process.env.JWT_SECRET, function(err) {
    if (err) {
      return res.status(500).send({ message: "failed to auth token" });
    }
    next();
  });
};

exports.getUsers = async (req, res, next) => {
  const users = await User.find({});
  res.status(200).send({
    data: users
  });
};

exports.deleteUser = (req, res, next) => {
  User.findByIdAndRemove(req.params.id, (err, doc) => {
    if (err) {
      return res.status(500).send({
        message: "Internal server error"
      });
    }
    res.status(200).send({
      message: "User deleted successfully",
      data: doc
    });
  });
};
